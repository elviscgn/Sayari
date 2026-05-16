export function init(ctx) {
  const controlsHint = document.getElementById('controls-hint');
  let controlsVisible = !controlsHint.classList.contains('collapsed');

  document.getElementById('help-toggle').addEventListener('click', () => {
    controlsVisible = !controlsVisible;
    controlsHint.classList.toggle('collapsed', !controlsVisible);
    document.getElementById('help-toggle').textContent = controlsVisible ? '\u2716' : '?';
  });
}
