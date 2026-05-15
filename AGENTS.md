# Safayi

Vite + vanilla JS 3D survival sandbox — solar system, planet surfaces, building, crafting.

## Quick start

```bash
npm run dev
```

Navigate to `http://localhost:5173/?planet=Name` — click cell → build foundation → place building.

## Project structure

- **`index.html`** — Vite entry point
- **`src/main.js`** — Orchestrator: context, scene, input, game loop, audio, GLB loader
- **`src/buildings.js`** — Building types, mesh generation, placement, popup, save/load
- **`src/player.js`** — Player construction, movement, stats
- **`src/terrain.js`** — Terrain gen, resources, mining
- **`src/utils/noise.js`** — Value noise / hash2D
- **`src/utils/camera.js`** — Isometric/third-person camera
- **`src/ui/hud.js`**, **`hotbar.js`**, **`inventory.js`**, **`controls.js`** — UI
- **`src/style.css`** — All styles
- **`assets/`** — GLB models, textures, audio (Vite public dir)

Three.js r128 from CDN (`jsDelivr`), ES modules with `export`/`import`, shared state in `ctx`.

## Factory GLB

- `assets/factory.glb` (24MB) — loaded in `main.js` on startup via GLTFLoader
- Placed via `makeBuildingMesh` in `buildings.js`: cloned from `ctx.factoryModelScene`, scaled to fill `CELL` (45 units) via bounding box extent, Y-offset via `-worldBox.min.y` so bottom sits at ground level
- Available on all planets, 3 upgrade tiers (Workshop → Factory → Automaton)
- Fallback: box geometry if GLB hasn't loaded yet
- `animatePlacement` preserves pre-existing scale (multiplies from 0.01× to 1× of original)

## Known conventions

- Terrain uses `hash2D` from planet name seed, not Math.random
- `opencode.json` loads `AGENTS.md` as instructions
