import { ALL_ITEMS, ITEMS } from '../buildings.js';

export const BASE_PRICES = {
  wood: 2, stone: 3, iron_ore: 5, copper_ore: 6, vibranium_ore: 50,
  scrap: 4, coal: 8, metal: 15, electronics: 80, vibranium: 200,
  refined_stone: 10, recycled: 12, refined_metal: 40, refined_vib: 500, circuit: 300,
};

const TRADER_STRATEGIES = ['random', 'trend', 'value', 'balanced'];

let traderIdCounter = 0;

function createTrader(config) {
  const id = traderIdCounter++;
  const strategy = TRADER_STRATEGIES[Math.floor(Math.random() * TRADER_STRATEGIES.length)];
  const capital = config.traderCapital * (0.5 + Math.random());
  const riskTolerance = 0.3 + Math.random() * 0.7;
  const tradeProb = 0.15 + Math.random() * 0.25;
  const inventory = {};
  ALL_ITEMS.forEach(k => inventory[k] = Math.floor(Math.random() * 5));
  return { id, strategy, capital, riskTolerance, tradeProb, inventory, totalTrades: 0, pnl: 0 };
}

function traderDecide(trader, prices, tick, config) {
  if (Math.random() > trader.tradeProb) return null;
  const item = ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)];
  const price = prices[item];
  if (!price || price <= 0) return null;

  let bias = 0;
  if (trader.strategy === 'trend') {
    const hist = prices._history?.[item];
    if (hist && hist.length > 5) {
      const recent = hist.slice(-6);
      const change = (recent[recent.length - 1] - recent[0]) / recent[0];
      bias = change * 2;
    }
  } else if (trader.strategy === 'value') {
    const ref = prices._reference?.[item] || BASE_PRICES[item];
    const deviation = (ref - price) / ref;
    bias = deviation * 3;
  } else if (trader.strategy === 'balanced') {
    const ref = prices._reference?.[item] || BASE_PRICES[item];
    const deviation = (ref - price) / ref;
    bias = deviation * 1.5 + (Math.random() - 0.5) * 0.2;
  } else {
    bias = (Math.random() - 0.5) * 0.4;
  }

  bias = Math.max(-1, Math.min(1, bias));
  const maxQty = Math.max(1, Math.floor(Math.min(trader.capital / price / 2, 3 + Math.random() * 5 * trader.riskTolerance)));
  const qty = Math.max(1, Math.floor(maxQty * Math.abs(bias)));

  if (bias > 0.05) {
    const cost = qty * price * 1.025;
    if (trader.capital >= cost) {
      trader.capital -= cost;
      trader.inventory[item] = (trader.inventory[item] || 0) + qty;
      trader.totalTrades++;
      return { traderId: trader.id, type: 'buy', item, qty, price: price * 1.025 };
    }
  } else if (bias < -0.05) {
    const held = trader.inventory[item] || 0;
    if (held >= qty) {
      const revenue = qty * price * 0.975;
      trader.inventory[item] = held - qty;
      trader.capital += revenue;
      trader.pnl += revenue - qty * price;
      trader.totalTrades++;
      return { traderId: trader.id, type: 'sell', item, qty, price: price * 0.975 };
    }
  }
  return null;
}

function getMarketDepth(traders, config) {
  const active = traders.filter(t => t.capital > 10);
  const avgCap = active.length > 0
    ? active.reduce((s, t) => s + t.capital, 0) / active.length
    : config.traderCapital;
  return Math.max(1, Math.max(active.length, 1) * avgCap);
}

function getSpread(market) {
  const recent = (market.tradesThisTick ? market.tradesThisTick.length : 0) + 1;
  const s = market.config.baseSpread / Math.sqrt(recent);
  return Math.max(0.01, Math.min(0.15, s));
}

export function initMarket(ctx, userConfig) {
  const config = {
    numTraders: 50,
    tickInterval: 2000,
    baseSpread: 0.05,
    traderCapital: 800,
    ...userConfig,
  };

  traderIdCounter = 0;

  const prices = {};
  const history = {};
  const referencePrices = {};
  ALL_ITEMS.forEach(k => {
    if (BASE_PRICES[k] !== undefined) {
      const noise = 1 + (Math.random() - 0.5) * 0.1;
      prices[k] = Math.max(0.01, BASE_PRICES[k] * noise);
      history[k] = [{ time: performance.now(), price: prices[k] }];
      referencePrices[k] = BASE_PRICES[k];
    }
  });
  prices._history = history;
  prices._reference = referencePrices;

  const traders = [];
  for (let i = 0; i < config.numTraders; i++) {
    traders.push(createTrader(config));
  }

  ctx.market = {
    config, prices, history, traders, referencePrices,
    tickCount: 0,
    lastTickTime: 0,
    totalTrades: 0,
    tradesThisTick: [],
    open: false,
    selectedItem: ALL_ITEMS[0],
    buyQty: 1,
    sellQty: 1,
  };
}

export function tickMarket(ctx) {
  const m = ctx.market;
  if (!m) return;
  const now = performance.now();
  if (m.tickCount > 0 && now - m.lastTickTime < m.config.tickInterval) return;
  m.lastTickTime = now;
  m.tickCount++;
  m.tradesThisTick = [];

  const buyVolumes = {};
  const sellVolumes = {};

  ALL_ITEMS.forEach(k => { buyVolumes[k] = 0; sellVolumes[k] = 0; });

  const traders = m.traders.filter(t => t.capital > 10);
  if (traders.length < 5) {
    const spawnCount = Math.min(10, m.config.numTraders - m.traders.length);
    for (let i = 0; i < spawnCount; i++) {
      m.traders.push(createTrader(m.config));
    }
  }

  for (const trader of traders) {
    const order = traderDecide(trader, m.prices, m.tickCount, m.config);
    if (order) {
      m.tradesThisTick.push(order);
      if (order.type === 'buy') buyVolumes[order.item] = (buyVolumes[order.item] || 0) + order.qty;
      else sellVolumes[order.item] = (sellVolumes[order.item] || 0) + order.qty;
      m.totalTrades++;
    }
  }

  const depth = getMarketDepth(traders, m.config);

  const alpha = m.config.referenceAlpha || 0.002;

  for (const k of ALL_ITEMS) {
    if (BASE_PRICES[k] === undefined) continue;
    const bv = buyVolumes[k] || 0;
    const sv = sellVolumes[k] || 0;
    const net = bv - sv;

    const priceImpact = net * m.prices[k] * 0.1 / depth;
    m.prices[k] = Math.max(0.01, m.prices[k] + priceImpact);

    m.referencePrices[k] = m.referencePrices[k] * (1 - alpha) + m.prices[k] * alpha;

    if (!m.history[k]) m.history[k] = [];
    m.history[k].push({ time: now, price: m.prices[k] });
    if (m.history[k].length > 500) m.history[k].splice(0, 100);
  }
}

export function getBuyPrice(market, item) {
  return market.prices[item] * (1 + getSpread(market) / 2);
}

export function getSellPrice(market, item) {
  return market.prices[item] * (1 - getSpread(market) / 2);
}

export function playerBuy(ctx, item, qty) {
  const m = ctx.market;
  if (!m || !item || qty < 1) return false;
  const price = getBuyPrice(m, item);
  const cost = price * qty;
  if (ctx.playerStats.credits < cost) return false;
  ctx.playerStats.credits -= cost;
  ctx.addItems({ [item]: qty });
  m.totalTrades++;
  const depth = getMarketDepth(m.traders, m.config);
  const impact = qty * 0.1 / depth;
  m.prices[item] = Math.max(0.01, m.prices[item] * (1 + impact));
  return true;
}

export function playerSell(ctx, item, qty) {
  const m = ctx.market;
  if (!m || !item || qty < 1) return false;
  if ((ctx.playerInventory[item] || 0) < qty) return false;
  const price = getSellPrice(m, item);
  const revenue = price * qty;
  ctx.spendItems({ [item]: qty });
  ctx.playerStats.credits += revenue;
  m.totalTrades++;
  const depth = getMarketDepth(m.traders, m.config);
  const impact = qty * 0.1 / depth;
  m.prices[item] = Math.max(0.01, m.prices[item] * (1 - impact));
  return true;
}

export function resetMarket(ctx, userConfig) {
  if (userConfig) {
    Object.assign(ctx.market.config, userConfig);
  }
  initMarket(ctx, ctx.market.config);
}

export function formatPrice(p) {
  if (p >= 1000000) return '$' + (p / 1000000).toFixed(1) + 'M';
  if (p >= 1000) return '$' + Math.floor(p).toLocaleString();
  if (p >= 10) return '$' + p.toFixed(2);
  if (p >= 1) return '$' + p.toFixed(2);
  return '$' + p.toFixed(3);
}
