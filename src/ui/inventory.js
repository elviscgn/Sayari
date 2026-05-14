import { ITEMS, ITEM_ORDER } from '../buildings.js';

export function init(ctx) {
  ctx.inventoryOpen = false;
  ctx.invOverlay = document.getElementById('inventory-overlay');
  ctx.invGrid = document.getElementById('inv-grid');

  ctx.invOverlay.addEventListener('click', e => { if (e.target === ctx.invOverlay) closeInventory(ctx); });
  document.getElementById('inv-close').addEventListener('click', () => closeInventory(ctx));
}

export function openInventory(ctx) {
  if (ctx.actionTarget) ctx.closeBlockPopup();
  ctx.invGrid.innerHTML = '';
  const allKeys = [...ITEM_ORDER, 'plank','refined_stone','refined_metal','refined_vib','recycled','circuit'];
  const hasItems = allKeys.filter(k => (ctx.playerInventory[k] || 0) > 0);

  if (hasItems.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'grid-column:1/-1;text-align:center;font-size:10px;letter-spacing:0.2em;color:#8a7f72;padding:20px 0;font-weight:600;text-transform:uppercase;';
    empty.textContent = 'Empty pockets';
    ctx.invGrid.appendChild(empty);
  } else {
    hasItems.forEach(key => {
      const item = ITEMS[key];
      const qty = ctx.playerInventory[key] || 0;
      const card = document.createElement('div');
      card.className = 'inv-card';
      let swatch;
      if (item.icon) { swatch = document.createElement('img'); swatch.className = 'inv-swatch'; swatch.src = item.icon; swatch.alt = item.name; }
      else { swatch = document.createElement('div'); swatch.className = 'inv-swatch'; swatch.style.background = item.color; }
      card.appendChild(swatch);
      const info = document.createElement('div');
      info.className = 'inv-info';
      info.innerHTML = '<div class="inv-name">' + item.name + ' <span class="inv-count">' + qty + '</span></div>';
      card.appendChild(info);
      ctx.invGrid.appendChild(card);
    });
  }

  const toolHeader = document.createElement('div');
  toolHeader.style.cssText = 'grid-column:1/-1;font-size:9px;letter-spacing:0.3em;color:#8a7f72;text-transform:uppercase;font-weight:600;border-top:1px solid rgba(74,63,50,0.08);padding-top:12px;margin-top:4px;text-align:center;';
  toolHeader.textContent = 'Tools';
  ctx.invGrid.appendChild(toolHeader);

  Object.keys(ctx.TOOLS).forEach(key => {
    const def = ctx.TOOLS[key];
    const owned = ctx.playerTools[key] || 0;
    const card = document.createElement('div');
    card.className = 'tool-card';

    const swatch = document.createElement('div');
    swatch.style.cssText = 'width:20px;height:20px;border-radius:3px;flex-shrink:0;background:' + def.color + ';';
    card.appendChild(swatch);

    const info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0;';
    const nameLine = document.createElement('div');
    nameLine.style.cssText = 'font-size:10px;letter-spacing:0.15em;font-weight:700;color:#3a2f22;text-transform:uppercase;';
    nameLine.textContent = def.name;
    info.appendChild(nameLine);

    const costLine = document.createElement('div');
    costLine.style.cssText = 'font-size:8px;letter-spacing:0.1em;color:#8a7f72;margin-top:2px;font-weight:600;';
    const parts = [];
    Object.keys(def.craft).forEach(k => {
      const need = def.craft[k];
      const have = ctx.playerInventory[k] || 0;
      const color = have >= need ? '#5a8a6a' : '#cc4444';
      parts.push('<span style="color:' + color + ';">' + have + '/' + need + ' ' + (ITEMS[k] ? ITEMS[k].name.toLowerCase() : k) + '</span>');
    });
    costLine.innerHTML = parts.join('  ');
    info.appendChild(costLine);

    if (owned > 0) {
      const durPct = Math.round((owned / def.maxDurability) * 100);
      const barOuter = document.createElement('div');
      barOuter.style.cssText = 'height:3px;background:rgba(74,63,50,0.08);border-radius:2px;margin-top:4px;overflow:hidden;';
      const barFill = document.createElement('div');
      barFill.style.cssText = 'height:100%;width:' + durPct + '%;background:' + (durPct>50?'#5a8a6a':durPct>25?'#b8954a':'#cc4444') + ';border-radius:2px;';
      barOuter.appendChild(barFill);
      info.appendChild(barOuter);
    }
    card.appendChild(info);

    const btn = document.createElement('button');
    btn.style.cssText = 'padding:5px 10px;font-size:8px;letter-spacing:0.15em;font-weight:600;text-transform:uppercase;border-radius:3px;cursor:pointer;font-family:inherit;border:1px solid rgba(74,63,50,0.12);transition:all 0.1s;';
    if (owned > 0) {
      const isEquipped = ctx.equippedTool && ctx.equippedTool.key === key;
      btn.textContent = isEquipped ? 'Equipped' : 'Equip';
      btn.style.background = isEquipped ? 'rgba(212,168,74,0.15)' : 'rgba(74,63,50,0.04)';
      btn.style.color = isEquipped ? '#b8954a' : '#6a5f52';
      btn.disabled = isEquipped;
      if (!isEquipped) {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          ctx.equippedTool = { key, durability: owned };
          ctx.saveInventory();
          ctx.refreshHotbar();
          openInventory(ctx);
          ctx.sfxClick();
        });
      }
    } else {
      const canCraft = Object.keys(def.craft).every(k => (ctx.playerInventory[k] || 0) >= def.craft[k]);
      btn.textContent = canCraft ? 'Craft' : 'Need materials';
      btn.style.background = canCraft ? 'rgba(90,138,106,0.12)' : 'rgba(74,63,50,0.03)';
      btn.style.color = canCraft ? '#5a8a6a' : '#8a7f72';
      btn.disabled = !canCraft;
      if (canCraft) {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          Object.keys(def.craft).forEach(k => ctx.playerInventory[k] -= def.craft[k]);
          ctx.playerTools[key] = def.maxDurability;
          if (!ctx.equippedTool) ctx.equippedTool = { key, durability: def.maxDurability };
          ctx.saveInventory();
          ctx.refreshHotbar();
          openInventory(ctx);
          ctx.sfxBuild();
          ctx.showToast('Crafted ' + def.name);
        });
      }
    }
    card.appendChild(btn);
    ctx.invGrid.appendChild(card);
  });

  ctx.inventoryOpen = true;
  ctx.invOverlay.showModal();
}

function closeInventory(ctx) {
  ctx.inventoryOpen = false;
  ctx.invOverlay.close();
}

export { closeInventory };
