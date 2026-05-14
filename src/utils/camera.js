export function init(ctx) {
  ctx.state.mode = 'isometric';
  ctx.state.zoom = 1;
  ctx.state.pitch = Math.PI / 3;
  ctx.state.yaw = Math.PI / 4;
  ctx.state.dist = 120;
  ctx.state.smoothPos = new THREE.Vector3();
  ctx.state.smoothTarget = new THREE.Vector3();

  document.getElementById('mode-display').textContent = 'ISOMETRIC';
}

export function toggleMode(ctx) {
  ctx.state.mode = ctx.state.mode === 'isometric' ? 'third-person' : 'isometric';
  document.getElementById('mode-display').textContent =
    ctx.state.mode.toUpperCase().replace('-', ' ');
}

export function update(dt, ctx) {
  const pp = ctx.player.position.clone();
  pp.y += 1.6;
  const z = ctx.state.zoom;
  const state = ctx.state;

  if (state.mode === 'isometric') {
    const d = state.dist / z;
    const cx = pp.x + Math.sin(state.yaw) * Math.cos(state.pitch) * d;
    const cy = pp.y + Math.sin(state.pitch) * d;
    const cz = pp.z + Math.cos(state.yaw) * Math.cos(state.pitch) * d;
    state.smoothPos.lerp(new THREE.Vector3(cx, cy, cz), 8 * dt);
    state.smoothTarget.lerp(pp, 10 * dt);
  } else {
    const dist = Math.max(3, 10 / z);
    const dir = state.playerDir;
    const cx = pp.x - Math.sin(dir) * dist;
    const cz = pp.z - Math.cos(dir) * dist;
    state.smoothPos.lerp(new THREE.Vector3(cx, pp.y + 4, cz), 8 * dt);
    state.smoothTarget.lerp(pp, 10 * dt);
  }

  ctx.camera.position.copy(state.smoothPos);
  ctx.camera.lookAt(state.smoothTarget);
}
