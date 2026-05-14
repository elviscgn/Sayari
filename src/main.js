import './style.css';

import { RESOURCE_TYPES, buildTerrain, buildLights, buildGrid, buildCellHover, getCell, getCellCenter, generateResources, spawnParticles, mineResource } from './terrain.js';
import { buildPlayer, updatePlayerMovement, updateStatsUI, drainEnergy } from './player.js';
import { init as initCamera, toggleMode, update as updateCamera } from './utils/camera.js';
import { makeRng } from './utils/noise.js';

import { BUILDING_TYPES, UPGRADE_TIERS, BUILD_COSTS, PROCESS_RECIPES, PLANET_BUILDS, ITEMS, ITEM_ORDER,
  getBuildCost, anyCollision, makeBuildingMesh, getBuildingAABBs,
  placeFoundation, canPlaceAt, placeBuilding,
  initBlockPopup, showBlockPopup, closeBlockPopup,
  handleRotate, handleUpgrade, handleDowngrade, handleDismantle, handleRepair,
  createHpBar, refreshHpBar, updateHpBars,
  saveBuildings, loadBuildings } from './buildings.js';

import { init as initHud, updateCoords } from './ui/hud.js';
import { init as initHotbar, buildHotbar, refreshHotbar, flashHotbar } from './ui/hotbar.js';
import { init as initInventory, openInventory, closeInventory } from './ui/inventory.js';
import { init as initControls } from './ui/controls.js';

// ── PLANET DATA ──

const PLANET_COLORS = {
  Mercury: { base:'#8c8680', high:'#c8b8a0', sky:[40,37,32] },
  Venus:   { base:'#d4a855', high:'#e8c97a', sky:[90,64,32] },
  Earth:   { base:'#3a8a3a', high:'#6aaa50', sky:[79,163,224] },
  Mars:    { base:'#9c3a1a', high:'#c06030', sky:[193,68,14] },
  Jupiter: { base:'#c8955a', high:'#d4a060', sky:[96,64,32] },
  Saturn:  { base:'#c8b080', high:'#d4c090', sky:[80,64,48] },
  Uranus:  { base:'#6acccc', high:'#7de8d8', sky:[32,128,128] },
  Neptune: { base:'#2244dd', high:'#4466ee', sky:[26,42,128] },
};

const params = new URLSearchParams(window.location.search);
const PLANET_NAME = params.get('planet') || 'Earth';
const PLANET_DATA = PLANET_COLORS[PLANET_NAME] || PLANET_COLORS.Earth;
const SEED = PLANET_NAME.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

// ── CONSTANTS ──

const TS = 1800;
const CELL = 45;
const CELLS = TS / CELL;
const HALF = TS / 2;
const NUM_RESOURCES = 120;
const MINE_COOLDOWN = 300;
const PLAYER_RADIUS = 3.0;
const TOOLS = {
  wood_pickaxe:  { name:'Wood Pickaxe',  color:'#8B4513', tier:1, maxDurability:100, craft:{ wood:5 } },
  stone_pickaxe: { name:'Stone Pickaxe', color:'#808080', tier:2, maxDurability:200, craft:{ wood:3, stone:5 } },
  metal_pickaxe: { name:'Metal Pickaxe', color:'#4488cc', tier:3, maxDurability:350, craft:{ wood:3, metal:5 } },
};

// ── THREE.JS SETUP ──

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('canvas-container').appendChild(renderer.domElement);

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(50, aspect, 0.5, 1000);

// ── CONTEXT OBJECT ──

console.log('PLANET_DATA =', PLANET_DATA);
const ctx = {
  scene, camera, renderer,
  PLANET_NAME: PLANET_NAME, PLANET_DATA: PLANET_DATA, SEED: SEED, TS: TS, CELL: CELL, CELLS: CELLS,
  HALF: HALF, NUM_RESOURCES: NUM_RESOURCES, MINE_COOLDOWN: MINE_COOLDOWN, PLAYER_RADIUS: PLAYER_RADIUS, TOOLS: TOOLS,
  BUILDING_TYPES, UPGRADE_TIERS, BUILD_COSTS, PROCESS_RECIPES, PLANET_BUILDS, ITEMS, ITEM_ORDER, RESOURCE_TYPES,
  getBuildCost, anyCollision, makeBuildingMesh, getBuildingAABBs,
  placeFoundation, canPlaceAt, placeBuilding,
  showBlockPopup, closeBlockPopup,
  handleRotate, handleUpgrade, handleDowngrade, handleDismantle, handleRepair,
  createHpBar, refreshHpBar, updateHpBars,
  saveBuildings, loadBuildings,
  generateResources, mineResource, spawnParticles, getCell, getCellCenter,
  updateStatsUI, drainEnergy,
  openInventory, closeInventory,
  buildHotbar, refreshHotbar, flashHotbar,
  typeKeys: PLANET_BUILDS[PLANET_NAME] || Object.keys(BUILDING_TYPES),
  foundations: [],
  foundationTargets: [],
  buildingTargets: [],
  buildingColliders: [],
  resourceNodes: [],
  cellResources: {},
  lastMineTime: 0,
  playerInventory: {},
  playerTools: {},
  equippedTool: null,
  hpBarMeshes: [],
  factoryModelScene: null,
  state: {
    mode: 'isometric', zoom: 1, pitch: Math.PI / 3, yaw: Math.PI / 4, dist: 120,
    playerDir: 0, keys: {},
    smoothPos: new THREE.Vector3(), smoothTarget: new THREE.Vector3(),
    shadowFollow: new THREE.Vector3(),
  },
};

// ── FACTORY MODEL LOADER ──

(function loadFactoryModel() {
  const loader = new THREE.GLTFLoader();
  loader.load('assets/factory.glb', gltf => {
    ctx.factoryModelScene = gltf.scene;
    ctx.factoryModelScene.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  }, undefined, () => {});
})();

// ── AUDIO ──

let audioCtx = null;
function initAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {} } }
function playTone(freq, dur, type, vol) {
  try {
    initAudio(); if (!audioCtx) return;
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol || 0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (dur || 0.1));
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + (dur || 0.1));
  } catch(e) {}
}
ctx.playTone = playTone;
ctx.sfxBuild = () => playTone(440, 0.12, 'square', 0.04);
ctx.sfxMineTree = () => { playTone(140, 0.1, 'triangle', 0.07); playTone(110, 0.15, 'sine', 0.04); };
ctx.sfxMineRock = () => { playTone(380, 0.06, 'square', 0.05); playTone(520, 0.04, 'triangle', 0.03); };
ctx.sfxUpgrade = () => playTone(660, 0.18, 'sine', 0.05);
ctx.sfxError = () => playTone(150, 0.2, 'sawtooth', 0.03);
ctx.sfxClick = () => playTone(880, 0.04, 'sine', 0.02);
ctx.sfxDismantle = () => playTone(300, 0.15, 'sawtooth', 0.04);
ctx.sfxRepair = () => playTone(520, 0.1, 'triangle', 0.04);
ctx.sfxProcess = () => { playTone(880, 0.08, 'sine', 0.04); playTone(1100, 0.06, 'sine', 0.03); };

// ── AMBIENT MUSIC ──

let ambientNodes = [], ambientStarted = false;
function startAmbientMusic() {
  if (ambientStarted) return;
  try {
    initAudio(); if (!audioCtx) return; ambientStarted = true;
    const baseIdx = SEED % 12;
    const SCALE = [0,2,4,5,7,9,11];
    const note = 55 + SCALE[baseIdx % SCALE.length] + Math.floor(SEED/12)*12;
    const baseFreq = 27.5 * Math.pow(2, (note-21)/12);
    const oscs = [], gains = [];
    for (let i = 0; i < 3; i++) {
      const f = baseFreq * Math.pow(2, i*12/12);
      const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(f + (i-1)*0.3, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.025 - i*0.005, audioCtx.currentTime);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); oscs.push(osc); gains.push(gain);
      ambientNodes.push(osc, gain);
    }
    const lfo = audioCtx.createOscillator(), lfoGain = audioCtx.createGain();
    lfo.type = 'sine'; lfo.frequency.setValueAtTime(0.08 + (SEED%5)*0.02, audioCtx.currentTime);
    lfoGain.gain.setValueAtTime(0.015, audioCtx.currentTime);
    lfo.connect(lfoGain); lfoGain.connect(gains[0].gain); lfoGain.connect(gains[1].gain); lfoGain.connect(gains[2].gain);
    lfo.start(); ambientNodes.push(lfo, lfoGain);
    const fifth = audioCtx.createOscillator(), fifthGain = audioCtx.createGain();
    fifth.type = 'sine'; fifth.frequency.setValueAtTime(baseFreq*1.5, audioCtx.currentTime);
    fifthGain.gain.setValueAtTime(0.012, audioCtx.currentTime);
    fifth.connect(fifthGain); fifthGain.connect(audioCtx.destination);
    fifth.start(); ambientNodes.push(fifth, fifthGain);
    function scheduleChime() {
      if (!ambientStarted) return;
      setTimeout(() => {
        if (!ambientStarted) return;
        playTone(baseFreq * Math.pow(2, SCALE[Math.floor(Math.random()*SCALE.length)]/12) * 2, 0.6+Math.random()*0.4, 'sine', 0.015);
        scheduleChime();
      }, 4000 + Math.random() * 8000);
    }
    scheduleChime();
  } catch(e) {}
}
const firstInteraction = () => { startAmbientMusic(); document.removeEventListener('click', firstInteraction); document.removeEventListener('keydown', firstInteraction); };
document.addEventListener('click', firstInteraction);
document.addEventListener('keydown', firstInteraction);

// ── SHARED HELPERS ──

ctx.hasItems = function(costs) {
  for (const k of Object.keys(costs)) { if ((ctx.playerInventory[k] || 0) < costs[k]) return false; }
  return true;
};

ctx.spendItems = function(costs) {
  for (const k of Object.keys(costs)) { ctx.playerInventory[k] = (ctx.playerInventory[k] || 0) - costs[k]; }
  ctx.refreshHotbar();
};

ctx.addItems = function(items) {
  for (const k of Object.keys(items)) { ctx.playerInventory[k] = (ctx.playerInventory[k] || 0) + items[k]; }
  ctx.refreshHotbar();
  ctx.flashHotbar();
};

ctx.saveInventory = function() {
  try { localStorage.setItem('safayi_inv_' + PLANET_NAME, JSON.stringify(ctx.playerInventory)); } catch(e) {}
  try { localStorage.setItem('safayi_tools_' + PLANET_NAME, JSON.stringify(ctx.playerTools)); } catch(e) {}
  try { localStorage.setItem('safayi_equipped_' + PLANET_NAME, JSON.stringify(ctx.equippedTool)); } catch(e) {}
};

ctx.drainEnergy = drainEnergy;
ctx.PLAYER_RADIUS = PLAYER_RADIUS;
ctx.showToast = function(msg) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  toastContainer.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, 2000);
};

// ── TOAST CONTAINER ──

const toastContainer = document.getElementById('toast-container');

// ── BUILD SCENE ──

buildTerrain(ctx);
buildLights(ctx);
buildGrid(ctx);
buildCellHover(ctx);
buildPlayer(ctx);

// ── INIT MODULES ──

initHud(ctx);
initHotbar(ctx);
initInventory(ctx);
initControls(ctx);
initBlockPopup(ctx);
initCamera(ctx);

// ── INPUT ──

const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const intersectPoint = new THREE.Vector3();
const clickRay = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();

document.addEventListener('keydown', e => {
  ctx.state.keys[e.code] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyV','KeyR','KeyC','KeyE','Escape','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6'].includes(e.code)) e.preventDefault();

  if (e.code === 'KeyV') { toggleMode(ctx); }
  if (e.code === 'KeyE' || e.code === 'KeyC') {
    if (ctx.inventoryOpen) { closeInventory(ctx); } else { openInventory(ctx); }
    return;
  }
  if (e.code === 'Escape') {
    if (ctx.inventoryOpen) { closeInventory(ctx); return; }
    if (ctx.actionTarget) { closeBlockPopup(ctx); return; }
    window.location.href = 'solar-system.html';
  }
  const num = parseInt(e.code.replace('Digit', ''));
  const toolKeys = Object.keys(TOOLS);
  if (num >= 1 && num <= toolKeys.length) {
    const key = toolKeys[num - 1];
    if (ctx.playerTools[key]) {
      ctx.equippedTool = { key, durability: ctx.playerTools[key] };
      ctx.saveInventory(); ctx.refreshHotbar();
      ctx.showToast('Equipped ' + TOOLS[key].name);
    } else { ctx.sfxError(); ctx.showToast('No ' + TOOLS[key].name + ' crafted'); }
  }
});
document.addEventListener('keyup', e => { ctx.state.keys[e.code] = false; });

// ── MOUSE ──

renderer.domElement.addEventListener('mousemove', e => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1, ny = -(e.clientY / window.innerHeight) * 2 + 1;
  mouse.set(nx, ny); ray.setFromCamera(mouse, camera);
  if (ray.ray.intersectPlane(groundPlane, intersectPoint)) {
    const dx = intersectPoint.x - ctx.player.position.x, dz = intersectPoint.z - ctx.player.position.z;
    ctx.state.playerDir = Math.atan2(dx, dz);
    const cell = getCell(intersectPoint.x, intersectPoint.z, ctx);
    const center = getCellCenter(cell.cx, cell.cz, ctx);
    ctx.hoverMesh.position.set(center.x, 0.06, center.z);
    ctx.hoverOutline.position.set(center.x, 0.065, center.z);
    const showHover = !ctx.actionTarget;
    ctx.hoverMesh.visible = showHover;
    ctx.hoverOutline.visible = showHover;
    ctx.hoveredCell = cell;
    document.getElementById('pos-cell').textContent = `Cell: ${cell.cx}, ${cell.cz}`;
  }
});

renderer.domElement.addEventListener('click', e => {
  clickMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  clickRay.setFromCamera(clickMouse, camera);

  let groundCell = null;
  if (clickRay.ray.intersectPlane(groundPlane, intersectPoint)) {
    groundCell = getCell(intersectPoint.x, intersectPoint.z, ctx);
  }

  if (groundCell) {
    const cr = ctx.cellResources[`${groundCell.cx},${groundCell.cz}`];
    if (cr && cr.group && cr.group.visible && cr.group.userData.respawnTimer === null) {
      const childHits = clickRay.intersectObjects(cr.group.children);
      const hitMesh = childHits.length > 0 ? childHits[0].object : null;
      mineResource(cr.group, hitMesh, ctx);
      return;
    }
  }

  const buildingHits = clickRay.intersectObjects(ctx.buildingTargets);
  if (buildingHits.length > 0) {
    const hitMesh = buildingHits[0].object;
    const entry = ctx.foundations.find(f => f.buildingMeshes && f.buildingMeshes.includes(hitMesh));
    if (entry) { showBlockPopup(entry, ctx); return; }
  }

  const foundationHits = clickRay.intersectObjects(ctx.foundationTargets);
  if (foundationHits.length > 0) {
    const hitMesh = foundationHits[0].object;
    const entry = ctx.foundations.find(f => f.mesh === hitMesh);
    if (entry && !entry.building) { showBlockPopup(entry, ctx); return; }
  }

  if (groundCell) {
    const pc = getCell(ctx.player.position.x, ctx.player.position.z, ctx);
    if (groundCell.cx !== pc.cx || groundCell.cz !== pc.cz) {
      let entry = ctx.foundations.find(f => f.cx === groundCell.cx && f.cz === groundCell.cz);
      if (!entry && !ctx.foundations.some(f => f.cx === groundCell.cx && f.cz === groundCell.cz && f.building)) {
        entry = { cx: groundCell.cx, cz: groundCell.cz, mesh: null, edge: null, building: null, buildingMeshes: null, collider: null, tier: 0, hp: 0, maxHp: 100 };
        ctx.foundations.push(entry);
      }
      if (entry && !entry.building && !ctx.wasJustDismissed) { ctx.wasJustDismissed = false; showBlockPopup(entry, ctx); return; }
      if (ctx.wasJustDismissed) ctx.wasJustDismissed = false;
    }
  }
  ctx.wasJustDismissed = false;
});

renderer.domElement.addEventListener('contextmenu', e => { e.preventDefault(); if (ctx.actionTarget) closeBlockPopup(ctx); });
renderer.domElement.addEventListener('wheel', e => { ctx.state.zoom = Math.max(0.3, Math.min(5, ctx.state.zoom + e.deltaY * 0.003)); }, { passive: true });

// ── INVENTORY ──

function freshInventory() {
  for (const k of ITEM_ORDER) ctx.playerInventory[k] = 0;
  ['plank','refined_stone','refined_metal','refined_vib','recycled','circuit'].forEach(k => ctx.playerInventory[k] = 0);
  ctx.playerInventory.wood = 5; ctx.playerInventory.stone = 5; ctx.playerInventory.metal = 3;
  ctx.playerInventory.electronics = 2; ctx.playerInventory.scrap = 2;
  ctx.refreshHotbar();
}

function loadInventory() {
  let raw; try { raw = localStorage.getItem('safayi_inv_' + PLANET_NAME); } catch(e) {}
  if (raw) {
    try {
      const data = JSON.parse(raw); freshInventory();
      const allLoadKeys = [...ITEM_ORDER, 'plank','refined_stone','refined_metal','refined_vib','recycled','circuit'];
      for (const k of allLoadKeys) { if (typeof data[k] === 'number') ctx.playerInventory[k] = data[k]; }
    } catch(e) { freshInventory(); }
  } else { freshInventory(); }
  try { const t = JSON.parse(localStorage.getItem('safayi_tools_' + PLANET_NAME)); if (t) ctx.playerTools = t; } catch(e) {}
  try { const e = JSON.parse(localStorage.getItem('safayi_equipped_' + PLANET_NAME)); if (e && e.key && TOOLS[e.key]) ctx.equippedTool = e; } catch(e) {}
  ctx.refreshHotbar();
}

// ── GAME LOOP ──

const FIXED_DT = 1 / 60;
let accumulator = 0;
let lastTime = performance.now();

function update(dt) {
  updatePlayerMovement(dt, ctx);

  // Camera follow
  updateCamera(dt, ctx);

  // HP bars
  updateHpBars(dt, ctx);

  // Selection pulse
  if (ctx.selectionOutline) {
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.003);
    ctx.selectionOutline.forEach(l => { l.material.opacity = 0.5 + 0.3 * pulse; });
  }

  // Resource bobbing
  const t = performance.now() * 0.001;
  ctx.resourceNodes.forEach((g, i) => { if (g.visible && g.children.length > 0) { g.position.y = Math.sin(t * 0.8 + i * 0.7) * 0.03; } });

  // Coords
  updateCoords(ctx);

  // Shadow camera
  const p = ctx.player.position;
  ctx.state.shadowFollow.lerp(new THREE.Vector3(p.x, 0, p.z), 3 * dt);
  const sun = ctx.sun;
  sun.target.position.set(ctx.state.shadowFollow.x, 0, ctx.state.shadowFollow.z);
  sun.position.set(ctx.state.shadowFollow.x + 80, 100, ctx.state.shadowFollow.z + 40);
  sun.target.updateMatrixWorld();

  // Stats regen
  const now = performance.now();
  const stats = ctx.playerStats;
  if (now - stats.lastDamageTime > 3000) stats.health = Math.min(stats.maxHealth, stats.health + stats.healthRegen * dt);
  stats.energy = Math.min(stats.maxEnergy, stats.energy + stats.energyRegen * dt);
  if (stats.isMoving) stats.stamina = Math.max(0, stats.stamina - 4 * dt);
  else stats.stamina = Math.min(stats.maxStamina, stats.stamina + stats.staminaRegen * dt);
  updateStatsUI(ctx);
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  let frameTime = (now - lastTime) / 1000;
  lastTime = now;
  if (frameTime > 0.1) frameTime = 0.1;
  accumulator += frameTime;
  while (accumulator >= FIXED_DT) { update(FIXED_DT); accumulator -= FIXED_DT; }
  renderer.render(scene, camera);
}

// ── START ──

buildHotbar(ctx);
updateStatsUI(ctx);
animate();

window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

setTimeout(() => {
  document.getElementById('loading').classList.add('hidden');
  loadInventory();
  loadBuildings(ctx);
  generateResources(ctx);
}, 200);
