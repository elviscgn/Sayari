import { ALL_ITEMS, ITEMS } from '../buildings.js';
import { getSellPrice, playerSell } from '../economy/market.js';

let ctx;
let cpEl, cpInput, cpSuggestions;
let selectedIdx = -1;
let currentItems = [];
let currentCmd = '';

function filterItems(query) {
  if (!query) return [];
  const lower = query.toLowerCase();
  return ALL_ITEMS.filter(k => {
    const name = (ITEMS[k]?.name || k).toLowerCase();
    return name.includes(lower);
  });
}

function renderSuggestions() {
  cpSuggestions.innerHTML = '';
  if (currentItems.length === 0) {
    cpSuggestions.style.display = 'none';
    return;
  }
  cpSuggestions.style.display = 'block';
  currentItems.forEach((k, i) => {
    const def = ITEMS[k];
    const name = def ? def.name : k;
    const owned = (ctx && ctx.playerInventory[k]) || 0;
    const row = document.createElement('div');
    row.className = 'cp-suggestion' + (i === selectedIdx ? ' selected' : '');
    row.dataset.item = k;
    const icon = def && def.icon
      ? '<img class="cp-item-icon" src="' + def.icon + '" alt="">'
      : '<span class="cp-item-icon" style="background:' + (def ? def.color : '#666') + '"></span>';
    const ownedHtml = currentCmd !== 'give' && owned > 0
      ? '<span class="cp-item-owned">×' + owned + '</span>'
      : '';
    row.innerHTML = icon + '<span class="cp-item-name">' + name + '</span>' + ownedHtml;
    row.addEventListener('click', e => {
      e.stopPropagation();
      selectItem(k);
    });
    row.addEventListener('mouseenter', () => { selectedIdx = i; highlightSelected(); });
    cpSuggestions.appendChild(row);
  });
}

function highlightSelected() {
  const rows = cpSuggestions.querySelectorAll('.cp-suggestion');
  rows.forEach((r, i) => r.classList.toggle('selected', i === selectedIdx));
}

function getAmountFromInput() {
  const parts = cpInput.value.trim().split(/\s+/);
  if (parts.length >= 3 && currentCmd !== 'sellall') {
    const n = parseInt(parts[2]);
    if (!isNaN(n) && n > 0) return n;
  }
  return 1;
}

function selectItem(item) {
  const amount = getAmountFromInput();
  if (currentCmd === 'give') {
    giveItem(item, amount);
  } else if (currentCmd === 'sell') {
    sellItem(item, amount);
  } else if (currentCmd === 'sellall') {
    sellAllItem(item);
  }
  cpEl.close();
}

function giveItem(item, qty) {
  if (!ctx) return;
  const def = ITEMS[item];
  const name = def ? def.name : item;
  ctx.addItems({ [item]: qty });
  ctx.showToast('Gave ' + qty + 'x ' + name);
}

function sellItem(item, qty) {
  if (!ctx || !ctx.market) return;
  const owned = ctx.playerInventory[item] || 0;
  const q = Math.min(qty, owned);
  if (q <= 0) { ctx.showToast('No ' + (ITEMS[item]?.name || item) + ' to sell'); return; }
  playerSell(ctx, item, q);
  const def = ITEMS[item];
  ctx.showToast('Sold ' + q + 'x ' + (def ? def.name : item));
}

function sellAllItem(item) {
  if (!ctx || !ctx.market) return;
  const owned = ctx.playerInventory[item] || 0;
  if (owned <= 0) { ctx.showToast('No ' + (ITEMS[item]?.name || item) + ' to sell'); return; }
  playerSell(ctx, item, owned);
  const def = ITEMS[item];
  ctx.showToast('Sold all ' + owned + 'x ' + (def ? def.name : item));
}

function parseAndSuggest() {
  const val = cpInput.value.trim();
  const parts = val.split(/\s+/);
  const cmd = parts[0] || '';

  if (!['give', 'sell', 'sellall'].includes(cmd)) {
    currentCmd = '';
    currentItems = [];
    selectedIdx = -1;
    renderSuggestions();
    return;
  }

  currentCmd = cmd;
  const query = parts.length >= 2 ? parts[1] : '';
  currentItems = filterItems(query);
  if (currentItems.length > 0) {
    const exact = currentItems.find(k => (ITEMS[k]?.name || k).toLowerCase() === query.toLowerCase());
    if (exact) {
      currentItems = [exact];
    }
  }
  selectedIdx = currentItems.length > 0 ? 0 : -1;
  renderSuggestions();
}

function completeWithItem(item) {
  const parts = cpInput.value.trim().split(/\s+/);
  const cmd = parts[0];
  const amount = cmd === 'sellall' ? '' : parts.length >= 3 ? ' ' + parts.slice(2).join(' ') : '';
  cpInput.value = cmd + ' ' + item + amount;
  parseAndSuggest();
}

export function init(c) {
  ctx = c;
  cpEl = document.getElementById('command-palette');
  cpInput = document.getElementById('cp-input');
  cpSuggestions = document.getElementById('cp-suggestions');

  if (!cpEl || !cpInput || !cpSuggestions) return;

  cpInput.addEventListener('input', parseAndSuggest);

  cpInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const parts = cpInput.value.trim().split(/\s+/);
      if (parts.length >= 2 && currentItems.length > 0) {
        selectItem(currentItems[selectedIdx >= 0 ? selectedIdx : 0]);
      } else if (parts.length >= 2 && currentCmd === 'give') {
        const qty = parts.length >= 3 ? parseInt(parts[2]) || 1 : 1;
        giveItem(parts[1], qty);
        cpEl.close();
      } else if (parts.length >= 2 && currentCmd === 'sell') {
        const qty = parts.length >= 3 ? parseInt(parts[2]) || 1 : 1;
        sellItem(parts[1], qty);
        cpEl.close();
      } else if (parts.length >= 2 && currentCmd === 'sellall') {
        sellAllItem(parts[1]);
        cpEl.close();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentItems.length > 0) {
        selectedIdx = (selectedIdx + 1) % currentItems.length;
        highlightSelected();
        const row = cpSuggestions.children[selectedIdx];
        if (row) row.scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentItems.length > 0) {
        selectedIdx = (selectedIdx - 1 + currentItems.length) % currentItems.length;
        highlightSelected();
        const row = cpSuggestions.children[selectedIdx];
        if (row) row.scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Escape') {
      cpEl.close();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (currentItems.length > 0) {
        completeWithItem(currentItems[selectedIdx >= 0 ? selectedIdx : 0]);
      }
    }
  });

  cpEl.addEventListener('close', () => {
    cpInput.value = '';
    currentItems = [];
    currentCmd = '';
    selectedIdx = -1;
    renderSuggestions();
  });

  cpEl.addEventListener('click', e => {
    if (e.target === cpEl) cpEl.close();
  });

  cpEl.addEventListener('open', () => {
    cpInput.value = '';
    currentItems = [];
    currentCmd = '';
    selectedIdx = -1;
    renderSuggestions();
    cpInput.focus();
  });
}

export function openCommandPalette() {
  if (!cpEl) return;
  if (cpEl.open) { cpEl.close(); return; }
  cpEl.showModal();
}

export function closeCommandPalette() {
  if (!cpEl) return;
  cpEl.close();
}
