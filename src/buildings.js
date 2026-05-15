import { getCell, getCellCenter } from './terrain.js';

export const BUILDING_TYPES = {
  wall:     { name: 'Wall',          color: 0x8a9aaa, desc: 'Perimeter barrier' },
  turret:   { name: 'Turret',        color: 0xcc4444, desc: 'Auto-targeting defense' },
  solar:    { name: 'Solar Panel',   color: 0x44aacc, desc: 'Power generation' },
  storage:  { name: 'Storage',       color: 0xccaa44, desc: 'Resource stockpile' },
  workshop: { name: 'Workshop',      color: 0xaa88cc, desc: 'Crafting station' },
  gate:     { name: 'Gate',          color: 0x8a7a5a, desc: 'Fortified entryway' },
  beacon:   { name: 'Beacon',        color: 0xd4a84a, desc: 'Navigation signal' },
  factory:  { name: 'Factory',       color: 0xcc8844, desc: 'Automated production' },
};

export const UPGRADE_TIERS = {
  wall:     [{ name:'Wood Wall', color:0x8a7a5a, maxHp:100 }, { name:'Stone Wall', color:0x7a8a8a, maxHp:200 }, { name:'Metal Wall', color:0x6a7a8a, maxHp:350 }, { name:'Vibranium Wall', color:0x5a6aaa, maxHp:500 }],
  turret:   [{ name:'Turret', color:0xcc4444, maxHp:80 }, { name:'Cannon', color:0xdd5555, maxHp:120 }, { name:'Artillery', color:0xee6666, maxHp:160 }, { name:'Railgun', color:0xaa66ff, maxHp:200 }],
  solar:    [{ name:'Solar Panel', color:0x44aacc, maxHp:60 }, { name:'Solar Array', color:0x55bbdd, maxHp:90 }, { name:'Solar Farm', color:0x66ccee, maxHp:120 }],
  storage:  [{ name:'Storage', color:0xccaa44, maxHp:100 }, { name:'Warehouse', color:0xddbb55, maxHp:150 }, { name:'Depot', color:0xeecc66, maxHp:200 }],
  workshop: [{ name:'Workshop', color:0xaa88cc, maxHp:80 }, { name:'Lab', color:0xbb99dd, maxHp:120 }, { name:'Research Center', color:0xccaaee, maxHp:160 }],
  gate:     [{ name:'Wood Gate', color:0x8a7a5a, maxHp:80 }, { name:'Stone Gate', color:0x7a8a8a, maxHp:150 }, { name:'Metal Gate', color:0x6a7a8a, maxHp:250 }, { name:'Vibranium Gate', color:0x5a6aaa, maxHp:400 }],
  beacon:   [{ name:'Beacon', color:0xd4a84a, maxHp:60 }, { name:'Lighthouse', color:0xe0b85a, maxHp:100 }, { name:'Signal Tower', color:0xecc86a, maxHp:140 }],
  factory:  [{ name:'Workshop', color:0xcc8844, maxHp:100 }, { name:'Factory', color:0xdd9955, maxHp:180 }, { name:'Automaton', color:0xeeaa66, maxHp:280 }],
};

export const ALL_ITEMS = [
  'wood','stone','iron_ore','copper_ore','vibranium_ore','scrap','coal',
  'metal','electronics','vibranium',
  'refined_stone','recycled','refined_metal','refined_vib','circuit',
];

export const ITEMS = {
  wood:        { name:'Wood', color:'#8B4513', icon:'assets/wood.png' },
  stone:       { name:'Stone', color:'#808080', icon:'assets/stone.png' },
  iron_ore:    { name:'Iron Ore', color:'#cc8844', icon:'assets/metal.png' },
  copper_ore:  { name:'Copper Ore', color:'#44cc88', icon:'assets/circuit.png' },
  vibranium_ore:{name:'Vibranium Ore', color:'#8844cc', icon:'assets/vibranium.png' },
  scrap:       { name:'Scrap', color:'#cc8844', icon:'assets/scrap.png' },
  coal:        { name:'Coal', color:'#3a3a3a', icon:'assets/wood.png' },
  metal:       { name:'Metal', color:'#4488cc', icon:'assets/metal.png' },
  electronics: { name:'Electronics', color:'#44cc88', icon:'assets/circuit.png' },
  vibranium:   { name:'Vibranium', color:'#8844cc', icon:'assets/vibranium.png' },
  refined_stone:{name:'Refined Stone', color:'#909090', icon:'assets/stone.png' },
  recycled:    { name:'Recycled Mat.', color:'#cc9955', icon:'assets/scrap.png' },
  refined_metal:{name:'Refined Metal', color:'#5599dd', icon:'assets/metal.png' },
  refined_vib: { name:'Refined Vibranium', color:'#9955dd', icon:'assets/vibranium.png' },
  circuit:     { name:'Circuit', color:'#55dd99', icon:'assets/circuit.png' },
};

export const BUILD_COSTS = {
  wall:     [{ wood:10 }, { stone:10 }, { iron_ore:10 }, { vibranium_ore:10 }],
  turret:   [{ iron_ore:5, stone:10 }, { metal:3, electronics:5 }, { metal:5, electronics:8 }, { vibranium:5, electronics:5 }],
  solar:    [{ copper_ore:5, iron_ore:5 }, { electronics:5, metal:5 }, { electronics:10, metal:5 }],
  storage:  [{ wood:10, iron_ore:5 }, { metal:10 }, { metal:5, electronics:5 }],
  workshop: [{ wood:15, stone:5 }, { metal:10 }, { electronics:10, metal:5 }],
  gate:     [{ wood:8 }, { stone:8 }, { iron_ore:8 }, { vibranium_ore:8 }],
  beacon:   [{ wood:5, stone:5 }, { metal:5, copper_ore:3 }, { electronics:8, metal:5 }],
  factory:  [{ wood:20, stone:10 }, { iron_ore:300, copper_ore:300, stone:100 }, { metal:50, electronics:20, vibranium:10 }],
};

export const PROCESS_RECIPES = {
  workshop: [
    { input:{ wood:3 }, output:{ coal:1 }, energy:5, label:'Coal' },
    { input:{ stone:3 }, output:{ refined_stone:1 }, energy:10, label:'R.Stone' },
  ],
  factory_t0: [
    { input:{ iron_ore:3, wood:3 }, output:{ metal:1 }, energy:12, label:'Smelt Iron' },
    { input:{ iron_ore:3, coal:1 }, output:{ metal:1 }, energy:4, label:'Smelt Iron (Coal)' },
  ],
  factory_t1: [
    { input:{ scrap:3 }, output:{ metal:1 }, energy:5, label:'Recycle' },
    { input:{ vibranium_ore:3 }, output:{ vibranium:1 }, energy:20, label:'Refine Vib.' },
    { input:{ refined_vib:1, copper_ore:2, metal:1, coal:1 }, output:{ electronics:1 }, energy:10, label:'Make Elec.' },
    { input:{ metal:3 }, output:{ refined_metal:1 }, energy:15, label:'R.Metal' },
    { input:{ vibranium:3 }, output:{ refined_vib:1 }, energy:20, label:'R.Vib.' },
    { input:{ electronics:2 }, output:{ circuit:1 }, energy:15, label:'Circuit' },
  ],
};

export const PLANET_BUILDS = {
  Mercury: ['wall','turret','storage','workshop','gate','factory'],
  Venus:   ['wall','turret','solar','storage','workshop','gate','beacon','factory'],
  Earth:   ['wall','turret','solar','storage','workshop','gate','beacon','factory'],
  Mars:    ['wall','turret','storage','workshop','gate','factory'],
  Jupiter: ['wall','turret','storage','gate','factory'],
  Saturn:  ['wall','turret','solar','storage','gate','beacon','factory'],
  Uranus:  ['wall','storage','workshop','gate','factory'],
  Neptune: ['wall','storage','workshop','gate','factory'],
};

export function getBuildCost(typeKey, tier) {
  const tiers = BUILD_COSTS[typeKey];
  if (!tiers || !tiers[tier]) return {};
  return tiers[tier];
}

// ── FOUNDATION TEXTURES ──

export function buildFoundationTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#aab8c4'; ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) {
    ctx.strokeStyle = 'rgba(80,90,100,' + (0.2 + Math.random() * 0.15) + ')';
    ctx.lineWidth = 1.2; ctx.strokeRect(i * 10.6, j * 10.6, 10.6, 10.6);
  }
  for (let k = 0; k < 80; k++) {
    ctx.fillStyle = 'rgba(0,0,0,' + (0.03 + Math.random() * 0.05) + ')';
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 3, 1);
  }
  ctx.strokeStyle = 'rgba(60,70,80,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(6, 6);
  return tex;
}

const foundationMat = new THREE.MeshLambertMaterial({
  map: buildFoundationTexture(), transparent: true, opacity: 0.85, depthWrite: false,
});
const foundationEdgeMat = new THREE.LineBasicMaterial({
  color: '#667788', transparent: true, opacity: 0.7, depthWrite: false,
});

// ── COLLISION ──

export function aabbFromBox(cx, cz, hx, hz, ry) {
  const cos = Math.round(Math.cos(ry)), sin = Math.round(Math.sin(ry));
  return { minX: cx - (Math.abs(hx * cos) + Math.abs(hz * sin)), maxX: cx + (Math.abs(hx * cos) + Math.abs(hz * sin)), minZ: cz - (Math.abs(hx * sin) + Math.abs(hz * cos)), maxZ: cz + (Math.abs(hx * sin) + Math.abs(hz * cos)) };
}

function collides(px, pz, r, box) {
  const cx = Math.max(box.minX, Math.min(px, box.maxX)), cz = Math.max(box.minZ, Math.min(pz, box.maxZ));
  return (px - cx) * (px - cx) + (pz - cz) * (pz - cz) < r * r;
}

export function anyCollision(px, pz, ctx) {
  for (const f of ctx.foundations) { if (f.collider && collides(px, pz, ctx.PLAYER_RADIUS, f.collider)) return true; }
  for (const c of ctx.buildingColliders) { if (collides(px, pz, ctx.PLAYER_RADIUS, c)) return true; }
  return false;
}

export function resolvePlayerCollision(ctx) {
  const px = ctx.player.position.x, pz = ctx.player.position.z;
  const r = ctx.PLAYER_RADIUS;
  function pushOut(box) {
    const cx = (box.minX + box.maxX) / 2, cz = (box.minZ + box.maxZ) / 2;
    const dx = px - cx, dz = pz - cz;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.01) { ctx.player.position.x = box.maxX + r; return true; }
    const halfW = (box.maxX - box.minX) / 2 + r;
    const halfD = (box.maxZ - box.minZ) / 2 + r;
    const nx = cx + Math.sign(dx) * halfW;
    const nz = cz + Math.sign(dz) * halfD;
    ctx.player.position.x = nx;
    ctx.player.position.z = nz;
    return true;
  }
  for (const f of ctx.foundations) { if (f.collider && collides(px, pz, r, f.collider)) { pushOut(f.collider); return; } }
  for (const c of ctx.buildingColliders) { if (collides(px, pz, r, c)) { pushOut(c); return; } }
}

// ── BUILDING MESH ──

export function makeBuildingMesh(typeKey, color, transparent, opacity, ctx) {
  const mat = new THREE.MeshLambertMaterial({ color, transparent, opacity });
  let meshes = [];

  if (typeKey === 'wall') {
    const s = ctx.CELL - 0.4, h = 10;
    const body = new THREE.Mesh(new THREE.BoxGeometry(s, h, s), mat);
    body.position.set(0, h / 2, 0); meshes.push(body);
    const cH = 0.9, cS = 1.8, inset = 1.2;
    [[-s/2+inset,-s/2+inset],[-s/2+inset,s/2-inset],[s/2-inset,-s/2+inset],[s/2-inset,s/2-inset],[0,-s/2+inset],[-s/2+inset,0],[s/2-inset,0],[0,s/2-inset]].forEach(([x,z]) => {
      const c = new THREE.Mesh(new THREE.BoxGeometry(cS, cH, cS), mat);
      c.position.set(x, h + cH / 2, z); meshes.push(c);
    });
  } else if (typeKey === 'turret') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.3, 0.3, 8), mat);
    base.position.set(0, 0.15, 0); meshes.push(base);
    const topMat = new THREE.MeshLambertMaterial({ color: 0xdd6666, transparent, opacity });
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), topMat);
    top.position.set(0, 0.6, 0); meshes.push(top);
  } else if (typeKey === 'solar') {
    const m = new THREE.Mesh(new THREE.BoxGeometry(ctx.CELL-1, 0.1, ctx.CELL*0.6), mat);
    m.position.set(0, 0.05, 0); m.rotation.z = 0.3; meshes.push(m);
  } else if (typeKey === 'gate') {
    const s = ctx.CELL - 0.4, h = 8.0, pw = 0.8;
    const left = new THREE.Mesh(new THREE.BoxGeometry(pw, h, pw), mat);
    left.position.set(-s/2+pw/2, h/2, 0); meshes.push(left);
    const right = new THREE.Mesh(new THREE.BoxGeometry(pw, h, pw), mat);
    right.position.set(s/2-pw/2, h/2, 0); meshes.push(right);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(s, 0.6, pw), mat);
    beam.position.set(0, h, 0); meshes.push(beam);
    [-s/4,0,s/4].forEach(x => {
      const c = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, pw), mat);
      c.position.set(x, h+0.2, 0); meshes.push(c);
    });
  } else if (typeKey === 'beacon') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 5.0, 6), mat);
    pole.position.set(0, 2.5, 0); meshes.push(pole);
    const glowMat = new THREE.MeshLambertMaterial({ color: 0xffdd55, emissive: 0xffaa00, emissiveIntensity: 0.4, transparent, opacity: 0.9 });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), glowMat);
    glow.position.set(0, 5.2, 0); meshes.push(glow);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), mat);
    base.position.set(0, 0.15, 0); meshes.push(base);
  } else if (typeKey === 'factory') {
    if (ctx.factoryModelScene) {
      const clone = ctx.factoryModelScene.clone();
      const box = new THREE.Box3().setFromObject(clone);
      const size = box.getSize(new THREE.Vector3());
      const extent = Math.max(size.x, size.z);
      const s = extent > 0.001 && isFinite(extent) ? ctx.CELL / extent : 1;
      clone.scale.set(s, s, s);
      clone.updateMatrixWorld(true);
      const wBox = new THREE.Box3().setFromObject(clone);
      clone.position.set(0, -wBox.min.y, 0);
      clone.traverse(c => {
        if (c.isMesh) { c.material = c.material.clone(); c.material.color.setHex(color); c.material.transparent = transparent; c.material.opacity = opacity; }
      });
      meshes.push(clone);
    } else {
      const m = new THREE.Mesh(new THREE.BoxGeometry(ctx.CELL-1, 2.0, ctx.CELL-1), mat);
      m.position.set(0, 1.0, 0); meshes.push(m);
    }
  } else {
    const m = new THREE.Mesh(new THREE.BoxGeometry(ctx.CELL-1, 1.0, ctx.CELL-1), mat);
    m.position.set(0, 0.5, 0); meshes.push(m);
  }

  meshes.forEach(m => { m.castShadow = true; m.receiveShadow = true; });
  return meshes;
}

export function getBuildingAABBs(cx, cz, typeKey, rotation, ctx) {
  const ry = rotation * Math.PI / 2;
  const halfCell = (ctx.CELL - 1) / 2;
  if (typeKey === 'wall') return [aabbFromBox(cx, cz, ctx.CELL/2, ctx.CELL/2, 0)];
  if (typeKey === 'turret') return [aabbFromBox(cx, cz, 2.5, 2.5, 0), aabbFromBox(cx, cz, 0.4, 0.4, ry)];
  if (typeKey === 'solar') return [aabbFromBox(cx, cz, halfCell, ctx.CELL*0.3, ry)];
  if (typeKey === 'gate') return [aabbFromBox(cx, cz, ctx.CELL/2, 0.4, ry)];
  if (typeKey === 'beacon') return [aabbFromBox(cx, cz, 0.8, 0.8, 0)];
  if (typeKey === 'factory') return [aabbFromBox(cx, cz, ctx.CELL/2, ctx.CELL/2, 0)];
  return [aabbFromBox(cx, cz, halfCell, halfCell, ry)];
}

// ── FOUNDATIONS ──

export function placeFoundation(cx, cz, ctx) {
  if (ctx.foundations.some(f => f.cx === cx && f.cz === cz)) return;
  const pc = getCell(ctx.player.position.x, ctx.player.position.z, ctx);
  if (pc.cx === cx && pc.cz === cz) return;
  const center = getCellCenter(cx, cz, ctx);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(ctx.CELL, 0.1, ctx.CELL), foundationMat);
  mesh.position.set(center.x, 0.02, center.z); mesh.receiveShadow = true;
  ctx.scene.add(mesh); ctx.foundationTargets.push(mesh);

  const hh = ctx.CELL / 2;
  const edgePts = [new THREE.Vector3(-hh,0,-hh), new THREE.Vector3(hh,0,-hh), new THREE.Vector3(hh,0,hh), new THREE.Vector3(-hh,0,hh), new THREE.Vector3(-hh,0,-hh)];
  const edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePts);
  const edge = new THREE.Line(edgeGeo, foundationEdgeMat);
  edge.rotation.x = -Math.PI / 2; edge.position.set(center.x, 0.08, center.z);
  ctx.scene.add(edge);

  const collider = aabbFromBox(center.x, center.z, ctx.CELL/2, ctx.CELL/2, 0);
  ctx.foundations.push({ cx, cz, mesh, edge, building: null, buildingMeshes: null, collider, tier: 0, hp: 100, maxHp: 100 });
}

export function buildFoundationFrom(entry, ctx) {
  const center = getCellCenter(entry.cx, entry.cz, ctx);
  const hh = ctx.CELL / 2;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(ctx.CELL, 0.1, ctx.CELL), foundationMat);
  mesh.position.set(center.x, 0.02, center.z); mesh.receiveShadow = true;
  ctx.scene.add(mesh); ctx.foundationTargets.push(mesh);
  const edgePts = [new THREE.Vector3(-hh,0,-hh), new THREE.Vector3(hh,0,-hh), new THREE.Vector3(hh,0,hh), new THREE.Vector3(-hh,0,hh), new THREE.Vector3(-hh,0,-hh)];
  const edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePts);
  const edge = new THREE.Line(edgeGeo, foundationEdgeMat);
  edge.rotation.x = -Math.PI / 2; edge.position.set(center.x, 0.08, center.z);
  ctx.scene.add(edge);
  entry.mesh = mesh; entry.edge = edge;
  entry.collider = aabbFromBox(center.x, center.z, ctx.CELL/2, ctx.CELL/2, 0);
}

export function canPlaceAt(cx, cz, ctx) {
  if (ctx.foundations.some(f => f.cx === cx && f.cz === cz && f.building)) return false;
  const pc = getCell(ctx.player.position.x, ctx.player.position.z, ctx);
  if (pc.cx === cx && pc.cz === cz) return false;
  return true;
}

// ── PLACEMENT ──

export function placeBuilding(cx, cz, typeKey, rotation, ctx, free) {
  if (ctx.foundations.some(f => f.cx === cx && f.cz === cz && f.building)) return;
  const pc = getCell(ctx.player.position.x, ctx.player.position.z, ctx);
  if (pc.cx === cx && pc.cz === cz) return;
  const cost = getBuildCost(typeKey, 0);
  if (!free && !ctx.hasItems(cost)) { ctx.sfxError(); ctx.showToast('Not enough resources'); return; }

  let entry = ctx.foundations.find(f => f.cx === cx && f.cz === cz);
  if (entry) {
    if (entry.building) return;
    ctx.scene.remove(entry.mesh); ctx.scene.remove(entry.edge);
    const mi = ctx.foundationTargets.indexOf(entry.mesh);
    if (mi !== -1) ctx.foundationTargets.splice(mi, 1);
    entry.collider = null;
  } else {
    placeFoundation(cx, cz, ctx);
    entry = ctx.foundations[ctx.foundations.length - 1];
    entry.collider = null;
  }

  const tiers = UPGRADE_TIERS[typeKey];
  const tDef = tiers ? tiers[0] : null;
  const tColor = tDef ? tDef.color : BUILDING_TYPES[typeKey].color;
  const tMaxHp = tDef ? tDef.maxHp : 100;
  const center = getCellCenter(cx, cz, ctx);
  const meshes = makeBuildingMesh(typeKey, tColor, false, 1, ctx);
  meshes.forEach(m => {
    m.position.x += center.x; m.position.z += center.z;
    if (rotation !== 0) {
      const ox = m.position.x - center.x, oz = m.position.z - center.z;
      const r = rotation * Math.PI / 2;
      m.position.x = center.x + ox * Math.cos(r) - oz * Math.sin(r);
      m.position.z = center.z + ox * Math.sin(r) + oz * Math.cos(r);
      m.rotation.y += r;
    }
    ctx.scene.add(m);
  });
  animatePlacement(meshes);

  const aabbs = getBuildingAABBs(center.x, center.z, typeKey, rotation, ctx);
  aabbs.forEach(a => ctx.buildingColliders.push(a));
  meshes.forEach(m => ctx.buildingTargets.push(m));

  entry.building = typeKey; entry.rotation = rotation; entry.buildingMeshes = meshes; entry.colliderAABBs = aabbs;
  entry.tier = 0; entry.hp = tMaxHp; entry.maxHp = tMaxHp;
  ctx.createHpBar(entry);
  if (!free) { ctx.spendItems(cost); ctx.saveInventory(); }
  ctx.sfxBuild();
  animateFlash(center.x, center.z, 0xd4a84a, 2, ctx);
  ctx.showToast(tDef ? tDef.name : BUILDING_TYPES[typeKey].name + ' built');
  ctx.saveBuildings();
  ctx.resolvePlayerCollision();
}

// ── ANIMATION EFFECTS ──

function animateFlash(wx, wz, color, count, ctx) {
  for (let i = 0; i < (count || 1); i++) {
    setTimeout(() => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.5, 16), new THREE.MeshBasicMaterial({ color: color||0xd4a84a, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(wx+(Math.random()-0.5)*3, 0.1, wz+(Math.random()-0.5)*3);
      ctx.scene.add(ring);
      const start = performance.now();
      function tick() { const t = Math.min(1, (performance.now()-start)/350); const s = 0.3+t*4; ring.scale.set(s,s,s); ring.material.opacity = 0.7*(1-t); if (t<1) requestAnimationFrame(tick); else ctx.scene.remove(ring); }
      tick();
    }, i*60);
  }
}

function animatePlacement(meshes) {
  const origScales = meshes.map(m => m.scale.x);
  meshes.forEach(m => { const os = m.scale.x; m.scale.set(os * 0.01, os * 0.01, os * 0.01); });
  const start = performance.now();
  function tick() {
    const t = Math.min(1, (performance.now()-start)/250);
    meshes.forEach((m, i) => {
      const os = origScales[i];
      const s = os * (0.01 + 0.99 * (1 - Math.pow(1 - t, 3)));
      m.scale.set(s, s, s);
    });
    if (t < 1) requestAnimationFrame(tick);
  }
  tick();
}

// ── BLOCK POPUP ──

function processRecipe(recipe, ctx) {
  if (!ctx.hasItems(recipe.input)) { ctx.sfxError(); ctx.showToast('Not enough materials'); return; }
  if (ctx.playerStats.energy < recipe.energy) { ctx.sfxError(); ctx.showToast('Not enough energy'); return; }
  ctx.spendItems(recipe.input); ctx.addItems(recipe.output); ctx.drainEnergy(recipe.energy);
  ctx.sfxProcess(); ctx.saveInventory();
  const outStr = Object.entries(recipe.output).map(([k,v]) => v+' '+ITEMS[k].name).join(' + ');
  ctx.showToast('Processed ' + outStr);
}

function formatRecipeInput(r) {
  return Object.entries(r.input).map(([k,v]) => k + '\u00D7' + v).join(' + ');
}

function formatRecipeOutput(r) {
  return Object.entries(r.output).map(([k,v]) => k + '\u00D7' + v).join(' + ');
}

function recipeBtnLabel(r) {
  return formatRecipeInput(r) + ' \u2192 ' + formatRecipeOutput(r) + ' \u26A1' + r.energy;
}

function formatRecipeCost(r) {
  return Object.entries(r.input).map(([k,v]) => v+' '+ITEMS[k].name).join(' + ');
}

const MAX_SLOTS = 4;

export function initBlockPopup(ctx) {
  ctx.actionTarget = null;
  ctx.wasJustDismissed = false;
  ctx._dragSlots = [];
  ctx._matchedRecipe = null;
  const bpEl = document.getElementById('block-popup');
  bpEl.addEventListener('beforetoggle', e => {
    if (!e.newState.includes('open')) {
      clearSelectionOutline(ctx); ctx.actionTarget = null; ctx.wasJustDismissed = true;
      ctx._dragSlots = []; ctx._matchedRecipe = null;
    }
  });
  ctx.bpEl = bpEl;
  ctx.bpTitleEl = document.getElementById('bp-title');
  ctx.bpSubtitleEl = document.getElementById('bp-subtitle');
  ctx.bpHpSection = document.getElementById('bp-hp-section');
  ctx.bpHpFillEl = document.getElementById('bp-hp-fill');
  ctx.bpHpLabelEl = document.getElementById('bp-hp-label');
  ctx.bpBuildSection = document.getElementById('bp-build-section');
  ctx.bpBuildGrid = document.getElementById('bp-build-grid');
  ctx.bpConfirmRow = document.getElementById('bp-confirm-row');
  ctx.bpBuildBtn = document.getElementById('bp-build-btn');
  ctx.bpActionSection = document.getElementById('bp-action-section');
  ctx.bpActionGrid = document.getElementById('bp-action-grid');
  ctx.bpTierBadge = document.getElementById('bp-tier-badge');
  ctx.bpDragSection = document.getElementById('bp-drag-section');
  ctx.bpDragSlots = document.getElementById('bp-drag-slots');
  ctx.bpRecipePreview = document.getElementById('bp-recipe-preview');
  ctx.bpNoMatch = document.getElementById('bp-no-match');
  ctx.bpClearSlots = document.getElementById('bp-clear-slots');
  ctx.bpProcessBtn = document.getElementById('bp-process-btn');
  ctx.bpRecipeSection = document.getElementById('bp-recipe-section');
  ctx.bpRecipeGrid = document.getElementById('bp-recipe-grid');
  ctx.bpInvSnapshot = document.getElementById('bp-inv-snapshot');
  ctx.bpInvGrid = document.getElementById('bp-inv-grid');
  ctx.bpEnergyBar = document.getElementById('bp-energy-bar');
  ctx.bpEnergyVal = document.getElementById('bp-energy-val');
  ctx.bpEnergyMax = document.getElementById('bp-energy-max');
  document.getElementById('bp-close').addEventListener('click', () => closeBlockPopup(ctx));

  ctx.bpClearSlots.addEventListener('click', e => {
    e.stopPropagation();
    ctx._dragSlots = [];
    ctx._matchedRecipe = null;
    showBlockPopup(ctx.actionTarget, ctx);
  });
  ctx.bpProcessBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!ctx._matchedRecipe) return;
    processRecipe(ctx._matchedRecipe, ctx);
    showBlockPopup(ctx.actionTarget, ctx);
  });
}

// ── SELECTION HIGHLIGHT ──

const selOutlineMat = new THREE.LineBasicMaterial({ color: 0xd4a84a, transparent: true, opacity: 0.8 });

export function clearSelectionOutline(ctx) {
  if (ctx.selectionOutline) { ctx.selectionOutline.forEach(l => ctx.scene.remove(l)); ctx.selectionOutline = null; }
}

function buildSelectionOutline(entry, ctx) {
  clearSelectionOutline(ctx);
  if (!entry || !entry.buildingMeshes) return;
  const lines = [];
  entry.buildingMeshes.forEach(m => {
    if (m.isGroup) {
      const box = new THREE.Box3().setFromObject(m);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const boxGeo = new THREE.BoxGeometry(size.x, size.y, size.z);
      const edges = new THREE.EdgesGeometry(boxGeo);
      const line = new THREE.LineSegments(edges, selOutlineMat);
      line.position.copy(center);
      ctx.scene.add(line); lines.push(line);
    } else if (m.geometry) {
      const edges = new THREE.EdgesGeometry(m.geometry);
      const line = new THREE.LineSegments(edges, selOutlineMat);
      line.position.copy(m.position); line.rotation.copy(m.rotation); line.scale.copy(m.scale);
      ctx.scene.add(line); lines.push(line);
    }
  });
  ctx.selectionOutline = lines;
}

// ── HP BARS ──

const hpBarMat = new THREE.MeshBasicMaterial({ color: 0x5a8a6a, transparent: true, opacity: 0.7, depthWrite: false });
const hpBarBgMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.2, depthWrite: false });

export function createHpBar(entry, ctx) {
  const barW = 3, barH = 0.15;
  const yOff = 0.2;
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(barW, barH), hpBarBgMat);
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(barW, barH), hpBarMat.clone());
  const cx = getCellCenter(entry.cx, entry.cz, ctx).x;
  const cz = getCellCenter(entry.cx, entry.cz, ctx).z;
  bg.position.set(cx, yOff, cz); bg.lookAt(ctx.camera.position);
  fill.position.set(cx, yOff, cz + 0.01); fill.lookAt(ctx.camera.position);
  fill.userData.targetScale = 1; fill.scale.x = 1;
  ctx.scene.add(bg); ctx.scene.add(fill);
  ctx.hpBarMeshes.push({ bg, fill, entry });
}

export function refreshHpBar(entry, ctx) {
  const existing = ctx.hpBarMeshes.find(h => h.entry === entry);
  if (!existing) return;
  const pct = Math.max(0, Math.min(1, (entry.hp || 0) / (entry.maxHp || 100)));
  existing.fill.userData.targetScale = pct;
  existing.fill.material.color.setHex(pct > 0.6 ? 0x5a8a6a : pct > 0.3 ? 0xb8954a : 0xcc4444);
}

function removeHpBar(entry, ctx) {
  const idx = ctx.hpBarMeshes.findIndex(h => h.entry === entry);
  if (idx === -1) return;
  const h = ctx.hpBarMeshes[idx];
  ctx.scene.remove(h.bg); ctx.scene.remove(h.fill);
  ctx.hpBarMeshes.splice(idx, 1);
}

export function updateHpBars(dt, ctx) {
  ctx.hpBarMeshes.forEach(h => {
    h.bg.lookAt(ctx.camera.position);
    h.fill.lookAt(ctx.camera.position);
    const target = h.fill.userData.targetScale;
    if (target !== undefined) h.fill.scale.x += (target - h.fill.scale.x) * Math.min(1, 8 * dt);
  });
}

// ── POPUP LOGIC ──

const BUILD_ICONS = {
  wall: '\u{1F9F1}', turret: '\u{1F5FC}', solar: '\u{2600}\u{FE0F}',
  storage: '\u{1F4E6}', workshop: '\u{1F527}', gate: '\u{1F6AA}',
  beacon: '\u{1F4E1}', factory: '\u{1F3ED}',
};

function formatCost(costObj, items) {
  return Object.entries(costObj || {}).map(([k, v]) => {
    const name = items[k] ? items[k].name.toLowerCase() : k;
    return v + ' ' + name;
  }).join(' \u00B7 ');
}

function doBuild(entry, key, ctx) {
  if (!canPlaceAt(entry.cx, entry.cz, ctx)) { ctx.sfxError(); ctx.showToast('Cannot build here'); return; }
  const cost = getBuildCost(key, 0);
  if (!ctx.hasItems(cost)) { ctx.sfxError(); ctx.showToast('Not enough resources'); return; }
  const bt = BUILDING_TYPES[key];
  const tier0 = UPGRADE_TIERS[key][0];
  entry.building = key; entry.tier = 0;
  entry.maxHp = tier0.maxHp; entry.hp = tier0.maxHp; entry.rotation = 0;
  if (entry.mesh) ctx.scene.remove(entry.mesh);
  if (entry.edge) ctx.scene.remove(entry.edge);
  const mi = ctx.foundationTargets.indexOf(entry.mesh);
  if (mi !== -1) ctx.foundationTargets.splice(mi, 1);
  if (entry.collider) entry.collider = null;
  entry.mesh = null; entry.edge = null;
  const center = getCellCenter(entry.cx, entry.cz, ctx);
  const meshes = makeBuildingMesh(key, tier0.color, false, 1, ctx);
  meshes.forEach(m => { m.position.x += center.x; m.position.z += center.z; ctx.scene.add(m); });
  entry.buildingMeshes = meshes;
  meshes.forEach(m => ctx.buildingTargets.push(m));
  const aabbs = getBuildingAABBs(center.x, center.z, key, 0, ctx);
  aabbs.forEach(a => ctx.buildingColliders.push(a));
  entry.colliderAABBs = aabbs;
  animatePlacement(meshes);
  createHpBar(entry, ctx);
  ctx.spendItems(cost);
  ctx.sfxBuild();
  animateFlash(center.x, center.z, 0xd4a84a, 2, ctx);
  ctx.showToast('Built ' + (bt ? bt.name : key));
  closeBlockPopup(ctx);
  ctx.saveBuildings();
  ctx.resolvePlayerCollision();
}

function recipeSlotKey(itemKey) {
  const item = ITEMS[itemKey];
  return item && item.icon
    ? '<img class="slot-icon" src="' + item.icon + '" alt="' + item.name + '">'
    : '<div class="slot-icon" style="background:' + (item ? item.color : '#ccc') + ';border-radius:3px;"></div>';
}

function updateRecipeMatch(slots, entry, ctx) {
  const tier = entry.tier || 0;
  const recipes = [];
  if (entry.building === 'workshop') recipes.push(...PROCESS_RECIPES.workshop);
  if (entry.building === 'factory') {
    recipes.push(...PROCESS_RECIPES.factory_t0);
    if (tier >= 1) recipes.push(...PROCESS_RECIPES.factory_t1);
  }
  const filled = slots.filter(s => s.key);
  let matched = null;
  for (const r of recipes) {
    const inputs = Object.entries(r.input);
    if (filled.length < inputs.length) continue;
    let ok = true;
    for (const [ik, iv] of inputs) {
      const slot = filled.find(s => s.key === ik);
      if (!slot || slot.qty < iv) { ok = false; break; }
    }
    if (ok) { matched = r; break; }
  }
  ctx._matchedRecipe = matched;
  return matched;
}

function renderRecipePreview(matched, ctx) {
  const el = ctx.bpRecipePreview;
  if (!matched) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  el.className = 'bp-recipe-btn matched';
  el.classList.add(ctx.playerStats.energy >= matched.energy ? 'ready' : 'no-energy');
  const parts = [];
  for (const [ik, iv] of Object.entries(matched.input)) {
    const item = ITEMS[ik];
    const icon = item && item.icon ? '<img class="preview-icon" src="' + item.icon + '">' : '<span class="preview-icon" style="display:inline-block;background:'+(item?item.color:'#ccc')+';border-radius:2px;"></span>';
    parts.push(icon + '<span class="preview-qty">\u00D7' + iv + '</span>');
  }
  const outParts = [];
  for (const [ik, iv] of Object.entries(matched.output)) {
    const item = ITEMS[ik];
    const icon = item && item.icon ? '<img class="preview-icon" src="' + item.icon + '">' : '<span class="preview-icon" style="display:inline-block;background:'+(item?item.color:'#ccc')+';border-radius:2px;"></span>';
    outParts.push(icon + '<span class="preview-qty">\u00D7' + iv + '</span>');
  }
  el.innerHTML = parts.join(' + ') + ' \u2192 ' + outParts.join(' + ') + ' \u26A1' + matched.energy;
}

function renderDragSlots(entry, ctx) {
  const tier = entry.tier || 0;
  const recipes = [];
  if (entry.building === 'workshop') recipes.push(...PROCESS_RECIPES.workshop);
  if (entry.building === 'factory') {
    recipes.push(...PROCESS_RECIPES.factory_t0);
    if (tier >= 1) recipes.push(...PROCESS_RECIPES.factory_t1);
  }
  const maxInputs = recipes.reduce((m, r) => Math.max(m, Object.keys(r.input).length), 0);

  if (!ctx._dragSlots || ctx._dragSlots.length === 0) {
    ctx._dragSlots = [];
    for (let i = 0; i < Math.min(maxInputs, MAX_SLOTS); i++) ctx._dragSlots.push({ key: null, qty: 0 });
  }

  const container = ctx.bpDragSlots;
  container.innerHTML = '';
  ctx._dragSlots.forEach((slot, i) => {
    const div = document.createElement('div');
    div.className = 'bp-drag-slot' + (slot.key ? ' filled' : '');
    div.dataset.idx = i;

    const idxLabel = document.createElement('span');
    idxLabel.className = 'slot-idx';
    idxLabel.textContent = (i + 1);
    div.appendChild(idxLabel);

    if (slot.key) {
      const item = ITEMS[slot.key];
      div.innerHTML += recipeSlotKey(slot.key);
      const qtyEl = document.createElement('span');
      qtyEl.className = 'slot-qty';
      qtyEl.textContent = slot.qty;
      div.appendChild(qtyEl);

      const adj = document.createElement('div');
      adj.className = 'slot-adj';
      const down = document.createElement('button');
      down.textContent = '\u2212';
      down.addEventListener('click', e => {
        e.stopPropagation();
        const total = ctx.playerInventory[slot.key] || 0;
        const decrement = Math.max(1, Math.ceil(total / 4));
        slot.qty = Math.max(1, slot.qty - decrement);
        renderDragSlots(entry, ctx);
        const matched = updateRecipeMatch(ctx._dragSlots, entry, ctx);
        renderRecipePreview(matched, ctx);
        renderRecipeButtons(matched, entry, ctx);
        ctx.bpNoMatch.style.display = matched ? 'none' : (ctx._dragSlots.some(s => s.key) ? 'block' : 'none');
        ctx.bpProcessBtn.style.display = matched ? 'block' : 'none';
        ctx.bpProcessBtn.textContent = matched ? 'PROCESS ' + formatRecipeOutput(matched).toUpperCase() : 'PROCESS';
      });
      adj.appendChild(down);
      const up = document.createElement('button');
      up.textContent = '+';
      up.addEventListener('click', e => {
        e.stopPropagation();
        const total = ctx.playerInventory[slot.key] || 0;
        const increment = Math.max(1, Math.ceil(total / 4));
        slot.qty = Math.min(total, slot.qty + increment);
        renderDragSlots(entry, ctx);
        const matched = updateRecipeMatch(ctx._dragSlots, entry, ctx);
        renderRecipePreview(matched, ctx);
        renderRecipeButtons(matched, entry, ctx);
        ctx.bpNoMatch.style.display = matched ? 'none' : (ctx._dragSlots.some(s => s.key) ? 'block' : 'none');
        ctx.bpProcessBtn.style.display = matched ? 'block' : 'none';
        ctx.bpProcessBtn.textContent = matched ? 'PROCESS ' + formatRecipeOutput(matched).toUpperCase() : 'PROCESS';
      });
      adj.appendChild(up);
      div.appendChild(adj);

      div.addEventListener('dblclick', e => {
        e.stopPropagation();
        ctx._dragSlots[i] = { key: null, qty: 0 };
        renderDragSlots(entry, ctx);
        const matched = updateRecipeMatch(ctx._dragSlots, entry, ctx);
        renderRecipePreview(matched, ctx);
        renderRecipeButtons(matched, entry, ctx);
        ctx.bpNoMatch.style.display = matched ? 'none' : (ctx._dragSlots.some(s => s.key) ? 'block' : 'none');
        ctx.bpProcessBtn.style.display = matched ? 'block' : 'none';
        ctx.bpProcessBtn.textContent = matched ? 'PROCESS ' + formatRecipeOutput(matched).toUpperCase() : 'PROCESS';
      });
    }

    div.addEventListener('dragover', e => { e.preventDefault(); div.classList.add('dragover'); });
    div.addEventListener('dragleave', () => div.classList.remove('dragover'));
    div.addEventListener('drop', e => {
      e.preventDefault();
      div.classList.remove('dragover');
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data && data.key) {
          const total = ctx.playerInventory[data.key] || 0;
          if (total > 0) {
            ctx._dragSlots[i] = { key: data.key, qty: Math.max(1, Math.min(total, Math.ceil(total / 2))) };
            renderDragSlots(entry, ctx);
            const matched = updateRecipeMatch(ctx._dragSlots, entry, ctx);
            renderRecipePreview(matched, ctx);
            renderRecipeButtons(matched, entry, ctx);
            ctx.bpNoMatch.style.display = matched ? 'none' : (ctx._dragSlots.some(s => s.key) ? 'block' : 'none');
            ctx.bpProcessBtn.style.display = matched ? 'block' : 'none';
            ctx.bpProcessBtn.textContent = matched ? 'PROCESS ' + formatRecipeOutput(matched).toUpperCase() : 'PROCESS';
          }
        }
      } catch(e) {}
    });

    container.appendChild(div);
  });
}

function renderRecipeButtons(matched, entry, ctx) {
  const tier = entry.tier || 0;
  const recipes = [];
  if (entry.building === 'workshop') recipes.push(...PROCESS_RECIPES.workshop);
  if (entry.building === 'factory') {
    recipes.push(...PROCESS_RECIPES.factory_t0);
    if (tier >= 1) recipes.push(...PROCESS_RECIPES.factory_t1);
  }
  const grid = ctx.bpRecipeGrid;
  grid.innerHTML = '';
  recipes.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'bp-recipe-btn';
    if (matched === r) btn.classList.add('matched');
    const canAfford = ctx.hasItems(r.input);
    const hasEnergy = ctx.playerStats.energy >= r.energy;
    btn.disabled = !canAfford || !hasEnergy;

    const formula = document.createElement('span');
    formula.className = 'rec-formula';
    formula.textContent = recipeBtnLabel(r);
    btn.appendChild(formula);

    const energy = document.createElement('span');
    energy.className = 'rec-energy';
    energy.textContent = '\u26A1' + r.energy;
    btn.appendChild(energy);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      processRecipe(r, ctx);
      if (entry) showBlockPopup(entry, ctx);
    });
    grid.appendChild(btn);
  });
}

function renderInvSnapshot(entry, ctx) {
  const tier = entry.tier || 0;
  const recipes = [];
  if (entry.building === 'workshop') recipes.push(...PROCESS_RECIPES.workshop);
  if (entry.building === 'factory') {
    recipes.push(...PROCESS_RECIPES.factory_t0);
    if (tier >= 1) recipes.push(...PROCESS_RECIPES.factory_t1);
  }
  const relevantKeys = new Set();
  recipes.forEach(r => {
    Object.keys(r.input).forEach(k => relevantKeys.add(k));
    Object.keys(r.output).forEach(k => relevantKeys.add(k));
  });
  const grid = ctx.bpInvGrid;
  grid.innerHTML = '';
  const owned = [...relevantKeys].filter(k => (ctx.playerInventory[k] || 0) > 0);
  if (owned.length === 0) {
    grid.innerHTML = '<div style="font-size:8px;color:#8a7f72;text-align:center;padding:4px 0;font-weight:600;letter-spacing:0.05em;">none owned</div>';
    return;
  }
  owned.forEach(key => {
    const item = ITEMS[key];
    const qty = ctx.playerInventory[key] || 0;
    const chip = document.createElement('span');
    chip.className = 'bp-inv-chip';
    chip.draggable = true;
    chip.style.background = `rgba(${parseInt(item.color.slice(1,3),16)},${parseInt(item.color.slice(3,5),16)},${parseInt(item.color.slice(5,7),16)},0.08)`;
    chip.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ key, qty }));
    });
    const icon = item.icon
      ? '<img class="chip-icon" src="' + item.icon + '" alt="' + item.name + '">'
      : '<span class="chip-icon" style="display:inline-block;background:' + item.color + ';border-radius:2px;"></span>';
    chip.innerHTML = icon + '<span style="color:' + item.color + '">' + item.name + '</span> <span class="chip-qty">' + qty + '</span>';
    grid.appendChild(chip);
  });
}

export function showBlockPopup(entry, ctx) {
  ctx.hoverMesh.visible = false;
  ctx.hoverOutline.visible = false;
  buildSelectionOutline(entry, ctx);
  ctx.actionTarget = entry;

  const hasBuilding = !!entry.building;
  const tiers = hasBuilding ? UPGRADE_TIERS[entry.building] : null;
  const tier = entry.tier || 0;
  const tDef = tiers ? tiers[tier] : null;
  const buildingType = entry.building;
  const isProcessor = buildingType === 'workshop' || buildingType === 'factory';

  ctx.bpSubtitleEl.textContent = 'Cell ' + entry.cx + ', ' + entry.cz;
  ctx.bpTitleEl.textContent = hasBuilding ? (tDef ? tDef.name : BUILDING_TYPES[entry.building]?.name || entry.building).toUpperCase() : 'NEW CONSTRUCTION';

  // Tier badge
  if (hasBuilding && tDef && tiers && tiers.length > 1) {
    ctx.bpTierBadge.style.display = 'inline-block';
    ctx.bpTierBadge.className = 't' + tier;
    ctx.bpTierBadge.textContent = tDef.name + ' (Tier ' + (tier + 1) + '/' + tiers.length + ')';
  } else if (hasBuilding && tDef) {
    ctx.bpTierBadge.style.display = 'inline-block';
    ctx.bpTierBadge.className = 't0';
    ctx.bpTierBadge.textContent = tDef.name;
  } else ctx.bpTierBadge.style.display = 'none';

  // HP section
  if (hasBuilding) {
    ctx.bpHpSection.style.display = 'block';
    const hp = entry.hp || 0, maxHp = entry.maxHp || 100, pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    ctx.bpHpFillEl.style.width = pct + '%';
    ctx.bpHpFillEl.style.background = pct > 60 ? '#5a8a6a' : pct > 30 ? '#b8954a' : '#cc4444';
    ctx.bpHpLabelEl.textContent = 'HP ' + Math.round(hp) + '/' + maxHp;
  } else ctx.bpHpSection.style.display = 'none';

  // Energy bar (processor only)
  if (hasBuilding && isProcessor) {
    ctx.bpEnergyBar.style.display = 'block';
    ctx.bpEnergyVal.textContent = Math.round(ctx.playerStats.energy);
    ctx.bpEnergyMax.textContent = ctx.playerStats.maxEnergy;
  } else ctx.bpEnergyBar.style.display = 'none';

  // Drag section (workshop/factory only)
  if (hasBuilding && isProcessor) {
    ctx.bpDragSection.style.display = 'block';
    if (!ctx._dragSlots || ctx._dragSlots.length === 0) {
      ctx._dragSlots = [];
      for (let i = 0; i < MAX_SLOTS; i++) ctx._dragSlots.push({ key: null, qty: 0 });
    }
    ctx.bpClearSlots.style.display = 'block';
    renderDragSlots(entry, ctx);
    const matched = updateRecipeMatch(ctx._dragSlots, entry, ctx);
    renderRecipePreview(matched, ctx);
    ctx.bpNoMatch.style.display = matched ? 'none' : (ctx._dragSlots.some(s => s.key) ? 'block' : 'none');
    ctx.bpProcessBtn.style.display = matched ? 'block' : 'none';
    ctx.bpProcessBtn.textContent = matched ? 'PROCESS ' + formatRecipeOutput(matched).toUpperCase() : 'PROCESS';
  } else ctx.bpDragSection.style.display = 'none';

  // Build section (new construction only)
  ctx.bpBuildSection.style.display = hasBuilding ? 'none' : 'block';
  ctx.bpConfirmRow.style.display = 'none';
  ctx.bpActionSection.style.display = hasBuilding ? 'block' : 'none';
  let selectedKey = null;

  if (!hasBuilding) {
    ctx.bpBuildGrid.innerHTML = '';
    ctx.typeKeys.forEach(key => {
      const bt = BUILDING_TYPES[key];
      if (!bt) return;
      const cost = getBuildCost(key, 0);
      const canAfford = ctx.hasItems(cost);
      const card = document.createElement('button');
      card.className = 'bp-card' + (canAfford ? '' : ' locked');
      card.dataset.key = key;

      const iconEl = document.createElement('span');
      iconEl.className = 'bp-card-icon';
      iconEl.textContent = BUILD_ICONS[key] || '\u{2753}';
      card.appendChild(iconEl);

      const nameEl = document.createElement('span');
      nameEl.className = 'bp-card-name';
      nameEl.textContent = bt.name.toUpperCase();
      card.appendChild(nameEl);

      const costEl = document.createElement('span');
      costEl.className = 'bp-card-cost';
      costEl.textContent = formatCost(cost, ITEMS);
      card.appendChild(costEl);

      if (!canAfford) {
        const badge = document.createElement('span');
        badge.className = 'bp-card-badge';
        badge.textContent = 'need materials';
        card.appendChild(badge);
      }

      if (canAfford) {
        card.addEventListener('click', e => {
          e.stopPropagation();
          ctx.bpBuildGrid.querySelectorAll('.bp-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectedKey = key;
          ctx.bpConfirmRow.style.display = 'flex';
        });
      }

      ctx.bpBuildGrid.appendChild(card);
    });
  }

  // Recipe section (workshop/factory only)
  if (hasBuilding && isProcessor) {
    ctx.bpRecipeSection.style.display = 'block';
    renderRecipeButtons(ctx._matchedRecipe, entry, ctx);
  } else ctx.bpRecipeSection.style.display = 'none';

  // Action section
  ctx.bpActionGrid.innerHTML = '';
  if (hasBuilding) {
    const nextTier = tiers ? tiers[tier + 1] : null;
    if (nextTier) {
      const uBtn = document.createElement('button'); uBtn.className = 'bp-btn'; uBtn.textContent = 'Upgrade ' + nextTier.name;
      uBtn.addEventListener('click', e => { e.stopPropagation(); handleUpgrade(entry, ctx); });
      ctx.bpActionGrid.appendChild(uBtn);
    }
    if (tier > 0) {
      const dwBtn = document.createElement('button'); dwBtn.className = 'bp-btn'; dwBtn.textContent = 'Downgrade';
      dwBtn.addEventListener('click', e => { e.stopPropagation(); handleDowngrade(entry, ctx); });
      ctx.bpActionGrid.appendChild(dwBtn);
    }
    const rBtn = document.createElement('button'); rBtn.className = 'bp-btn'; rBtn.textContent = 'Rotate';
    rBtn.addEventListener('click', e => { e.stopPropagation(); handleRotate(entry, ctx); });
    ctx.bpActionGrid.appendChild(rBtn);
    const dBtn = document.createElement('button'); dBtn.className = 'bp-btn'; dBtn.textContent = 'Dismantle';
    dBtn.addEventListener('click', e => { e.stopPropagation(); handleDismantle(entry, ctx); });
    ctx.bpActionGrid.appendChild(dBtn);
    const repBtn = document.createElement('button'); repBtn.className = 'bp-btn'; repBtn.textContent = 'Repair';
    if ((entry.hp || 0) >= (entry.maxHp || 100)) {
      repBtn.style.display = 'none';
    } else {
      const cost = getBuildCost(entry.building, entry.tier || 0);
      const primary = Object.keys(cost)[0];
      if (primary) repBtn.textContent = 'Repair (+50 HP, ' + Math.ceil(50/20) + ' ' + (ITEMS[primary]?.name?.toLowerCase() || primary) + ')';
    }
    repBtn.addEventListener('click', e => { e.stopPropagation(); handleRepair(entry, ctx); });
    ctx.bpActionGrid.appendChild(repBtn);
  }

  // Inventory snapshot (processor only)
  if (hasBuilding && isProcessor) {
    ctx.bpInvSnapshot.style.display = 'block';
    renderInvSnapshot(entry, ctx);
  } else ctx.bpInvSnapshot.style.display = 'none';

  ctx.bpBuildBtn.onclick = e => {
    e.stopPropagation();
    if (selectedKey) doBuild(entry, selectedKey, ctx);
  };

  if (!ctx.bpEl.matches(':popover-open')) ctx.bpEl.showPopover();
}

export function closeBlockPopup(ctx) {
  for (let i = ctx.foundations.length - 1; i >= 0; i--) {
    if (!ctx.foundations[i].building && !ctx.foundations[i].mesh) ctx.foundations.splice(i, 1);
  }
  clearSelectionOutline(ctx);
  ctx.actionTarget = null;
  ctx.bpEl.hidePopover();
}

// ── BUILDING ACTIONS ──

export function handleRotate(entry, ctx) {
  if (!entry.building) return;
  const r = ((entry.rotation || 0) + 1) % 4;
  const center = getCellCenter(entry.cx, entry.cz, ctx);
  (entry.buildingMeshes || []).forEach(m => {
    const ox = m.position.x - center.x, oz = m.position.z - center.z;
    m.position.x = center.x + ox * Math.cos(Math.PI/2) - oz * Math.sin(Math.PI/2);
    m.position.z = center.z + ox * Math.sin(Math.PI/2) + oz * Math.cos(Math.PI/2);
    m.rotation.y += Math.PI / 2;
  });
  (entry.colliderAABBs || []).forEach(a => { const ci = ctx.buildingColliders.indexOf(a); if (ci !== -1) ctx.buildingColliders.splice(ci, 1); });
  entry.rotation = r;
  const newAABBs = getBuildingAABBs(center.x, center.z, entry.building, r, ctx);
  newAABBs.forEach(a => ctx.buildingColliders.push(a));
  entry.colliderAABBs = newAABBs;
  showBlockPopup(entry, ctx);
  ctx.saveBuildings();
}

export function handleUpgrade(entry, ctx) {
  if (!entry.building) return;
  const tiers = UPGRADE_TIERS[entry.building];
  if (!tiers || entry.tier >= tiers.length - 1) return;
  const nextTier = entry.tier + 1;
  const cost = getBuildCost(entry.building, nextTier);
  if (!ctx.hasItems(cost)) { ctx.sfxError(); ctx.showToast('Not enough resources'); return; }
  const tDef = tiers[nextTier];
  (entry.buildingMeshes || []).forEach(m => { ctx.scene.remove(m); const mi = ctx.buildingTargets.indexOf(m); if (mi !== -1) ctx.buildingTargets.splice(mi, 1); });
  const center = getCellCenter(entry.cx, entry.cz, ctx);
  const meshes = makeBuildingMesh(entry.building, tDef.color, false, 1, ctx);
  meshes.forEach(m => {
    m.position.x += center.x; m.position.z += center.z;
    if (entry.rotation) {
      const ox = m.position.x - center.x, oz = m.position.z - center.z, r = entry.rotation * Math.PI / 2;
      m.position.x = center.x + ox * Math.cos(r) - oz * Math.sin(r);
      m.position.z = center.z + ox * Math.sin(r) + oz * Math.cos(r);
      m.rotation.y += r;
    }
    ctx.scene.add(m);
  });
  entry.buildingMeshes = meshes; meshes.forEach(m => ctx.buildingTargets.push(m));
  entry.tier = nextTier; entry.maxHp = tDef.maxHp; entry.hp = Math.min(entry.hp || 0, tDef.maxHp);
  refreshHpBar(entry, ctx);
  ctx.spendItems(cost); ctx.saveInventory(); ctx.sfxUpgrade();
  animateFlash(center.x, center.z, 0xffdd55, 3, ctx);
  ctx.showToast('Upgraded to ' + tDef.name);
  showBlockPopup(entry, ctx);
  ctx.saveBuildings();
}

export function handleDowngrade(entry, ctx) {
  if (!entry.building || !entry.tier) return;
  const tiers = UPGRADE_TIERS[entry.building];
  if (!tiers) return;
  const prevTier = entry.tier - 1;
  const tDef = tiers[prevTier];
  (entry.buildingMeshes || []).forEach(m => { ctx.scene.remove(m); const mi = ctx.buildingTargets.indexOf(m); if (mi !== -1) ctx.buildingTargets.splice(mi, 1); });
  const center = getCellCenter(entry.cx, entry.cz, ctx);
  const meshes = makeBuildingMesh(entry.building, tDef.color, false, 1, ctx);
  meshes.forEach(m => {
    m.position.x += center.x; m.position.z += center.z;
    if (entry.rotation) {
      const ox = m.position.x - center.x, oz = m.position.z - center.z, r = entry.rotation * Math.PI / 2;
      m.position.x = center.x + ox * Math.cos(r) - oz * Math.sin(r);
      m.position.z = center.z + ox * Math.sin(r) + oz * Math.cos(r);
      m.rotation.y += r;
    }
    ctx.scene.add(m);
  });
  entry.buildingMeshes = meshes; meshes.forEach(m => ctx.buildingTargets.push(m));
  entry.tier = prevTier; entry.maxHp = tDef.maxHp; entry.hp = Math.min(entry.hp || 0, tDef.maxHp);
  refreshHpBar(entry, ctx);
  const refundCost = getBuildCost(entry.building, prevTier);
  const refund = {}; for (const k of Object.keys(refundCost)) refund[k] = Math.ceil(refundCost[k] / 2);
  ctx.addItems(refund); ctx.saveInventory();
  ctx.showToast('Downgraded to ' + tDef.name);
  showBlockPopup(entry, ctx);
  ctx.saveBuildings();
}

export function handleDismantle(entry, ctx) {
  const captured = entry;
  closeBlockPopup(ctx);
  (captured.buildingMeshes || []).forEach(m => { ctx.scene.remove(m); const mi = ctx.buildingTargets.indexOf(m); if (mi !== -1) ctx.buildingTargets.splice(mi, 1); });
  (captured.colliderAABBs || []).forEach(a => { const ci = ctx.buildingColliders.indexOf(a); if (ci !== -1) ctx.buildingColliders.splice(ci, 1); });
  removeHpBar(captured, ctx);
  const refundCost = getBuildCost(captured.building, captured.tier || 0);
  const refund = {}; for (const k of Object.keys(refundCost)) refund[k] = Math.ceil(refundCost[k] / 2);
  ctx.addItems(refund); ctx.saveInventory();
  captured.building = null; captured.buildingMeshes = null; captured.rotation = 0; captured.tier = 0; captured.hp = 0;
  ctx.sfxDismantle();
  const dCenter = getCellCenter(captured.cx, captured.cz, ctx);
  animateFlash(dCenter.x, dCenter.z, 0xcc6644, 2, ctx);
  ctx.showToast('Building dismantled');
  buildFoundationFrom(captured, ctx);
  ctx.saveBuildings();
}

export function handleRepair(entry, ctx) {
  if (!entry.building || entry.hp >= entry.maxHp) return;
  const cost = getBuildCost(entry.building, entry.tier || 0);
  const primary = Object.keys(cost)[0];
  if (primary) {
    const needed = Math.ceil(50 / 20);
    const repairCost = {}; repairCost[primary] = needed;
    if (!ctx.hasItems(repairCost)) { ctx.sfxError(); ctx.showToast('Not enough ' + (ITEMS[primary]?.name?.toLowerCase() || primary)); return; }
    ctx.spendItems(repairCost); ctx.saveInventory();
  }
  entry.hp = Math.min(entry.maxHp, (entry.hp || 0) + 50);
  refreshHpBar(entry, ctx);
  ctx.sfxRepair();
  ctx.showToast('Repaired +50 HP');
  showBlockPopup(entry, ctx);
  ctx.saveBuildings();
}

// ── SAVE / LOAD BUILDINGS ──

export function saveBuildings(ctx) {
  const data = [];
  for (const f of ctx.foundations) {
    if (!f.building) continue;
    data.push({ cx: f.cx, cz: f.cz, building: f.building, rotation: f.rotation || 0, tier: f.tier || 0, hp: f.hp || 100 });
  }
  try { localStorage.setItem('safayi_' + ctx.PLANET_NAME, JSON.stringify(data)); } catch(e) {}
}

export function loadBuildings(ctx) {
  let raw; try { raw = localStorage.getItem('safayi_' + ctx.PLANET_NAME); } catch(e) {}
  if (!raw) return;
  let data; try { data = JSON.parse(raw); } catch(e) {}
  if (!data) return;
  const savedToast = ctx.showToast; ctx.showToast = () => {};
  for (const d of data) {
    if (!d.building) continue;
    placeBuilding(d.cx, d.cz, d.building, d.rotation || 0, ctx, true);
    const entry = ctx.foundations[ctx.foundations.length - 1];
    if (entry) { entry.tier = d.tier || 0; entry.hp = d.hp || 100; refreshHpBar(entry, ctx); }
  }
  ctx.showToast = savedToast;
  saveBuildings(ctx);
}
