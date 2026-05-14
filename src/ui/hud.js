export function init(ctx) {
  document.getElementById('planet-name-display').textContent = ctx.PLANET_NAME.toUpperCase();
  document.getElementById('loading-name').textContent = ctx.PLANET_NAME;

  document.getElementById('back-to-space').addEventListener('click', () => {
    window.location.href = 'solar-system.html';
  });
}

export function updateCoords(ctx) {
  document.getElementById('pos-x').textContent = 'X: ' + Math.round(ctx.player.position.x);
  document.getElementById('pos-z').textContent = 'Z: ' + Math.round(ctx.player.position.z);
}
