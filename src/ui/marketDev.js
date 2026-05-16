import { ALL_ITEMS, ITEMS } from '../buildings.js';
import { BASE_PRICES, resetMarket, formatPrice } from '../economy/market.js';

let devChartCanvas, devChartCtx;
let devAnimFrame = null;
let devOpen = false;

function renderDevChart(ctx) {
  if (!devChartCanvas || !devChartCtx) return;
  const canvas = devChartCanvas;
  const c = devChartCtx;
  const w = canvas.width, h = canvas.height;
  c.clearRect(0, 0, w, h);

  const select = document.getElementById('dev-chart-item');
  const item = select ? select.value : 'metal';
  const hist = ctx.market.history[item];
  if (!hist || hist.length < 2) return;

  const prices = hist.map(h => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pad = 4;
  const lineColor = prices[prices.length - 1] >= prices[0] ? '#4caf50' : '#e53935';

  const pts = prices.map((p, i) => ({
    x: (i / (prices.length - 1)) * (w - pad * 2) + pad,
    y: h - ((p - min) / range) * (h - pad * 2) - pad,
  }));

  const grad = c.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, lineColor + '25');
  grad.addColorStop(1, lineColor + '01');
  c.beginPath();
  c.moveTo(pts[0].x, h);
  c.lineTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
  c.lineTo(pts[pts.length - 1].x, h);
  c.closePath();
  c.fillStyle = grad;
  c.fill();

  c.beginPath();
  c.strokeStyle = lineColor;
  c.lineWidth = 1.5;
  c.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
  c.stroke();

  const lastP = pts[pts.length - 1];
  c.beginPath();
  c.arc(lastP.x, lastP.y, 3, 0, Math.PI * 2);
  c.fillStyle = lineColor;
  c.fill();

  c.fillStyle = 'rgba(255,255,255,0.6)';
  c.font = '10px system-ui, sans-serif';
  c.textAlign = 'left';
  c.fillText(formatPrice(prices[prices.length - 1]), lastP.x + 8, lastP.y + 4);
}

function renderDevStats(ctx) {
  const m = ctx.market;
  if (!m) return;
  const active = m.traders.filter(t => t.capital > 10).length;
  document.getElementById('dev-stat-traders').textContent = active + '/' + m.traders.length;
  document.getElementById('dev-stat-trades').textContent = m.totalTrades;
  document.getElementById('dev-stat-ticks').textContent = m.tickCount;
  const vol = m.tradesThisTick.reduce((s, t) => s + t.qty, 0);
  document.getElementById('dev-stat-volume').textContent = vol;

  const tbody = document.getElementById('dev-price-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  ALL_ITEMS.forEach(k => {
    if (BASE_PRICES[k] === undefined) return;
    const price = m.prices[k];
    const ref = m.referencePrices?.[k] || BASE_PRICES[k];
    const change = m.history[k] && m.history[k].length > 1
      ? ((m.history[k][m.history[k].length - 1].price - m.history[k][0].price) / m.history[k][0].price * 100) : 0;
    const premium = ((price - ref) / ref * 100);
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + (ITEMS[k] ? ITEMS[k].name : k) + '</td>'
      + '<td class="dev-price">' + formatPrice(price) + '</td>'
      + '<td class="dev-' + (change >= 0 ? 'pos' : 'neg') + '">' + (change >= 0 ? '+' : '') + change.toFixed(1) + '%</td>'
      + '<td>' + formatPrice(ref) + '</td>'
      + '<td class="dev-' + (premium >= 0 ? 'pos' : 'neg') + '">' + (premium >= 0 ? '+' : '') + premium.toFixed(1) + '%</td>';
    tbody.appendChild(tr);
  });
}

function startDevChartLoop(ctx) {
  stopDevChartLoop();
  function loop() {
    renderDevChart(ctx);
    renderDevStats(ctx);
    devAnimFrame = requestAnimationFrame(loop);
  }
  devAnimFrame = requestAnimationFrame(loop);
}

function stopDevChartLoop() {
  if (devAnimFrame) { cancelAnimationFrame(devAnimFrame); devAnimFrame = null; }
}

export function init(ctx) {
  const devEl = document.getElementById('dev-popover');
  if (!devEl) return;

  devChartCanvas = document.getElementById('dev-chart');
  devChartCtx = devChartCanvas ? devChartCanvas.getContext('2d') : null;

  document.getElementById('dev-close').addEventListener('click', () => closeDev(ctx));

  devEl.addEventListener('close', () => { devOpen = false; stopDevChartLoop(); });

  const sliders = [
    { id: 'dev-traders', key: 'numTraders', parse: parseInt },
    { id: 'dev-spread', key: 'baseSpread', parse: parseFloat },
    { id: 'dev-capital', key: 'traderCapital', parse: parseInt },
  ];

  sliders.forEach(({ id, key, parse }) => {
    const el = document.getElementById(id);
    const valEl = document.getElementById(id + '-val');
    if (!el) return;
    el.addEventListener('input', () => {
      const v = parse(el.value);
      valEl.textContent = v;
      if (ctx.market) ctx.market.config[key] = v;
    });
  });

  const select = document.getElementById('dev-chart-item');
  if (select) {
    ALL_ITEMS.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = ITEMS[k] ? ITEMS[k].name : k;
      select.appendChild(opt);
    });
    select.value = 'metal';
    select.addEventListener('change', () => renderDevChart(ctx));
  }

  document.getElementById('dev-reset').addEventListener('click', () => {
    if (!ctx.market) return;
    resetMarket(ctx, ctx.market.config);
  });
}

export function openDev(ctx) {
  if (!ctx.market) return;
  devOpen = true;
  const el = document.getElementById('dev-popover');
  el.showModal();

  const sliders = [
    { id: 'dev-traders', key: 'numTraders', parse: parseInt },
    { id: 'dev-spread', key: 'baseSpread', parse: parseFloat },
    { id: 'dev-capital', key: 'traderCapital', parse: parseInt },
  ];

  sliders.forEach(({ id, key, parse }) => {
    const el = document.getElementById(id);
    const valEl = document.getElementById(id + '-val');
    if (!el || !ctx.market.config) return;
    el.value = ctx.market.config[key];
    valEl.textContent = ctx.market.config[key];
  });

  renderDevStats(ctx);
  startDevChartLoop(ctx);
}

export function closeDev(ctx) {
  devOpen = false;
  const el = document.getElementById('dev-popover');
  if (el) el.close();
  stopDevChartLoop();
}
