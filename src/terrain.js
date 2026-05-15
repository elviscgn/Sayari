import { makeRng } from './utils/noise.js';

export function buildGroundTexture(ctx) {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const c2d = c.getContext('2d');

  const baseColor = new THREE.Color(ctx.PLANET_DATA.base);
  const r = Math.round(baseColor.r * 255);
  const g = Math.round(baseColor.g * 255);
  const b = Math.round(baseColor.b * 255);

  c2d.fillStyle = `rgb(${r}, ${g}, ${b})`;
  c2d.fillRect(0, 0, S, S);

  const rng = makeRng(ctx.SEED + 42);
  for (let i = 0; i < 300; i++) {
    const x = rng() * S, y = rng() * S, rad = 5 + rng() * 25;
    const bright = rng() * 0.15 + 0.85;
    const dr = Math.round(r * (1 - bright)), dg = Math.round(g * (1 - bright)), db = Math.round(b * (1 - bright));
    const grad = c2d.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, `rgba(${r + dr}, ${g + dg}, ${b + db}, 0.25)`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    c2d.fillStyle = grad;
    c2d.fillRect(0, 0, S, S);
  }
  for (let i = 0; i < 800; i++) {
    const x = rng() * S, y = rng() * S;
    c2d.fillStyle = `rgba(0,0,0,${0.02 + rng() * 0.06})`;
    c2d.fillRect(x, y, 1 + rng() * 2, 1);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(30, 30);
  tex.anisotropy = ctx.renderer.capabilities.getMaxAnisotropy();
  return tex;
}

export function buildTerrain(ctx) {
  const geo = new THREE.PlaneGeometry(ctx.TS, ctx.TS, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshLambertMaterial({ map: buildGroundTexture(ctx) });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
  return mesh;
}

export function buildLights(ctx) {
  ctx.scene.add(new THREE.AmbientLight('#404060', 0.35));
  const hemi = new THREE.HemisphereLight(
    new THREE.Color(ctx.PLANET_DATA.sky[0]/255, ctx.PLANET_DATA.sky[1]/255, ctx.PLANET_DATA.sky[2]/255),
    0x202020, 0.6
  );
  ctx.scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffe0b0', 1.4);
  sun.position.set(80, 100, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 250;
  sun.shadow.camera.left = -80;
  sun.shadow.camera.right = 80;
  sun.shadow.camera.top = 80;
  sun.shadow.camera.bottom = -80;
  ctx.scene.add(sun);
  ctx.sun = sun;
  const fill = new THREE.DirectionalLight('#8090ff', 0.3);
  fill.position.set(-40, 30, -60);
  ctx.scene.add(fill);
  const skyColor = new THREE.Color(ctx.PLANET_DATA.sky[0]/255, ctx.PLANET_DATA.sky[1]/255, ctx.PLANET_DATA.sky[2]/255);
  ctx.scene.background = skyColor;
  ctx.scene.fog = new THREE.FogExp2(skyColor.clone().multiplyScalar(0.5), 0.0005);
}

export function buildGrid(ctx) {
  const pos = [];
  for (let i = 0; i <= ctx.CELLS; i++) {
    const p = -ctx.HALF + i * ctx.CELL;
    pos.push(-ctx.HALF, 0.05, p, ctx.HALF, 0.05, p);
    pos.push(p, 0.05, -ctx.HALF, p, 0.05, ctx.HALF);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, depthWrite: false, depthTest: false });
  ctx.scene.add(new THREE.LineSegments(geo, mat));
}

export function buildCellHover(ctx) {
  const hoverMat = new THREE.MeshBasicMaterial({
    color: '#ffffff', transparent: true, opacity: 0.2, side: THREE.DoubleSide,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const hoverMesh = new THREE.Mesh(new THREE.PlaneGeometry(ctx.CELL, ctx.CELL), hoverMat);
  hoverMesh.rotation.x = -Math.PI / 2;
  hoverMesh.position.y = 0.06;
  hoverMesh.visible = false;
  ctx.scene.add(hoverMesh);
  ctx.hoverMesh = hoverMesh;

  const outlineMat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false });
  const hh = ctx.CELL / 2;
  const outlinePts = [
    new THREE.Vector3(-hh, 0, -hh), new THREE.Vector3(hh, 0, -hh),
    new THREE.Vector3(hh, 0, hh), new THREE.Vector3(-hh, 0, hh),
    new THREE.Vector3(-hh, 0, -hh),
  ];
  const outlineGeo = new THREE.BufferGeometry().setFromPoints(outlinePts);
  const hoverOutline = new THREE.Line(outlineGeo, outlineMat);
  hoverOutline.rotation.x = -Math.PI / 2;
  hoverOutline.position.y = 0.065;
  hoverOutline.visible = false;
  ctx.scene.add(hoverOutline);
  ctx.hoverOutline = hoverOutline;
  ctx.hoveredCell = null;
}

export function getCell(wx, wz, ctx) {
  const cx = Math.floor((wx + ctx.HALF) / ctx.CELL);
  const cz = Math.floor((wz + ctx.HALF) / ctx.CELL);
  return { cx: Math.max(0, Math.min(ctx.CELLS - 1, cx)), cz: Math.max(0, Math.min(ctx.CELLS - 1, cz)) };
}

export function getCellCenter(cx, cz, ctx) {
  return { x: cx * ctx.CELL + ctx.CELL / 2 - ctx.HALF, z: cz * ctx.CELL + ctx.CELL / 2 - ctx.HALF };
}

export const RESOURCE_TYPES = {
  tree:    { name: 'Tree',      color: 0x3aaa55, drop: { wood: 3 },                hp: 30, respawn: 30000, toolTier: 0 },
  stone:   { name: 'Stone',     color: 0x8a8a8a, drop: { stone: 2 },               hp: 40, respawn: 18000, toolTier: 1 },
  metal:   { name: 'Iron Vein',  color: 0xcc8844, drop: { iron_ore: 3 },           hp: 60, respawn: 25000, toolTier: 2 },
  crystal: { name: 'Crystal',   color: 0xaa66dd, drop: { vibranium_ore: 1, copper_ore: 2 }, hp: 40, respawn: 30000, toolTier: 3 },
};

export function spawnParticles(x, y, z, color, count, ctx) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
  for (let i = 0; i < (count || 5); i++) {
    const size = 0.04 + Math.random() * 0.08;
    const p = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat.clone());
    p.position.set(x + (Math.random() - 0.5) * 0.3, y + 0.3 + Math.random() * 0.3, z + (Math.random() - 0.5) * 0.3);
    const vx = (Math.random() - 0.5) * 3, vy = 2 + Math.random() * 3, vz = (Math.random() - 0.5) * 3;
    ctx.scene.add(p);
    const start = performance.now();
    const dur = 400 + Math.random() * 200;
    function tick() {
      const t = Math.min(1, (performance.now() - start) / dur);
      p.position.x += vx * 0.02; p.position.y += vy * 0.02 - 0.02 * t * 5; p.position.z += vz * 0.02;
      p.material.opacity = 0.8 * (1 - t);
      p.rotation.x += 0.2; p.rotation.z += 0.3;
      if (t < 1) requestAnimationFrame(tick); else ctx.scene.remove(p);
    }
    tick();
  }
}

export function spawnResourceNode(typeKey, cx, cz, ctx) {
  const def = RESOURCE_TYPES[typeKey];
  const group = new THREE.Group();
  const center = getCellCenter(cx, cz, ctx);
  group.position.set(center.x, 0, center.z);
  ctx.cellResources[`${cx},${cz}`] = { typeKey, group, hp: def.hp, maxHp: def.hp, respawnTimer: null };

  const sR = 1.8;
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15, depthWrite: false, side: THREE.DoubleSide });
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(3.0 * sR, 12), shadowMat);
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; shadow.scale.x = 1.4; shadow.userData.noHit = true;
  group.add(shadow);

  const floorMat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(2.0 * sR, 12), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.03; floor.userData.noHit = true;
  group.add(floor);

  if (typeKey === 'tree') {
    const T = 9;
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6a4a2a, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    const offsets = [[0,0], [22,8], [-18,12]];
    for (let ti = 0; ti < offsets.length; ti++) {
      const [ox, oz] = offsets[ti], yOff = ti * 0.15;
      const leafMat = new THREE.MeshLambertMaterial({ color: 0x3aaa55, polygonOffset: true, polygonOffsetFactor: ti - 1, polygonOffsetUnits: ti - 1 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25*T, 0.4*T, 2.0*T, 6), woodMat);
      trunk.position.set(ox, 1.0*T + yOff, oz); trunk.castShadow = true; trunk.userData.treeIdx = ti; group.add(trunk);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(2.8*T, 3.5*T, 7), leafMat);
      crown.position.set(ox, 3.0*T + yOff, oz); crown.castShadow = true; crown.userData.treeIdx = ti; group.add(crown);
      const c2 = new THREE.Mesh(new THREE.ConeGeometry(2.0*T, 2.5*T, 7), leafMat);
      c2.position.set(ox+1.5*T, 4.2*T + yOff, oz+0.6*T); c2.castShadow = true; c2.userData.treeIdx = ti; group.add(c2);
      const c3 = new THREE.Mesh(new THREE.ConeGeometry(1.8*T, 2.2*T, 7), leafMat);
      c3.position.set(ox-1.3*T, 4.0*T + yOff, oz-0.5*T); c3.castShadow = true; c3.userData.treeIdx = ti; group.add(c3);
    }
  } else if (typeKey === 'stone') {
    const RS = 7;
    [[0,1.5,0,0.8],[12,1.0,8,0.5],[-10,0.7,-6,0.35]].forEach(([rx,ry,rz,sf],i) => {
      const rMat = new THREE.MeshLambertMaterial({ color: 0x8a8a8a, polygonOffset: true, polygonOffsetFactor: -i*2, polygonOffsetUnits: -i*2 });
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(sf*RS), rMat);
      rock.position.set(rx,ry,rz); rock.rotation.set(Math.random()*6, Math.random()*6, Math.random()*6);
      rock.castShadow = true; rock.renderOrder = i; group.add(rock);
    });
  } else if (typeKey === 'metal') {
    const oreMat = new THREE.MeshLambertMaterial({ color: 0xcc8844 });
    const vein = new THREE.Mesh(new THREE.OctahedronGeometry(0.6*sR), oreMat);
    vein.position.y = 0.3*sR; vein.rotation.set(Math.random()*6, Math.random()*6, Math.random()*6);
    vein.castShadow = true; group.add(vein);
    const vein2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.4*sR), oreMat);
    vein2.position.set(0.4*sR, 0.15*sR, -0.2*sR); vein2.rotation.set(Math.random()*6, Math.random()*6, Math.random()*6);
    vein2.castShadow = true; group.add(vein2);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.8*sR, 0.15*sR, 0.5*sR), oreMat);
    slab.position.set(0, 0.08*sR, 0); slab.castShadow = true; group.add(slab);
  } else if (typeKey === 'crystal') {
    const glowMat = new THREE.MeshLambertMaterial({ color: 0xaa66dd, emissive: 0x8844cc, emissiveIntensity: 0.4 });
    const crys = new THREE.Mesh(new THREE.OctahedronGeometry(0.5*sR), glowMat);
    crys.position.y = 0.35*sR; crys.rotation.set(Math.random()*6, Math.random()*6, Math.random()*6);
    crys.castShadow = true; group.add(crys);
    const crys2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.3*sR), glowMat);
    crys2.position.set(-0.3*sR, 0.2*sR, 0.4*sR); crys2.rotation.set(Math.random()*6, Math.random()*6, Math.random()*6);
    crys2.castShadow = true; group.add(crys2);
    const glowDot = new THREE.Mesh(new THREE.SphereGeometry(0.08*sR, 6, 6), new THREE.MeshBasicMaterial({ color: 0xdd99ff }));
    glowDot.position.set(0, 0.7*sR, 0); group.add(glowDot);
  }

  group.userData.cellKey = `${cx},${cz}`;
  group.userData.isResource = true;
  group.userData.typeKey = typeKey;
  group.userData.hp = def.hp;
  group.userData.maxHp = def.hp;
  group.userData.respawnTimer = null;

  // Populate flat hit-test array
  group.traverse(c => {
    if (c.isMesh && !c.userData.noHit) {
      c.userData.resourceGroup = group;
      ctx.resourceHitMeshes.push(c);
    }
  });

  ctx.scene.add(group);
  ctx.resourceNodes.push(group);
  return group;
}

export function generateResources(ctx) {
  const rng = makeRng(ctx.SEED + 99);
  const margin = 18, centerExclude = 100;
  const clusterCenters = [];
  const clusterTypes = ['tree','tree','stone','stone','metal','metal','crystal','crystal'];
  for (let ci = 0; ci < clusterTypes.length * 5; ci++) {
    if (clusterCenters.length >= clusterTypes.length) break;
    const wx = -ctx.HALF + margin + rng() * (ctx.TS - margin * 2);
    const wz = -ctx.HALF + margin + rng() * (ctx.TS - margin * 2);
    if (Math.abs(wx) < centerExclude && Math.abs(wz) < centerExclude) continue;
    if (clusterCenters.some(c => Math.hypot(c.x - wx, c.z - wz) < 100)) continue;
    const cell = getCell(wx, wz, ctx);
    if (ctx.foundations.some(f => f.cx === cell.cx && f.cz === cell.cz)) continue;
    clusterCenters.push({ x: wx, z: wz, type: clusterTypes[clusterCenters.length] });
  }

  const usedCells = new Set();
  for (const cc of clusterCenters) {
    const count = cc.type === 'tree' ? 1 : 4 + Math.floor(rng() * 5);
    for (let j = 0; j < count * 20; j++) {
      if (ctx.resourceNodes.length >= ctx.NUM_RESOURCES) break;
      const ang = rng() * Math.PI * 2, rad = 10 + rng() * 35;
      const nx = cc.x + Math.cos(ang) * rad, nz = cc.z + Math.sin(ang) * rad;
      if (Math.abs(nx) > ctx.HALF - margin || Math.abs(nz) > ctx.HALF - margin) continue;
      const cell = getCell(nx, nz, ctx);
      const key = `${cell.cx},${cell.cz}`;
      if (usedCells.has(key)) continue;
      if (ctx.foundations.some(f => f.cx === cell.cx && f.cz === cell.cz)) continue;
      usedCells.add(key);
      spawnResourceNode(cc.type, cell.cx, cell.cz, ctx);
    }
  }
}

export function mineResource(group, hitMesh, ctx) {
  const now = performance.now();
  if (now - ctx.lastMineTime < ctx.MINE_COOLDOWN) return;
  if (ctx.playerStats.energy < 3) { ctx.showToast('Too tired — rest to regain energy'); return; }
  ctx.lastMineTime = now;
  ctx.drainEnergy(3);

  const def = RESOURCE_TYPES[group.userData.typeKey];
  const toolTier = ctx.equippedTool ? (ctx.TOOLS[ctx.equippedTool.key] ? ctx.TOOLS[ctx.equippedTool.key].tier : 0) : 0;
  if (toolTier < def.toolTier) {
    const toolName = def.toolTier === 1 ? 'Wood Pickaxe' : def.toolTier === 2 ? 'Stone Pickaxe' : 'Metal Pickaxe';
    ctx.sfxError(); ctx.showToast('Need ' + toolName + ' to mine this'); return;
  }

  group.userData.hp -= 10;
  if (group.userData.cellKey && ctx.cellResources[group.userData.cellKey]) {
    ctx.cellResources[group.userData.cellKey].hp = group.userData.hp;
  }
  if (ctx.equippedTool && ctx.equippedTool.key !== 'fists') {
    ctx.equippedTool.durability -= 1;
    ctx.playerTools[ctx.equippedTool.key] = ctx.equippedTool.durability;
    if (ctx.equippedTool.durability <= 0) {
      const tier = ctx.TOOLS[ctx.equippedTool.key].tier || 0;
      ctx.playerInventory.scrap = (ctx.playerInventory.scrap || 0) + tier;
      ctx.showToast(ctx.TOOLS[ctx.equippedTool.key].name + ' broke! +' + tier + ' scrap');
      ctx.equippedTool = null; ctx.saveInventory(); ctx.refreshHotbar(); ctx.flashHotbar();
    }
  }

  if (group.userData.typeKey === 'tree') ctx.sfxMineTree();
  else if (group.userData.typeKey === 'stone') ctx.sfxMineRock();
  else ctx.playTone(520, 0.06, 'square', 0.05);
  spawnParticles(group.position.x, group.position.y, group.position.z, def.color, 6, ctx);

  const hitIdx = hitMesh ? hitMesh.userData.treeIdx : undefined;
  group.children.forEach(c => {
    if (!c.material) return;
    if (hitIdx !== undefined && c.userData.treeIdx !== hitIdx) return;
    c.material.emissive = new THREE.Color(0xffffff);
    c.material.emissiveIntensity = 0.6;
    setTimeout(() => { if (c.material) { c.material.emissive = new THREE.Color(0x000000); c.material.emissiveIntensity = 0; } }, 80);
  });

  if (group.userData.hp <= 0) {
    ctx.addItems(def.drop); ctx.saveInventory();
    ctx.showToast('Mined ' + def.name + ' +' + Object.values(def.drop).reduce((a, b) => a + b, 0) + ' resources');
    group.visible = false;
    group.userData.respawnTimer = setTimeout(() => {
      group.userData.hp = group.userData.maxHp; group.visible = true; group.userData.respawnTimer = null;
      if (group.userData.cellKey && ctx.cellResources[group.userData.cellKey]) ctx.cellResources[group.userData.cellKey].hp = group.userData.maxHp;
    }, def.respawn);
  } else {
    ctx.showToast(def.name + ' (' + group.userData.hp + '/' + group.userData.maxHp + ')');
  }
}
