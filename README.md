# Safayi

3D solar system survival sandbox with walkable planet surfaces.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (or click a planet from `solar-system.html`).

## What's built

- **Solar system** — 8 planets with procedural textures, animated Sun shader, orbit rings, click-to-lock info panel
- **Planet surface** — Flat terrain (1800×1800) with per-planet ground texture, 40×40 build grid, humanoid player with walking animation, isometric & third-person camera (V to toggle), WASD/arrow movement, mouse aim
- **Fixed timestep** game loop (60 Hz physics, decoupled from render)
- **Resources** — Tree/stone/metal/crystal clusters with seeded placement, tiered tool gating, mining cooldown, particles, respawn timers
- **Building system** — Wall, Turret, Solar Panel, Storage, Workshop, Gate, Beacon, Factory with upgrade tiers (3-4 tiers each), rotate/dismantle/repair
- **Processing stations** — Workshop refines Wood→Plank, Stone→Refined Stone, Scrap→Recycled; Lab refines Metal→Refined Metal, Vibranium→Refined Vibranium, Electronics→Circuit
- **Crafting** — Weapons (Stone Axe, Iron Sword, Vibranium Blade) and consumables (Medkit, Energy Drink, Stamina Boost, Ammo)
- **Hostile wildlife** — Per-planet creatures with chase AI, contact damage, item drops, 30s despawn
- **Combat** — Click-to-attack nearest creature, weapon damage, death/respawn with inventory loss
- **Turret auto-targeting** — Turrets auto-fire at nearby creatures, consume ammo (crafted from Scrap), reload via block popup
- **Inventory** — Modal dialog (E key) with item grid + tool crafting/equipping, hotbar with quantity labels, tool durability bars, tool indicator badge
- **XP & leveling** — XP from mining/building/crafting/processing/combat, level cap 30, 3 skill points per level
- **Skill trees** — Combat (7 perks) and Economy (7 perks) unlocked via T key
- **Market Terminal** — Buy/sell resources with planet-specific prices, coin economy
- **Player stats** — Health/Energy/Stamina bars with regen, energy drain on mining, stamina drain on movement
- **Procedural ambient music** — Per-planet generative music (Web Audio API)
- **Sound effects** — Per-material mining sounds, build/upgrade/dismantle/repair/process/error chimes
- **Persistence** — Buildings, inventory, tools, stats saved per planet to localStorage

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| Mouse | Aim / click to interact |
| E | Inventory |
| C | Crafting |
| T | Skill trees |
| 1–3 | Equip tools |
| V | Toggle camera mode |
| Scroll | Zoom |
| Right-click | Close popup |
| ESC | Close menu → Back to space |

## Build for production

```bash
npm run build
```

Output in `dist/`.

## Project structure

```
index.html              ← Vite entry point
solar-system.html       ← Solar system view (standalone)
surface.html            ← Legacy monolithic file (kept for reference)
src/
  main.js               ← Scene init, context, game loop, input
  style.css             ← All CSS
  player.js             ← Player mesh, movement, stats
  terrain.js            ← Terrain, lights, grid, resource nodes
  buildings.js          ← Building types, foundations, mesh, popup, actions
  utils/
    noise.js            ← Seeded noise helpers
    camera.js           ← Camera modes, follow, zoom
  ui/
    hud.js              ← HUD: planet name, coords, back button
    hotbar.js           ← Hotbar: items, tools, durability
    inventory.js        ← Inventory dialog, tool crafting
    controls.js         ← Help toggle
```

## Tech

- Three.js r128 (CDN, no npm)
- Vite 5 (vanilla JS, no framework)
- Web Audio API for sound/music
- localStorage for persistence
