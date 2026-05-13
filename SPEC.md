# Safayi — Project Spec

## Concept

Two-file 3D solar system with walkable planet surfaces and a base-building sandbox. Navigate the heliocentric view, land on any planet, build a colony.

## Files

| File | Purpose |
|------|---------|
| `solar-system.html` | Heliocentric solar system view — orbit, click-to-lock, info panel, procedural textures, Sun shader |
| `surface.html` | Planet surface — terrain, player movement, building system, camera modes |
| `assets/space_music.mp3` | Looping background music for the solar system view |

## Solar System View (`solar-system.html`)

### Navigation
- **Drag** — rotate camera around origin
- **Scroll** — zoom in/out
- **Click planet** — lock-on, orbit follows the planet
- **ESC / click empty space** — release lock-on
- **Side panel** — shows planet stats (orbit distance, day length, moons, fun fact)
- **"Enter Planet" button** — navigates to `surface.html?planet=Name`

### Planets
- Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
- Each has procedural texture, scaled orbit, rotation, and atmosphere glow

## Planet Surface (`surface.html`)

### Terrain
- Flat PlaneGeometry(600x600) with procedural canvas texture per planet
- Value noise FBM for color variation (6 octaves, seeded by planet name)
- Grid overlay for building placement (15-unit cells)

### Player
- Low-poly humanoid (BoxGeometry torso/arms/legs, SphereGeometry head)
- Arrow keys / WASD movement
- Walking animation (limb swing + vertical bounce)
- Collision against buildings (AABB per-axis)

### Camera Modes
- **Isometric** (default) — fixed pitch/yaw, screen-relative movement
- **Third-person** — behind player, movement relative to facing direction
- **V** to toggle, scroll to zoom

### Building System

#### Hotbar (bottom center)
- Filtered by planet (each planet has its own available build set)
- Keys 1-{N} to select, click to place, R to rotate before placing
- Ghost preview: green = valid placement, red = blocked

#### Building Types
| Type | Description |
|------|-------------|
| Wall | Perimeter barrier |
| Turret | Auto-targeting defense |
| Solar Panel | Power generation |
| Storage | Resource stockpile |
| Workshop | Crafting station |

#### Upgrade Tiers (per type)
| Type | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| Wall | Wood Wall | Stone Wall | Metal Wall | Vibranium Wall |
| Turret | Turret | Cannon | Artillery | Railgun |
| Solar Panel | Solar Panel | Solar Array | Solar Farm | — |
| Storage | Storage | Warehouse | Depot | — |
| Workshop | Workshop | Lab | Research Center | — |

Upgrading changes the building's color but **not** its physical size — every building stays within its grid cell.

#### Planet Build Availability
| Planet | Available Buildings |
|--------|-------------------|
| Mercury | wall, turret, storage, workshop |
| Venus | wall, turret, solar, storage, workshop |
| Earth | wall, turret, solar, storage, workshop |
| Mars | wall, turret, storage, workshop |
| Jupiter | wall, turret, storage |
| Saturn | wall, turret, solar, storage |
| Uranus | wall, storage, workshop |
| Neptune | wall, storage, workshop |

#### Action Panel (click existing building)
- **Title** — current building name (with tier)
- **HP bar** — color-coded (green > yellow > red)
- **Upgrade** — cycles to next tier (name changes, color changes)
- **Rotate** — 90° increments
- **Dismantle** — removes building, restores foundation
- **Repair** — restores 50 HP

#### Save / Load
- Buildings persist per planet via `localStorage` (key: `safayi_{PlanetName}`)
- Auto-save on: place, upgrade, dismantle, repair
- Auto-load on page load

### UI Theme
- Warm cream/khaki palette (`#f0ebe3` background, `#4a3f32` text)
- Translucent glassmorphism panels with backdrop blur
- Selected buildings get a gold edge highlight (EdgesGeometry + LineSegments)

## Tech Stack
- Three.js r128 (CDN via jsDelivr, no bundler)
- No npm, no tests, no CI
- Plain HTML + CSS + JS in two files

## Future Ideas

### Player
- Stamina / hunger system
- Better third-person model
- First-person camera mode

### Buildings
- Resource production (solar generates power, workshop crafts items)
- Building destruction / combat (turrets auto-target hostiles)
- Connected grids / power distribution
- Multi-tile buildings (e.g., 2×2 structures)

### Environment
- Day/night cycle
- Weather (dust storms on Mars, acid rain on Venus)
- Terrain height (noise-based elevation instead of flat ground)
- Flora / resources to harvest

### Multiplayer
- WebSocket-based co-op
- Shared building state

### Meta
- Mission log / objectives
- Tech tree
- Resource economy across planets
