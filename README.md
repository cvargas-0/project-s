# Proejct S (Temporal Name)

A 2D roguelike survivor game built with **PixiJS v8** and **TypeScript**. Inspired by Vampire Survivors.

## Quick Start

```bash
pnpm install
pnpm dev
```

## Controls

| Key        | Action                    |
| ---------- | ------------------------- |
| W A S D    | Move player               |
| Arrow Keys | Move player (alternative) |
| Space      | Pause / Resume            |
| R          | Reset game                |
| 1 / 2 / 3  | Pick upgrade on level up  |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                   app.stage                          │
│                                                      │
│  ┌──────────────────────────────┐  ┌───────────────┐ │
│  │      worldContainer          │  │   UI Layer    │ │
│  │  (camera + shake applied)    │  │  (static)     │ │
│  │                              │  │               │ │
│  │  Player                      │  │  Hud          │ │
│  │  Enemies (via EnemyPool)     │  │  LevelUpScreen│ │
│  │  Projectiles (via ProjPool)  │  │  StateOverlay │ │
│  │  XP Orbs                     │  │               │ │
│  │  Particles                   │  │               │ │
│  └──────────────────────────────┘  └───────────────┘ │
└──────────────────────────────────────────────────────┘
```

The game separates the **world container** (game entities affected by camera + shake) from the **UI layer** (HUD, overlays — always static). Both are children of `app.stage`. The world is 3000×3000 pixels; the camera follows the player with lerp smoothing and clamps to world bounds.

---

## Game Loop

```
PixiJS Ticker (requestAnimationFrame)
  │
  ├─ handleGlobalInput()          ← always runs
  ├─ screenShake.update(deltaMs)  ← always runs (finishes naturally)
  ├─ camera.update(player)        ← always runs (smooth follow)
  ├─ camera.applyTo(world, shake) ← always runs (position world)
  │
  │  [if state !== RUNNING, skip below]
  │
  ├─ events.update(deltaMs)       ← dynamic event timers + multipliers
  ├─ difficulty.update(deltaMs)
  ├─ player.update(delta)
  ├─ enemySystem.update(deltaMs)  ← includes wave system
  ├─ combatSystem.update(delta, deltaMs)
  ├─ particles.update(deltaMs)
  ├─ xpSystem.update(delta, player)
  ├─ hud.update(player, xpSystem, elapsed, screenW, screenH)
  │
  └─ if !player.isAlive() → GAME_OVER (show RunStats)
```

**Delta time**: frame-based `delta` (~1.0 at 60fps) for movement, millisecond `deltaMs` for timers.

---

## State Machine

```
              ┌──────────┐
    ┌────────►│ RUNNING  │◄──────────┐
    │         └────┬─┬───┘           │
    │  Space       │ │          Space│
    ▼              │ │               │
┌────────┐         │ │         ┌─────┘
│ PAUSED │         │ │  level  │
└────────┘         │ │   up    │
    │              │ ▼         │
  R │       ┌─────────────┐    │
    │       │  LEVEL_UP   │────┘
    │       └─────────────┘
    │         pick upgrade
    │
    │         │ player dies
    │         ▼
    └───►┌───────────┐
      R  │ GAME_OVER │
         └───────────┘
```

---

## Project Structure

```
src/
├── main.ts                     # Entry point — creates and starts Game
├── style.css                   # Fullscreen layout (no margins, overflow hidden)
├── core/
│   ├── game.ts                 # Orchestrator: setup, loop, state, reset
│   ├── loop.ts                 # Ticker wrapper (createLoop)
│   ├── state.ts                # State enum (RUNNING, PAUSED, LEVEL_UP, GAME_OVER)
│   ├── input.ts                # Keyboard tracking (isDown, wasPressed)
│   ├── playerStats.ts          # Shared mutable stats interface + factory
│   ├── runStats.ts             # Per-run statistics (kills, damage, XP, upgrades)
│   ├── camera.ts               # Lerp-follow camera with world bounds clamping
│   └── screenShake.ts          # Offset-based shake (composable with camera)
├── entities/
│   ├── player.ts               # Player: movement, HP, armor, regen, world clamping
│   ├── enemy.ts                # Enemy: chase AI, hit flash, boss variant, poolable
│   ├── projectile.ts           # Projectile: directional, lifetime, collision, poolable
│   └── xpOrb.ts                # XP orb: magnetic attraction, collection
├── system/
│   ├── combat.ts               # Auto-attack, projectile lifecycle, spatial collision
│   ├── enemy.ts                # Spawn logic, wave system, camera-relative spawning
│   ├── xp.ts                   # Orb management, XP/level tracking
│   ├── difficulty.ts           # Time-based scaling + event multiplier integration
│   ├── events.ts               # Dynamic events (Swarm, Berserker, Frost, Blood Moon)
│   ├── waves.ts                # Special waves (Encirclement, Rush, Elite Squad)
│   ├── particles.ts            # Radial burst particles with friction + fade
│   └── spatialGrid.ts          # Uniform grid spatial hash for O(1) neighbour lookup
├── pool/
│   ├── projectilePool.ts       # Reuse Projectile instances (acquire/release)
│   └── enemyPool.ts            # Reuse Enemy instances (acquire/release)
├── data/
│   └── upgrades.ts             # 20 upgrades with rarity system + weighted selection
└── ui/
    ├── hud.ts                  # HP bar, XP bar, timer, event/wave banners
    ├── levelUpScreen.ts        # 3 upgrade cards with keyboard/click selection
    └── overlay.ts              # PAUSED and GAME OVER (with full run stats)
```

---

## System Integration

### How systems connect

```
Game (orchestrator)
 │
 ├── PlayerStats ──────────► shared by Player + CombatSystem + Upgrades
 ├── RunStats ─────────────► accumulated via callbacks, shown on Game Over
 │
 ├── EventSystem ──────────► multipliers read by Difficulty + Combat + XP
 ├── DifficultySystem ─────► feeds EnemySystem (spawn rate, HP, speed, XP)
 │
 ├── Camera ───────────────► follows player, clamps to world, applies to world container
 ├── ScreenShake ──────────► offset-based, composed with camera in applyTo()
 │
 ├── EnemySystem
 │    ├── uses EnemyPool (acquire/release instead of new/destroy)
 │    ├── integrates WaveSystem (special spawn patterns)
 │    ├── spawns at camera-relative viewport edges
 │    ├── onEnemyDied → XpSystem.spawnOrb (multi-orb) + ParticleSystem.burst
 │    ├── onPlayerHit → ScreenShake.trigger + RunStats.totalDamageTaken
 │    └── onWaveStart → Hud.showBanner
 │
 ├── CombatSystem
 │    ├── uses ProjectilePool (acquire/release)
 │    ├── uses SpatialGrid (rebuild per frame, query per projectile)
 │    ├── reads PlayerStats for damage, speed, count, interval
 │    ├── applies EventSystem.damageMultiplier at fire time
 │    └── onDamageDealt → RunStats.totalDamageDealt
 │
 ├── XpSystem
 │    ├── on level up → Game triggers LEVEL_UP state + LevelUpScreen
 │    └── onXpGained → RunStats.totalXpCollected
 │
 └── LevelUpScreen
      └── on pick → Upgrade.apply(stats, heal) + RunStats.upgradesChosen → resume RUNNING
```

### Object Pooling

Both `ProjectilePool` and `EnemyPool` follow the same pattern:

- **acquire()** — pop from free list or create new, call `reset()`, add sprite to container
- **release()** — remove sprite from container, push to free list
- **destroyAll()** — call `sprite.destroy()` on all free instances (used on game reset)

Entities have a `reset()` method that reinitialises all state without allocating a new `Graphics` object.

### Spatial Partitioning

`SpatialGrid` uses a uniform grid with 64px cells:

1. **Each frame**: clear grid → insert all alive enemies
2. **Per projectile**: query the 3x3 cell neighbourhood around the projectile
3. **Result**: collision checks drop from O(P×E) to O(P×k) where k = avg enemies per neighbourhood

Cell keys are packed as `cx * 10000 + cy`, safe for maps up to ~640,000px.

### Dynamic Camera

`Camera` follows the player with lerp smoothing (`0.08`) and clamps to world bounds (3000×3000):

1. **Each frame**: lerp `(x, y)` toward player center, clamp to `[0, worldSize - viewport]`
2. **applyTo(world, shakeX, shakeY)**: sets `world.position = (-camX + shakeX, -camY + shakeY)`
3. **ScreenShake** is offset-based — produces `offsetX`/`offsetY` composed with the camera transform

The player starts at world center `(1500, 1500)` and is clamped to world bounds. Enemies spawn at viewport edges + margin relative to the camera position.

### Dynamic Events

`EventSystem` triggers temporary gameplay modifiers every 60–90 seconds:

| Event      | Effect              | Duration |
| ---------- | ------------------- | -------- |
| Swarm!     | Spawn rate ×2       | 15s      |
| Berserker! | Damage ×2           | 10s      |
| Frost      | Enemy speed ×0.5    | 12s      |
| Blood Moon | Enemy HP ×2 + XP ×2 | 20s      |

Multiplier fields are read by `DifficultySystem` and `CombatSystem`. Events display a colored banner with fade animation via `Hud.showBanner()`.

### Special Waves

`WaveSystem` triggers coordinated spawn patterns (first at ~2 min, then every 90–120s):

| Wave         | Pattern                                  |
| ------------ | ---------------------------------------- |
| Encirclement | 8–12 enemies in a ring around the player |
| Rush         | 10–15 enemies from one random side       |
| Elite Squad  | 3–5 enemies with 3× HP and 0.8× speed    |

While a wave is active (`isSuppressing = true`), normal trickle spawning is paused. Waves use `EnemySystem.spawnEnemyAt()` to place enemies at specific coordinates.

### Run Statistics

`RunStats` tracks per-run data via callbacks wired in `game.ts`:

- `enemiesKilled` / `bossesKilled` — incremented in `onEnemyDied`
- `totalDamageDealt` — from `CombatSystem.onDamageDealt`
- `totalDamageTaken` — from `EnemySystem.onPlayerHit`
- `totalXpCollected` — from `XpSystem.onXpGained`
- `upgradesChosen` — pushed in `triggerLevelUp`

All stats are displayed on the Game Over overlay. Stats reset with the rest of the game on `R`.

### Upgrade Rarity System

Upgrades have 4 rarity tiers, each with a weighted probability:

| Rarity    | Color  | Weight | Example upgrades                  |
| --------- | ------ | ------ | --------------------------------- |
| Common    | Grey   | 50     | Swift Feet, Sharp Edge, Magnetism |
| Rare      | Blue   | 30     | Multishot, Thick Skin, Adrenaline |
| Epic      | Purple | 15     | Glass Cannon, Barrage, Fortress   |
| Legendary | Gold   | 5      | Magnetize (collect all orbs)      |

Trade-off upgrades give a powerful boost but reduce another stat (e.g. Glass Cannon: +4 damage, -4 max HP). The level-up screen shows rarity-colored borders and labels on each card.

XP orbs always move faster than the player (`(speed + 2) × 1.5`) and their attract range is upgradeable via the `attractRange` stat.

### Reset Flow

On game reset (R key), cleanup happens in order:

1. `events.reset()` — reset event timers and multipliers
2. `combatSystem.reset()` — destroy active projectiles, clear pool
3. `enemySystem.reset()` — release active enemies, clear pool + waves
4. `particles.reset()` — destroy active particle sprites
5. `xpSystem.reset()` — destroy orb sprites, reset level/XP
6. `hud.destroy()` — destroy UI graphics
7. `stage.removeChildren()` — remove empty containers
8. `setup()` — create fresh world, player, systems, UI

### Difficulty Progression

All values scale with a combined **tier** that factors in both elapsed time and player level:

```
tier = elapsedSeconds / 20 + (playerLevel - 1) × 0.5
```

| Stat           | Formula                                               |
| -------------- | ----------------------------------------------------- |
| Spawn interval | `max(150, 1000 - tier × 60)` ms ÷ spawnRateMultiplier |
| Enemy HP       | `(3 + floor(tier × 0.8))` × enemyHpMultiplier         |
| Enemy speed    | `min(4.0, 1.5 + tier × 0.12)` × enemySpeedMultiplier  |
| Enemy XP       | `floor(20 × (1 + tier × 0.15))` × xpMultiplier        |
| Enemy orbs     | `1 + floor(tier / 4)`                                 |
| Boss HP        | `(25 + bossCount × 10) × (1 + tier × 0.1)`            |
| Boss XP        | `enemyXp × 8`                                         |
| Boss orbs      | `enemyOrbCount × 3`                                   |
| Boss spawns    | At 2:00, then every 90s (3:30, 5:00, 6:30...)         |

XP required per level: `level × 100`
