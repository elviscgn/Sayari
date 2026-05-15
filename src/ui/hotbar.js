import { ITEMS, ALL_ITEMS } from '../buildings.js';

export function init(ctx) {
  ctx.hotbarEl = document.getElementById('hotbar');
  ctx.hotbarSelected = -1;
}

export function buildHotbar(ctx) {
  ctx.hotbarEl.innerHTML = '';
  const owned = ALL_ITEMS.filter(k => (ctx.playerInventory[k] || 0) > 0);
  for (let i = 0; i < 9; i++) {
    const slot = document.createElement('div');
    slot.className = 'hb-btn';
    slot.dataset.idx = i;
    if (i < owned.length) {
      const key = owned[i];
      const item = ITEMS[key];
      const qty = ctx.playerInventory[key] || 0;
      const swatchHtml = item.icon ? `<img class="swatch" src="${item.icon}" alt="${item.name}">` : `<span class="swatch" style="background:${item.color}"></span>`;
      slot.innerHTML = swatchHtml + `<span class="hb-label">${qty}</span>`;
      slot.dataset.key = key;
      slot.draggable = true;
      slot.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ key, qty }));
      });
      if (i === ctx.hotbarSelected) slot.classList.add('selected');
    } else {
      slot.classList.add('empty');
    }
    ctx.hotbarEl.appendChild(slot);
  }
}

export function refreshHotbar(ctx) {
  buildHotbar(ctx);

  const ti = document.getElementById('tool-indicator');
  if (ctx.equippedTool && ctx.TOOLS[ctx.equippedTool.key]) {
    const def = ctx.TOOLS[ctx.equippedTool.key];
    const pct = Math.round((ctx.equippedTool.durability / def.maxDurability) * 100);
    ti.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + def.color + ';margin-right:4px;"></span>' + def.name + ' <span style="color:' + (pct>50?'#5a8a6a':pct>25?'#b8954a':'#cc4444') + ';margin-left:4px;">' + pct + '%</span>';
    ti.style.display = 'flex';
  } else ti.style.display = 'none';
}

export function flashHotbar(ctx) {
  const slots = ctx.hotbarEl.querySelectorAll('.hb-btn:not(.empty)');
  slots.forEach(s => s.classList.add('active'));
  setTimeout(() => slots.forEach(s => s.classList.remove('active')), 200);
}
