export function init(ctx) {
  document.getElementById('planet-name-display').textContent = ctx.PLANET_NAME.toUpperCase();
  document.getElementById('loading-name').textContent = ctx.PLANET_NAME;

  document.getElementById('back-to-space').addEventListener('click', () => {
    window.location.href = 'solar-system.html';
  });
}

let pxEl, pzEl;
function getCoordEls() {
  if (!pxEl) { pxEl = document.getElementById('pos-x'); pzEl = document.getElementById('pos-z'); }
  return [pxEl, pzEl];
}

export function updateCoords(ctx) {
  const [xEl, zEl] = getCoordEls();
  xEl.textContent = 'X: ' + Math.round(ctx.player.position.x);
  zEl.textContent = 'Z: ' + Math.round(ctx.player.position.z);
}
