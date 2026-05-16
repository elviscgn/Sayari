import { ALL_ITEMS, ITEMS } from '../buildings.js';
import { getBuyPrice, getSellPrice, playerBuy, playerSell, formatPrice } from '../economy/market.js';

let chartCanvas = null;
let chartCtx = null;
let animFrame = null;

function renderMarketChart(ctx) {
  if (!chartCanvas || !chartCtx) return;
  const m = ctx.market;
  if (!m) return;
  const item = m.selectedItem || ALL_ITEMS[0];
  const hist = m.history[item];
  const color = ITEMS[item]?.color || '#8a7f72';

  const w = chartCanvas.width;
  const h = chartCanvas.height;
  const c = chartCtx;
  c.clearRect(0, 0, w, h);

  c.fillStyle = 'rgba(255,255,255,0.03)';
  c.fillRect(0, 0, w, h);

  if (!hist || hist.length < 2) {
    c.fillStyle = '#5a4f42';
    c.font = '11px system-ui, sans-serif';
    c.textAlign = 'center';
    c.fillText('awaiting data...', w / 2, h / 2 + 4);
    return;
  }

  const prices = hist.map(h => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const padL = 32;
  const padR = 10;
  const plotW = w - padL - padR;
  const plotH = h - padL - padR;

  const numLines = 5;
  c.font = '9px system-ui, sans-serif';
  c.textAlign = 'right';
  c.strokeStyle = 'rgba(255,255,255,0.04)';
  c.lineWidth = 1;
  for (let i = 0; i <= numLines; i++) {
    const y = h - padR - (i / numLines) * plotH;
    const val = min + (i / numLines) * range;
    c.beginPath();
    c.moveTo(padL, y);
    c.lineTo(w - padR, y);
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.25)';
    c.textAlign = 'right';
    c.fillText(formatPrice(val), padL - 6, y + 3);
  }

  const points = prices.map((p, i) => ({
    x: (i / (prices.length - 1)) * plotW + padL,
    y: h - padR - ((p - min) / range) * plotH,
  }));

  const lineColor = prices[prices.length - 1] >= prices[0] ? '#4caf50' : '#e53935';

  const grad = c.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, lineColor + '4D');
  grad.addColorStop(1, lineColor + '02');

  c.beginPath();
  c.moveTo(points[0].x, h - padR);
  c.lineTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    c.lineTo(points[i].x, points[i].y);
  }
  c.lineTo(points[points.length - 1].x, h - padR);
  c.closePath();
  c.fillStyle = grad;
  c.fill();

  const currentPrice = prices[prices.length - 1];
  const currentY = h - padR - ((currentPrice - min) / range) * plotH;
  c.setLineDash([3, 3]);
  c.strokeStyle = lineColor + '66';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(padL, currentY);
  c.lineTo(w - padR, currentY);
  c.stroke();
  c.setLineDash([]);

  c.beginPath();
  c.strokeStyle = lineColor;
  c.lineWidth = 1.5;
  c.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    c.lineTo(points[i].x, points[i].y);
  }
  c.stroke();

  c.fillStyle = 'rgba(255,255,255,0.2)';
  c.font = '8px system-ui, sans-serif';
  c.textAlign = 'right';
  c.fillText('now', w - padR, h - 3);

  const lastP = points[points.length - 1];
  c.beginPath();
  c.arc(lastP.x, lastP.y, 2.5, 0, Math.PI * 2);
  c.fillStyle = lineColor;
  c.fill();
}

function formatChange(prices, item) {
  if (!prices || !prices[item] || prices[item].length < 2) return { text: '--', cls: '', arrow: '' };
  const hist = prices[item];
  const first = hist[0].price;
  const last = hist[hist.length - 1].price;
  const pct = ((last - first) / first) * 100;
  const arrow = pct >= 0 ? '\u25B2' : '\u25BC';
  const cls = pct >= 0 ? 'pos' : 'neg';
  return { text: (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%', cls, arrow };
}

function formatVolume(tradesThisTick) {
  if (!tradesThisTick || tradesThisTick.length === 0) return '0';
  const total = tradesThisTick.reduce((s, t) => s + t.qty, 0);
  if (total >= 1000) return (total / 1000).toFixed(1) + 'k';
  return total.toString();
}

export function init(ctx) {
  const mpEl = document.getElementById('market-popover');
  const mpPanel = document.getElementById('mp-panel');
  const mpItems = document.getElementById('mp-items');
  const mpDetailName = document.getElementById('mp-detail-name');
  const mpDetailPrice = document.getElementById('mp-detail-price');
  const mpDetailChange = document.getElementById('mp-detail-change');
  const mpDetailBase = document.getElementById('mp-detail-base');
  const mpBuyQty = document.getElementById('mp-buy-qty');
  const mpSellQty = document.getElementById('mp-sell-qty');
  const mpBuyTotal = document.getElementById('mp-buy-total');
  const mpSellTotal = document.getElementById('mp-sell-total');
  const mpBuyBtn = document.getElementById('mp-buy-btn');
  const mpSellBtn = document.getElementById('mp-sell-btn');
  const mpCreditsEl = document.getElementById('mp-credits');

  chartCanvas = document.getElementById('mp-chart');
  chartCtx = chartCanvas ? chartCanvas.getContext('2d') : null;

  ctx.marketUI = { mpEl, mpPanel, mpItems, mpDetailName, mpDetailPrice, mpDetailChange, mpDetailBase, mpBuyQty, mpSellQty, mpBuyTotal, mpSellTotal, mpBuyBtn, mpSellBtn, mpCreditsEl };

  mpEl.addEventListener('close', () => { if (ctx.market) ctx.market.open = false; stopChartAnim(); });
  document.getElementById('mp-close').addEventListener('click', () => closeMarket(ctx));

  mpBuyBtn.addEventListener('click', e => {
    e.stopPropagation();
    const qty = parseInt(mpBuyQty.value) || 1;
    if (playerBuy(ctx, ctx.market.selectedItem, qty)) {
      renderMarket(ctx);
      ctx.showToast('Bought ' + qty + 'x ' + (ITEMS[ctx.market.selectedItem]?.name || ctx.market.selectedItem));
    } else {
      ctx.sfxError();
      ctx.showToast('Not enough credits');
    }
  });

  mpSellBtn.addEventListener('click', e => {
    e.stopPropagation();
    const qty = parseInt(mpSellQty.value) || 1;
    if (playerSell(ctx, ctx.market.selectedItem, qty)) {
      renderMarket(ctx);
      ctx.showToast('Sold ' + qty + 'x ' + (ITEMS[ctx.market.selectedItem]?.name || ctx.market.selectedItem));
    } else {
      ctx.sfxError();
      ctx.showToast('Not enough items');
    }
  });

  mpBuyQty.addEventListener('input', () => updateTradeTotals(ctx));
  mpSellQty.addEventListener('input', () => updateTradeTotals(ctx));

  document.querySelectorAll('.mp-btn-max').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const side = btn.dataset.side;
      const item = ctx.market.selectedItem;
      if (!item) return;
      if (side === 'buy') {
        const price = getBuyPrice(ctx.market, item);
        const maxAfford = Math.floor(ctx.playerStats.credits / price);
        ctx.marketUI.mpBuyQty.value = Math.max(1, maxAfford);
      } else {
        const owned = ctx.playerInventory[item] || 0;
        ctx.marketUI.mpSellQty.value = Math.max(1, owned);
      }
      updateTradeTotals(ctx);
    });
  });

  document.querySelectorAll('.mp-btn-qty').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const side = btn.dataset.side;
      const qty = parseInt(btn.dataset.qty);
      if (side === 'buy') {
        ctx.marketUI.mpBuyQty.value = qty;
      } else {
        ctx.marketUI.mpSellQty.value = qty;
      }
      updateTradeTotals(ctx);
    });
  });
}

function updateTradeTotals(ctx) {
  const ui = ctx.marketUI;
  if (!ui || !ctx.market) return;
  const item = ctx.market.selectedItem;
  const buyQty = parseInt(ui.mpBuyQty.value) || 1;
  const sellQty = parseInt(ui.mpSellQty.value) || 1;
  ui.mpBuyTotal.textContent = formatPrice(getBuyPrice(ctx.market, item) * buyQty);
  ui.mpSellTotal.textContent = formatPrice(getSellPrice(ctx.market, item) * sellQty);
}

function renderItemRow(item, prices, ctx) {
  const row = document.createElement('div');
  const change = formatChange(prices._history, item);
  let cls = 'mp-item-row' + (ctx.market.selectedItem === item ? ' selected' : '');
  if (change.text !== '--') cls += ' ' + change.cls;
  row.className = cls;
  row.dataset.item = item;

  const itemDef = ITEMS[item];
  const price = prices[item];
  const buyP = getBuyPrice(ctx.market, item);
  const sellP = getSellPrice(ctx.market, item);

  const icon = itemDef && itemDef.icon
    ? '<img class="mp-item-icon" src="' + itemDef.icon + '" alt="">'
    : '<span class="mp-item-icon" style="background:' + (itemDef ? itemDef.color : '#666') + ';border-radius:3px;width:16px;height:16px;display:inline-block;vertical-align:middle;"></span>';

  const name = itemDef ? itemDef.name : item;

  const changeHtml = change.text !== '--'
    ? '<span class="mp-change ' + change.cls + '">' + change.arrow + ' ' + change.text + '</span>'
    : '<span class="mp-change">--</span>';

  const owned = ctx.playerInventory[item] || 0;

  row.innerHTML = `
    <div class="mp-item-info">
      ${icon}
      <span class="mp-item-name">${name}</span>
    </div>
    <span class="mp-item-owned">${owned > 0 ? '×' + owned : '<span style="opacity:0.3">×0</span>'}</span>
    <div class="mp-item-price-col">${formatPrice(price)}</div>
    ${changeHtml}
    <div class="mp-item-actions">
      <button class="mp-btn-buy" data-item="${item}">BUY</button>
      <button class="mp-btn-sell" data-item="${item}">SELL</button>
    </div>
  `;

  row.addEventListener('click', e => {
    if (e.target.closest('.mp-btn-buy') || e.target.closest('.mp-btn-sell')) return;
    ctx.market.selectedItem = item;
    ctx.marketUI.mpBuyQty.value = 1;
    ctx.marketUI.mpSellQty.value = 1;
    renderMarket(ctx);
  });

  row.querySelector('.mp-btn-buy').addEventListener('click', e => {
    e.stopPropagation();
    ctx.market.selectedItem = item;
    ctx.marketUI.mpBuyQty.value = 1;
    ctx.marketUI.mpSellQty.value = 1;
    selectItem(ctx);
    ctx.marketUI.mpBuyQty.focus();
    ctx.marketUI.mpBuyQty.select();
  });

  row.querySelector('.mp-btn-sell').addEventListener('click', e => {
    e.stopPropagation();
    ctx.market.selectedItem = item;
    ctx.marketUI.mpBuyQty.value = 1;
    ctx.marketUI.mpSellQty.value = 1;
    selectItem(ctx);
    ctx.marketUI.mpSellQty.focus();
    ctx.marketUI.mpSellQty.select();
  });

  return row;
}

function selectItem(ctx) {
  renderMarket(ctx);
}

export function renderMarket(ctx) {
  const m = ctx.market;
  if (!m) return;
  const ui = ctx.marketUI;
  if (!ui) return;

  const item = m.selectedItem || ALL_ITEMS[0];
  const itemDef = ITEMS[item];
  const price = m.prices[item];
  const change = formatChange(m.history, item);
  const buyP = getBuyPrice(m, item);
  const sellP = getSellPrice(m, item);

  ui.mpCreditsEl.innerHTML = '\u00A2 ' + Math.floor(ctx.playerStats.credits).toLocaleString();

  ui.mpItems.innerHTML = '';
  ALL_ITEMS.forEach(k => {
    if (itemDef && m.prices[k] !== undefined) {
      ui.mpItems.appendChild(renderItemRow(k, m.prices, ctx));
    }
  });

  const icon = itemDef && itemDef.icon
    ? '<img class="mp-detail-icon" src="' + itemDef.icon + '" alt="">'
    : '';
  ui.mpDetailName.innerHTML = icon + ' ' + (itemDef ? itemDef.name : item);
  ui.mpDetailPrice.textContent = formatPrice(price);
  const refPrice = ctx.market.referencePrices?.[item];
  ui.mpDetailBase.textContent = refPrice !== undefined ? 'ref: ' + formatPrice(refPrice) : '';
  ui.mpDetailChange.innerHTML = change.text !== '--'
    ? '<span class="mp-change ' + change.cls + '">' + change.arrow + ' ' + change.text + '</span>'
    : '<span class="mp-change">--</span>';

  const buyQty = parseInt(ui.mpBuyQty.value) || 1;
  const sellQty = parseInt(ui.mpSellQty.value) || 1;
  const buyTotal = buyP * buyQty;
  const sellTotal = sellP * sellQty;
  ui.mpBuyTotal.textContent = formatPrice(buyTotal);
  ui.mpSellTotal.textContent = formatPrice(sellTotal);
  document.getElementById('mp-buy-price').textContent = formatPrice(buyP);
  document.getElementById('mp-sell-price').textContent = formatPrice(sellP);

  const owned = ctx.playerInventory[item] || 0;
  ui.mpSellBtn.textContent = 'SELL (' + owned + ')';
  ui.mpSellBtn.disabled = owned === 0;

  const canAfford = ctx.playerStats.credits >= buyTotal;
  ui.mpBuyBtn.classList.toggle('insufficient', !canAfford);

  let insufEl = ui.mpBuyBtn.parentElement.querySelector('.mp-trade-insufficient');
  if (!canAfford) {
    if (!insufEl) {
      insufEl = document.createElement('span');
      insufEl.className = 'mp-trade-insufficient';
      insufEl.textContent = 'insufficient funds';
      ui.mpBuyBtn.parentElement.insertBefore(insufEl, ui.mpBuyBtn);
    }
  } else if (insufEl) {
    insufEl.remove();
  }

  if (chartCanvas) {
    renderMarketChart(ctx);
  }
}

export function openMarket(ctx) {
  if (!ctx.market) return;
  ctx.market.open = true;
  ctx.marketUI.mpEl.showModal();
  renderMarket(ctx);
  startChartAnim(ctx);
}

export function closeMarket(ctx) {
  if (!ctx.market) return;
  ctx.market.open = false;
  ctx.marketUI.mpEl.close();
  stopChartAnim();
}

function startChartAnim(ctx) {
  stopChartAnim();
  function loop() {
    renderMarketChart(ctx);
    animFrame = requestAnimationFrame(loop);
  }
  animFrame = requestAnimationFrame(loop);
}

function stopChartAnim() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
}
