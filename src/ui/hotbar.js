import { ITEMS, ITEM_ORDER } from '../buildings.js';

export function init(ctx) {
  ctx.hotbarEl = document.getElementById('hotbar');
  document.getElementById('hint-keys').textContent = '1-' + Object.keys(ctx.TOOLS).length;
}

export function buildHotbar(ctx) {
  ctx.hotbarEl.innerHTML = '';
  ITEM_ORDER.forEach(key => {
    const item = ITEMS[key];
    const qty = ctx.playerInventory[key] || 0;
    const btn = document.createElement('div');
    btn.className = 'hb-btn';
    const swatchHtml = item.icon ? `<img class="swatch" src="${item.icon}" alt="${item.name}">` : `<span class="swatch" style="background:${item.color}"></span>`;
    btn.innerHTML = swatchHtml + `<span class="hb-label">${qty}</span>`;
    ctx.hotbarEl.appendChild(btn);
  });

  const toolIconMap = { wood_pickaxe: 'assets/wood_pickaxe.png', stone_pickaxe: 'assets/stone_pickaxe.png', metal_pickaxe: 'assets/metal.png' };
  const toolKeys = Object.keys(ctx.TOOLS);
  toolKeys.forEach((key, i) => {
    const def = ctx.TOOLS[key];
    const owned = ctx.playerTools[key] || 0;
    const isEq = ctx.equippedTool && ctx.equippedTool.key === key;
    const pct = owned ? Math.round((owned / def.maxDurability) * 100) : 0;
    const slot = document.createElement('div');
    slot.className = 'hb-btn hb-slot' + (isEq ? ' equipped' : '') + (owned ? ' owned' : '');
    const iconHtml = owned ? `<img class="swatch" src="${toolIconMap[key]||''}" alt="${def.name}" style="image-rendering:pixelated;">` : `<span class="swatch" style="background:rgba(74,63,50,0.04);border-color:rgba(74,63,50,0.04);"></span>`;
    const labelHtml = owned ? `<span class="hb-label" title="${def.name}">${def.name.substring(0,4)}</span>` : '';
    const durHtml = owned ? `<div class="dur-bar"><div class="dur-fill" style="width:${pct}%;background:${pct>50?'#5a8a6a':pct>25?'#c89a3a':'#e84242'}"></div></div>` : '';
    slot.innerHTML = `<span class="key">${i+1}</span>${iconHtml}${labelHtml}${durHtml}`;
    ctx.hotbarEl.appendChild(slot);
  });
}

export function refreshHotbar(ctx) {
  const allBtns = ctx.hotbarEl.querySelectorAll('.hb-btn');
  const itemKeys = ITEM_ORDER;
  const toolKeys = Object.keys(ctx.TOOLS);

  itemKeys.forEach((key, i) => {
    if (allBtns[i]) allBtns[i].querySelector('.hb-label').textContent = ctx.playerInventory[key] || 0;
  });

  const toolStart = itemKeys.length;
  toolKeys.forEach((key, i) => {
    const slot = allBtns[toolStart + i];
    if (!slot) return;
    const owned = ctx.playerTools[key] || 0;
    const isEq = ctx.equippedTool && ctx.equippedTool.key === key;
    const def = ctx.TOOLS[key];
    const pct = owned ? Math.round((owned / def.maxDurability) * 100) : 0;
    const swatch = slot.querySelector('.swatch');
    if (swatch) {
      const toolIconMap = { wood_pickaxe: 'assets/wood_pickaxe.png', stone_pickaxe: 'assets/stone_pickaxe.png', metal_pickaxe: 'assets/metal.png' };
      if (owned) swatch.outerHTML = `<img class="swatch" src="${toolIconMap[key]||''}" alt="${def.name}" style="image-rendering:pixelated;">`;
      else swatch.outerHTML = `<span class="swatch" style="background:rgba(74,63,50,0.04);border-color:rgba(74,63,50,0.04);"></span>`;
    }
    const label = slot.querySelector('.hb-label');
    if (label) label.textContent = owned ? def.name.substring(0,4) : '';
    const durBar = slot.querySelector('.dur-bar');
    if (durBar) durBar.remove();
    if (owned) {
      const db = document.createElement('div');
      db.className = 'dur-bar';
      db.innerHTML = `<div class="dur-fill" style="width:${pct}%;background:${pct>50?'#5a8a6a':pct>25?'#c89a3a':'#e84242'}"></div>`;
      slot.appendChild(db);
    }
    slot.className = 'hb-btn hb-slot' + (isEq ? ' equipped' : '') + (owned ? ' owned' : '');
  });

  const ti = document.getElementById('tool-indicator');
  if (ctx.equippedTool && ctx.TOOLS[ctx.equippedTool.key]) {
    const def = ctx.TOOLS[ctx.equippedTool.key];
    const pct = Math.round((ctx.equippedTool.durability / def.maxDurability) * 100);
    ti.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + def.color + ';margin-right:4px;"></span>' + def.name + ' <span style="color:' + (pct>50?'#5a8a6a':pct>25?'#b8954a':'#cc4444') + ';margin-left:4px;">' + pct + '%</span>';
    ti.style.display = 'flex';
  } else ti.style.display = 'none';
}

export function flashHotbar(ctx) {
  const slots = ctx.hotbarEl.querySelectorAll('.hb-btn');
  slots.forEach(s => s.classList.add('active'));
  setTimeout(() => slots.forEach(s => s.classList.remove('active')), 200);
}
