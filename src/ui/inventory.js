import { ITEMS, ALL_ITEMS } from '../buildings.js';

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

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
  const hasItems = ALL_ITEMS.filter(k => (ctx.playerInventory[k] || 0) > 0);

  const resHeader = document.createElement('div');
  resHeader.className = 'section-label';
  resHeader.textContent = 'MATERIALS';
  ctx.invGrid.appendChild(resHeader);

  if (hasItems.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'inv-empty';
    empty.textContent = 'Empty pockets';
    ctx.invGrid.appendChild(empty);
  } else {
    hasItems.forEach(key => {
      const item = ITEMS[key];
      const qty = ctx.playerInventory[key] || 0;
      const card = document.createElement('div');
      card.className = 'inv-card';
      card.draggable = true;
      card.style.background = `linear-gradient(135deg, ${hexToRgba(item.color, 0.1)}, ${hexToRgba(item.color, 0.03)})`;
      card.style.borderColor = hexToRgba(item.color, 0.15);
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ key, qty }));
      });
      let swatch;
      if (item.icon) { swatch = document.createElement('img'); swatch.className = 'inv-swatch'; swatch.src = item.icon; swatch.alt = item.name; }
      else { swatch = document.createElement('div'); swatch.className = 'inv-swatch'; swatch.style.background = item.color; }
      card.appendChild(swatch);
      const name = document.createElement('span');
      name.className = 'inv-name';
      name.textContent = item.name;
      card.appendChild(name);
      const count = document.createElement('span');
      count.className = 'inv-count';
      count.textContent = qty;
      card.appendChild(count);
      ctx.invGrid.appendChild(card);
    });
  }

  const toolHeader = document.createElement('div');
  toolHeader.className = 'section-label';
  toolHeader.textContent = 'TOOLS';
  ctx.invGrid.appendChild(toolHeader);

  Object.keys(ctx.TOOLS).forEach(key => {
    const def = ctx.TOOLS[key];
    const owned = ctx.playerTools[key] || 0;
    const isEquipped = ctx.equippedTool && ctx.equippedTool.key === key;
    const canCraft = Object.keys(def.craft).every(k => (ctx.playerInventory[k] || 0) >= def.craft[k]);

    const card = document.createElement('div');
    card.className = 'tool-card';
    if (isEquipped) card.classList.add('equipped');
    if (!owned && !canCraft) card.classList.add('locked');
    card.style.borderLeftColor = def.color;

    const icon = document.createElement('div');
    icon.className = 'tool-icon';
    icon.style.background = `linear-gradient(135deg, ${def.color}, ${hexToRgba(def.color, 0.6)})`;
    icon.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.1)`;
    card.appendChild(icon);

    const info = document.createElement('div');
    info.className = 'tool-info';

    const nameLine = document.createElement('div');
    nameLine.className = 'tool-name';
    nameLine.textContent = def.name;
    info.appendChild(nameLine);

    const reqs = document.createElement('div');
    reqs.className = 'tool-reqs';
    Object.keys(def.craft).forEach(k => {
      const need = def.craft[k];
      const have = ctx.playerInventory[k] || 0;
      const met = have >= need;
      const pill = document.createElement('span');
      pill.className = 'pill' + (met ? '' : ' unmet');
      const dot = document.createElement('span');
      dot.className = 'dot' + (met ? ' met' : ' unmet');
      pill.appendChild(dot);
      const label = document.createElement('span');
      label.textContent = need + ' ' + (ITEMS[k] ? ITEMS[k].name.toLowerCase() : k);
      pill.appendChild(label);
      reqs.appendChild(pill);
    });
    info.appendChild(reqs);

    if (owned > 0) {
      const durPct = Math.round((owned / def.maxDurability) * 100);
      const durRow = document.createElement('div');
      durRow.className = 'dur-row';
      const bar = document.createElement('div');
      bar.className = 'dur-bar';
      const fill = document.createElement('div');
      fill.className = 'dur-fill';
      let fillColor;
      if (durPct > 50) fillColor = '#5a8a6a';
      else if (durPct > 25) fillColor = '#b8954a';
      else fillColor = '#cc4444';
      fill.style.width = durPct + '%';
      fill.style.background = fillColor;
      fill.style.boxShadow = '0 0 8px ' + fillColor;
      bar.appendChild(fill);
      durRow.appendChild(bar);
      const pct = document.createElement('span');
      pct.className = 'dur-pct';
      pct.textContent = durPct + '%';
      durRow.appendChild(pct);
      info.appendChild(durRow);
    }

    card.appendChild(info);

    const btn = document.createElement('button');
    btn.className = 'tool-btn';
    if (owned > 0) {
      btn.textContent = isEquipped ? 'Equipped' : 'Equip';
      btn.disabled = isEquipped;
      if (isEquipped) btn.classList.add('active');
      else btn.classList.add('equip');
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
      btn.textContent = canCraft ? 'Craft' : 'Need materials';
      btn.disabled = !canCraft;
      if (canCraft) btn.classList.add('craft');
      else btn.classList.add('locked');
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
