export function buildPlayer(ctx) {
  const g = new THREE.Group();
  const matBody = new THREE.MeshLambertMaterial({ color: '#2a5a8a' });
  const matSkin = new THREE.MeshLambertMaterial({ color: '#e8c87a' });
  const matLeg = new THREE.MeshLambertMaterial({ color: '#3a3a5a' });

  const s = 3;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.8 * s, 1.6 * s, 1.0 * s), matBody);
  torso.position.y = 1.9 * s;
  torso.castShadow = true;
  g.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.7 * s, 8, 8), matSkin);
  head.position.y = 3.1 * s;
  head.castShadow = true;
  g.add(head);

  const arms = [];
  const legs = [];
  [-1, 1].forEach(side => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.24 * s, 1.2 * s, 0.24 * s), matSkin);
    arm.position.set(side * 1.1 * s, 1.4 * s, 0);
    arm.castShadow = true;
    arm.userData.restX = side * 1.1 * s;
    g.add(arm);
    arms.push(arm);

    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3 * s, 1.2 * s, 0.3 * s), matLeg);
    leg.position.set(side * 0.44 * s, 0.6 * s, 0);
    leg.castShadow = true;
    leg.userData.restX = side * 0.44 * s;
    g.add(leg);
    legs.push(leg);
  });

  g.position.set(0, 0, 0);
  ctx.scene.add(g);

  ctx.player = g;
  ctx.playerObj = { group: g, arms, legs, animTime: 0, prevPos: { x: 0, z: 0 }, isMoving: false };

  ctx.playerStats = {
    health: 100, maxHealth: 100,
    energy: 100, maxEnergy: 100,
    stamina: 100, maxStamina: 100,
    healthRegen: 1,
    energyRegen: 0.17,
    staminaRegen: 8,
    lastDamageTime: 0,
    isMoving: false,
    credits: 500,
  };
}

let hf, hn, ef, enEl, sf, sn, ce;
function getStatEls() {
  if (!hf) {
    hf = document.getElementById('health-fill'); hn = document.getElementById('health-num');
    ef = document.getElementById('energy-fill'); enEl = document.getElementById('energy-num');
    sf = document.getElementById('stamina-fill'); sn = document.getElementById('stamina-num');
    ce = document.getElementById('credits-num');
  }
  return [hf, hn, ef, enEl, sf, sn, ce];
}

export function updateStatsUI(ctx) {
  const s = ctx.playerStats;
  const [hfill, hnum, efill, enEl, sfill, snum, ce] = getStatEls();
  hfill.style.width = (s.health / s.maxHealth * 100) + '%';
  hnum.textContent = Math.round(s.health);
  efill.style.width = (s.energy / s.maxEnergy * 100) + '%';
  enEl.textContent = Math.round(s.energy);
  sfill.style.width = (s.stamina / s.maxStamina * 100) + '%';
  snum.textContent = Math.round(s.stamina);
  if (ce) ce.textContent = Math.floor(s.credits).toLocaleString();
}

export function drainEnergy(amount, ctx) {
  ctx.playerStats.energy = Math.max(0, ctx.playerStats.energy - amount);
  updateStatsUI(ctx);
}

export function updatePlayerMovement(dt, ctx) {
  let mx = 0, mz = 0;
  const k = ctx.state.keys;
  const state = ctx.state;
  const player = ctx.player;
  const playerObj = ctx.playerObj;
  const stats = ctx.playerStats;

  if (state.mode === 'isometric') {
    if (k['ArrowUp'] || k['KeyW']) { mx -= 1; mz -= 1; }
    if (k['ArrowDown'] || k['KeyS']) { mx += 1; mz += 1; }
    if (k['ArrowLeft'] || k['KeyA']) { mx -= 1; mz += 1; }
    if (k['ArrowRight'] || k['KeyD']) { mx += 1; mz -= 1; }
  } else {
    const d = state.playerDir;
    if (k['ArrowUp'] || k['KeyW']) { mx -= Math.sin(d); mz -= Math.cos(d); }
    if (k['ArrowDown'] || k['KeyS']) { mx += Math.sin(d); mz += Math.cos(d); }
    if (k['ArrowLeft'] || k['KeyA']) { mx -= Math.cos(d); mz += Math.sin(d); }
    if (k['ArrowRight'] || k['KeyD']) { mx += Math.cos(d); mz -= Math.sin(d); }
  }

  const len2 = mx * mx + mz * mz;
  const isMoving = len2 > 0;
  playerObj.isMoving = isMoving;
  stats.isMoving = isMoving;

  const sprinting = isMoving && k['Space'] && stats.stamina > 0;
  const speedMult = sprinting ? 2.5 : 1;
  const speed = 90 * dt * speedMult;

  if (sprinting) {
    stats.stamina = Math.max(0, stats.stamina - 18 * dt);
  }

  if (isMoving) {
    const inv = speed / Math.sqrt(len2);
    const limit = ctx.HALF - 3;
    const nx = player.position.x + mx * inv;
    const nz = player.position.z + mz * inv;
    const px = !ctx.anyCollision(nx, player.position.z)
      ? Math.max(-limit, Math.min(limit, nx)) : player.position.x;
    const pz = !ctx.anyCollision(player.position.x, nz)
      ? Math.max(-limit, Math.min(limit, nz)) : player.position.z;
    player.position.x = px;
    player.position.z = pz;
    playerObj.animTime += dt * 8;
  } else {
    playerObj.animTime = 0;
  }

  if (playerObj.isMoving && state.mode === 'isometric') {
    state.playerDir = Math.atan2(mx, mz);
  }
  player.position.y = 0;
  player.rotation.y = state.playerDir;

  const swing = playerObj.isMoving ? Math.sin(playerObj.animTime) * 1.2 : 0;
  playerObj.arms[0].rotation.x = swing;
  playerObj.arms[1].rotation.x = -swing;
  playerObj.legs[0].rotation.x = -swing;
  playerObj.legs[1].rotation.x = swing;
  if (playerObj.isMoving) {
    const bounce = Math.abs(Math.sin(playerObj.animTime)) * 0.15;
    player.position.y += bounce;
  }
}
