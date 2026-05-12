# Safayi

Two-file 3D solar system with walkable planet surfaces.

## Quick start

Open `solar-system.html` in any browser. Click a planet → Info panel → "Enter Planet" navigates to `surface.html?planet=Name`.

## Files

- **`solar-system.html`** — Solar system view (orbits, click-to-lock, info panel, procedural planet textures, Sun shader)
- **`surface.html`** — Planet surface (standalone, navigated to via query param `?planet=Name`)

Three.js r128 from CDN (`jsDelivr`), no bundler, no npm, no tests, no CI.

## Surface scene

- **Terrain**: PlaneGeometry(600x600, 120 segs) with value noise FBM (6 octaves, seeded per planet name), vertex-colored per-planet
- **Camera**: PerspectiveCamera at fixed angle (~60 deg), not orthographic. Smooth follow via lerp
- **Player**: Low-poly humanoid (BoxGeometry torso/arms/legs, SphereGeometry head)
- **Movement**: Arrow keys / WASD, mouse raycast-aims on terrain, `e.preventDefault()` on arrow keys

## Camera modes on surface

- **Isometric** (default) — PerspectiveCamera at fixed pitch/yaw, screen-relative arrow movement
- **Third-person** — PerspectiveCamera behind player, movement relative to player facing
- **V** to toggle, scroll to zoom

## Known conventions

- Terrain uses `hash2D` from planet name seed, not Math.random
- Navigates between files via `window.location.href` — no single-page app
- `opencode.json` loads `AGENTS.md` as instructions
