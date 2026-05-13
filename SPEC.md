# Safayi — Project Spec

## Concept

Two-file 3D solar system with walkable planet surfaces and a full survival sandbox. Navigate the heliocentric view, land on any planet, gather resources, build a colony, craft tools, fight wildlife, and race to build the ultimate goal: the **Spaceship**.

## Files

| File | Purpose |
|------|---------|
| `solar-system.html` | Heliocentric solar system view — orbit, click-to-lock, info panel, procedural textures, Sun shader |
| `surface.html` | Planet surface — terrain, player, inventory, buildings, combat, crafting, processing, all game systems |
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

---

## Planet Surface (`surface.html`) — Full Game

### 1. World & Terrain

#### 1.1 Terrain
- Flat PlaneGeometry(600×600) with procedural canvas texture per planet
- Value noise FBM for color variation (6 octaves, seeded by planet name)
- Grid overlay for building placement (15-unit cells)

#### 1.2 Biomes Per Planet
Each planet has distinct terrain coloration and resource availability:

| Planet | Palette | Atmosphere |
|--------|---------|------------|
| Mercury | Grey/silver | Dusty brown |
| Venus | Gold/amber | Thick yellow |
| Earth | Green/brown | Blue sky |
| Mars | Red/orange | Dusty orange |
| Jupiter | Tan/gold | Banded amber |
| Saturn | Cream/gold | Pale gold |
| Uranus | Teal/cyan | Pale blue |
| Neptune | Deep blue | Deep indigo |

#### 1.3 Resource Nodes (Clustered)
- **Trees** — drop Wood, found in forest clusters
- **Rocks** — drop Stone + Scrap, found in rocky outcrops
- **Crystals** (rare) — drop Vibranium + Electronics, found in sparse deposits
- Nodes are placed in seeded clusters for natural-looking distribution
- Each node has HP; depletes on repeated mining, respawns after a timer
- Left-click to mine (cooldown 300ms between strikes)
- Particle burst on each hit; flash effect on depletion

---

### 2. Player Systems

#### 2.1 Player Bars
Three resources displayed in HUD:

| Bar | Function | Regen |
|-----|----------|-------|
| **Health** | Taking damage from combat, falls, hazards | Regens slowly, or via medkits |
| **Energy** | Spent on: mining, processing at stations, sprinting | Regen over time; food/drink restore |
| **Stamina** | Spent on: dodge roll, sprint | Fast regen when idle |

- All bars displayed as compact color-coded bars top-left of screen

#### 2.2 Death
- On death (Health = 0): respawn at initial drop point
- Drop entire inventory at death location (visible loot crate)
- Keep: base, buildings, skill levels, coins
- Can run back to retrieve dropped items (they persist for 5 minutes)

#### 2.3 Movement
- Arrow keys / WASD
- Sprint while holding Shift (consumes Stamina)
- Dodge roll with Space (consumes Stamina, brief invincibility frames)

#### 2.4 XP & Leveling
- Earn XP from: mining, building, crafting, combat, processing
- Level curve: logarithmic (early levels fast, later levels slow)
- Each level grants 3 skill points
- Skill points spent in two trees (Combat / Economy)
- Respec once per week via special item

---

### 3. Resource System

#### 3.1 Raw Materials

| Material | Source | Used For |
|----------|--------|----------|
| Wood | Trees | Building (tier 1 walls/gates), crafting tools |
| Stone | Rocks | Building (tier 2 walls/gates), crafting |
| Metal | Rocks (rare drop), deep mining | Building (tier 3), turrets, vehicles |
| Vibranium | Crystals (rare) | Building (tier 4), ultimate items |
| Electronics | Crystals | Turrets, processing, vehicles |
| Scrap | Rocks, dismantling | Ammo, repairs, recycling |

#### 3.2 Processing Stations
Workshop/Lab buildings become functional processing stations:

| Input | Station | Output | Energy Cost |
|-------|---------|--------|-------------|
| 3 Wood | Workshop | 1 Plank | 10 |
| 3 Stone | Workshop | 1 Refined Stone | 10 |
| 3 Metal | Lab | 1 Refined Metal | 15 |
| 3 Vibranium | Lab | 1 Refined Vibranium | 20 |
| 3 Scrap | Workshop | 1 Recycled Material | 5 |
| 2 Electronics | Lab | 1 Circuit | 15 |

- Player must walk up to a processing building and interact (click the building → "Process" action)
- Requires Energy from player's bar
- Output used for higher-tier upgrades and crafting

#### 3.3 Currency
- Coins earned from selling resources at the Market Terminal
- Coins partially protected on death (Economy perk)
- Market: a UI panel showing buy/sell prices for each material
- Prices are fixed per planet (not dynamic, no server)

#### 3.4 The Ultimate Goal: Spaceship
The Spaceship is the "netherite moment" — requires mastery of every system:
- Max-tier (4) of every building type on a single planet
- 50 Refined Vibranium
- 30 Circuits
- 20 Refined Metal
- Player Level 20+
- Once built, enables interplanetary travel WITH inventory (instead of starting fresh each planet)

---

### 4. Building System

#### 4.1 Building Types

| Type | Description | Tiers |
|------|-------------|-------|
| Wall | Perimeter barrier | Wood → Stone → Metal → Vibranium |
| Turret | Auto-targeting defense | Turret → Cannon → Artillery → Railgun |
| Solar Panel | Passive Energy regeneration | Panel → Array → Farm |
| Storage | Expanded inventory capacity | Storage → Warehouse → Depot |
| Workshop | Material processing | Workshop → Lab → Research Center |
| Gate | Fortified entryway | Wood → Stone → Metal → Vibranium |
| Beacon | Navigation signal, reveals map | Beacon → Lighthouse → Signal Tower |

#### 4.2 Upgrade Tiers

| Type | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| Wall | Wood Wall | Stone Wall | Metal Wall | Vibranium Wall |
| Turret | Turret | Cannon | Artillery | Railgun |
| Solar Panel | Solar Panel | Solar Array | Solar Farm | — |
| Storage | Storage | Warehouse | Depot | — |
| Workshop | Workshop | Lab | Research Center | — |
| Gate | Wood Gate | Stone Gate | Metal Gate | Vibranium Gate |
| Beacon | Beacon | Lighthouse | Signal Tower | — |

- Upgrading changes color/name/HP only (no scale change)
- Higher-tier upgrades require **processed materials** (not raw)

#### 4.3 Planet Build Availability

| Planet | Available Buildings |
|--------|-------------------|
| Mercury | wall, turret, storage, workshop, gate |
| Venus | wall, turret, solar, storage, workshop, gate, beacon |
| Earth | wall, turret, solar, storage, workshop, gate, beacon |
| Mars | wall, turret, storage, workshop, gate |
| Jupiter | wall, turret, storage, gate |
| Saturn | wall, turret, solar, storage, gate, beacon |
| Uranus | wall, storage, workshop, gate |
| Neptune | wall, storage, workshop, gate |

#### 4.4 Building Actions (click existing building)
- **Upgrade** — next tier (costs resources, requires Energy)
- **Downgrade** — previous tier (refunds 50% of cost)
- **Rotate** — 90° increments
- **Dismantle** — removes building, refunds 50% of cost, leaves foundation
- **Repair** — restores HP using primary material (1 per 20 HP)
- **Process** — (Workshop/Lab only) opens processing UI to refine materials

#### 4.5 Turret Combat
- Turrets auto-target hostile wildlife within range
- Require ammo (crafted from Scrap: 5 scrap → 20 ammo)
- Display ammo count in the action panel
- Empty turrets do nothing — must be manually reloaded
- Higher-tier turrets have more range, damage, and HP

#### 4.6 Solar Panels
- Solar Panels passively regenerate the player's Energy over time when near them
- Higher tiers regenerate faster and over a larger radius
- Effect: standing within radius slowly refills Energy bar

#### 4.7 Storage Buildings
- Each storage building adds extra item slots to the player's inventory
- Tier 1: +5 slots, Tier 2: +10 slots, Tier 3: +15 slots
- Must be near the storage to access the extra slots

---

### 5. Crafting & Items

#### 5.1 Crafting System
- Press C to open Crafting menu (overlay, same style as Inventory)
- Recipes visible from start — no discovery required
- Craft anywhere from inventory instantly
- Gated by: material availability, player skill level
- All crafted items have **durability** (shown as small bar on item icon)

#### 5.2 Weapons

| Weapon | Damage | Durability | Materials |
|--------|--------|------------|-----------|
| Fists | 5 | ∞ (always) | — |
| Stone Axe | 12 | 100 | 3 Wood, 2 Stone |
| Iron Sword | 20 | 200 | 3 Planks, 3 Metal |
| Vibranium Blade | 35 | 400 | 2 Refined Vibranium, 1 Circuit |

- Equip weapon via inventory (click to equip, shows in hotbar slot with durability)
- Left-click to attack (swing animation, damage to nearest target in range)
- Weapon breaks when durability reaches 0

#### 5.3 Tools

| Tool | Effect | Durability | Materials |
|------|--------|------------|-----------|
| Basic Pickaxe | +50% mining speed | 150 | 3 Wood, 2 Stone |
| Iron Pickaxe | +100% mining speed | 300 | 3 Planks, 3 Metal |
| Vibranium Drill | +200% mining speed, AoE | 500 | 2 Refined Vibranium, 2 Circuits |

- Equipping a mining tool increases gather rate on resource nodes

#### 5.4 Consumables

| Item | Effect | Materials |
|------|--------|-----------|
| Medkit | Restore 40 Health | 2 Planks, 1 Electronics |
| Energy Drink | Restore 50 Energy | 2 Wood, 1 Scrap |
| Stamina Boost | Restore 30 Stamina | 1 Plank, 1 Electronics |
| Ammo (×20) | Feed turrets | 5 Scrap |

#### 5.5 Item Durability
- Every tool and weapon has max durability
- Durability decreases with each use (mining swing = 1, attack = 1)
- Durability shown as a small colored bar on the item icon in inventory
- When durability reaches 0, item is destroyed
- Items can be repaired at a Workshop for materials

---

### 6. Combat System

#### 6.1 Hostile Wildlife
Each planet has ambient creatures that attack the player:

| Planet | Creature | Behavior |
|--------|----------|----------|
| Earth | Wolf | Aggressive, packs |
| Mars | Sandworm | Burrows, ambushes |
| Venus | Acid Spitter | Ranged attack |
| Mercury | Rock Golem | Slow, tanky |
| Jupiter | Storm Beast | Lightning AoE |
| Saturn | Ice Wraith | Fast, hit-and-run |
| Uranus | Gas Jelly | Poison cloud |
| Neptune | Abyssal Hunter | Invisible until close |

- Creatures spawn at random positions around the map
- Have HP, deal damage on contact
- Drop resources on death (Scrap, potential rare materials)
- Despawn after death after 30 seconds

#### 6.2 Combat Mechanics
- Click to attack: swings equipped weapon toward mouse cursor
- Damage based on weapon type
- Dodge roll (Space + direction): brief invincibility, costs Stamina
- Enemies have attack cooldowns and telegraphing

#### 6.3 Weapon Progression
Fists → Stone Axe → Iron Sword → Vibranium Blade
Each tier: more damage, more durability, cooler model

---

### 7. Vehicles

#### 7.1 Ground Vehicles

| Vehicle | Speed | Fuel Cap | HP | Materials |
|---------|-------|----------|----|-----------|
| Rover | 2× player | 100 | 150 | 5 Metal, 3 Electronics, 10 Planks |
| Truck | 1.5× player | 200 | 300 | 10 Refined Metal, 5 Circuits |

- Vehicles have their own HP and Fuel
- Press V (or a dedicated key) to enter/exit nearby vehicle
- WASD drives the vehicle (consumes Fuel while moving)
- Fuel crafted from: 3 Scrap + 1 Electronics → 20 Fuel
- Destroyed vehicles drop loot at crash site
- Can be repaired with materials (click vehicle → Repair)

---

### 8. Skill Trees

#### 8.1 Leveling
- Earn XP from all activities: mining, building, crafting, combat, processing
- Each level: 3 skill points
- Max level: 30

#### 8.2 Combat Tree

| Perk | Cost | Effect |
|------|------|--------|
| Toughness | 3 | +20 max Health |
| Iron Will | 5 | -15% damage taken |
| Berserker | 7 | +25% damage below 30% Health |
| Dodger | 3 | Dodge costs 25% less Stamina |
| Reflexes | 5 | -20% enemy attack windup |
| Weapon Master | 7 | +15% weapon damage |
| Ace | 10 | +30% vehicle handling & speed |

#### 8.3 Economy Tree

| Perk | Cost | Effect |
|------|------|--------|
| Gatherer | 3 | +25% mining yield |
| Prospector | 5 | Chance to double rare drops |
| Machinist | 3 | Processing costs 20% less Energy |
| Industrialist | 5 | +1 output per processing batch |
| Architect | 3 | Building costs 10% less |
| Iron Reserve | 7 | Keep 50% of coins on death |
| Tycoon | 10 | Sell prices +25% |

#### 8.4 Respec
- Craft a "Memory Shard" (10 Refined Vibranium, 5 Circuits) to reset all skill points
- Can be used once per week

---

### 9. UI & Visual Systems

#### 9.1 HUD Layout
```
┌──────────────────────────────────────┐
│  [Planet Name]          [Camera Mode]│
│  Health ████████░░ 80/100            │
│  Energy ██████░░░░ 60/100            │
│  Stamina██████████ 100/100  [Lv 5]  │
├──────────────────────────────────────┤
│                                      │
│           (3D Game World)            │
│                                      │
├──────────────────────────────────────┤
│   [Controls Hint]    [X: 0  Z: 0]   │
│                      [Cell: 0, 0]   │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐    │
│  │W │ │S │ │M │ │V │ │E │ │S │    │
│  │ 5│ │ 3│ │ 2│ │10│ │ 8│ │ 4│    │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘    │
│  (Hotbar — shows item quantities)    │
└──────────────────────────────────────┘
```

#### 9.2 Crafting Menu (C)
- Overlay panel showing all recipes grouped by category
- Each recipe shows: required materials, output, required skill level
- Click to craft (if you have materials, Energy, and sufficient level)
- Crafting animation: brief flash + sound

#### 9.3 Skill Tree UI (T)
- Two-tab panel: Combat / Economy
- Each perk shown as a card with cost and effect
- Owned perks highlighted; locked perks greyed out
- "Respec" button (greyed out unless Memory Shard in inventory)

#### 9.4 Market Terminal
- Click a Market building to open buy/sell UI
- Shows current prices for each material
- Sell: click item to sell at listed price
- Buy: click item to buy (costs coins)
- Prices fixed per planet (different planets = different prices)

#### 9.5 Toast Notifications
- Slide-in from right for: actions, combat, crafting, warnings
- Auto-dismiss after 2 seconds
- Color-coded: green (success), yellow (warning), red (danger)

#### 9.6 Floating HP Bars
- 3D HP bars float above buildings
- Color-coded: green > 60%, yellow > 30%, red < 30%
- Smooth lerp animation on change
- Also shown on enemies and vehicles

---

### 10. Save / Load

#### 10.1 Persistence Per Planet
- Buildings: `localStorage` key `safayi_{PlanetName}`
- Inventory: `localStorage` key `safayi_inv_{PlanetName}`
- Player stats (level, skill points, XP): `localStorage` key `safayi_stats_{PlanetName}`
- Coins: `localStorage` key `safayi_coins_{PlanetName}`
- Crafted vehicles: `localStorage` key `safayi_veh_{PlanetName}`

#### 10.2 Auto-save Triggers
- On: place/upgrade/dismantle/repair building
- On: inventory change (mine, craft, process, buy, sell)
- On: level up, spend skill points
- On: enter/exit vehicle

#### 10.3 Cross-planet Progress
- Without Spaceship: each planet is a separate save (start fresh on land)
- With Spaceship (ultimate goal): travel between planets carrying inventory and vehicle

---

### 11. Audio

#### 11.1 Sound Effects (Web Audio API)
- Procedural tones generated at runtime (no audio files needed for surface)
- **Mining**: distinct sounds per material (tree = low thud, rock = metallic clink)
- **Building**: short construction tone
- **Upgrade**: ascending chime
- **Dismantle**: descending crunch
- **Repair**: quick click
- **Crafting**: item-complete ping
- **Combat**: hit sounds, dodge whoosh
- **Error**: low buzz

#### 11.2 Ambient Music (Procedural)
- Per-planet generative ambient music
- Base note derived from planet seed (each planet sounds different)
- Three layers: warm pad (detuned sines), fifth drone, random gentle chimes
- Slow LFO tremolo for movement
- Starts on first user interaction (browser autoplay policy)

#### 11.3 Solar System Music
- `assets/space_music.mp3` looping background track
- Toggle button (♫) to mute/unmute

---

### 12. Controls Reference

| Key | Action |
|-----|--------|
| WASD / Arrows | Move / Drive |
| Shift (hold) | Sprint |
| Space | Dodge roll |
| Mouse click | Attack / Mine / Interact |
| Right-click | Close popup |
| E | Inventory |
| C | Crafting |
| T | Skill Tree |
| 1–6 | Hotbar slot flash |
| V | Toggle camera mode / Enter vehicle |
| ESC | Close menu → Close popup → Back to space |
| Scroll | Zoom |

---

### 13. Tech Stack
- Three.js r128 (CDN via jsDelivr, no bundler)
- Web Audio API for procedural sound and music
- No npm, no tests, no CI
- Plain HTML + CSS + JS in two files
- localStorage for persistence

---

### 14. Implementation Phases

#### Phase 1 (Current — Done)
- Solar system view with planet navigation
- Flat terrain with grid
- Player movement, camera modes
- Building system (place, upgrade, rotate, dismantle, repair)
- Item economy (Wood, Stone, Metal, Vibranium, Electronics, Scrap)
- Hotbar + Inventory UI
- Save/load per planet
- Procedural ambient music
- Clustered resource nodes (trees, rocks)
- Resource mining with cooldown, particles, respawn

#### Phase 2 (Next)
- Player bars (Health, Energy, Stamina)
- Processing stations (Workshop/Lab functional)
- Crafting system (C menu)
- Weapon/tool crafting + equipping
- Durability system
- Hostile wildlife + combat
- Turret auto-targeting + ammo

#### Phase 3 (Later)
- Skill trees (Combat + Economy)
- XP and leveling
- Vehicles (Rover, Truck)
- Market Terminal + Coins
- Storage building expands inventory
- Solar panels regen Energy

#### Phase 4 (Ultimate)
- Spaceship crafting (ultimate goal)
- Cross-planet inventory travel
- Death mechanics (drop loot)
- Dodge roll
- Planet-specific creature behaviors
- Memory Shard respec system
