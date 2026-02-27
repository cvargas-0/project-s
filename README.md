# Nordic Survivor

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
│                   app.stage                           │
│                                                      │
│  ┌──────────────────────────────┐  ┌──────────────┐  │
│  │      worldContainer          │  │   UI Layer    │  │
│  │  (shakes with ScreenShake)   │  │  (static)     │  │
│  │                              │  │               │  │
│  │  Player                      │  │  Hud          │  │
│  │  Enemies (via EnemyPool)     │  │  LevelUpScreen│  │
│  │  Projectiles (via ProjPool)  │  │  StateOverlay │  │
│  │  XP Orbs                     │  │               │  │
│  │  Particles                   │  │               │  │
│  └──────────────────────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────┘
```

The game separates the **world container** (game entities that shake) from the **UI layer** (HUD, overlays — always static). Both are children of `app.stage`.

---

## Game Loop

```
PixiJS Ticker (requestAnimationFrame)
  │
  ├─ handleGlobalInput()          ← always runs
  ├─ screenShake.update(deltaMs)  ← always runs (finishes naturally)
  │
  │  [if state !== RUNNING, skip below]
  │
  ├─ difficulty.update(deltaMs)
  ├─ player.update(delta)
  ├─ enemySystem.update(deltaMs)
  ├─ combatSystem.update(delta, deltaMs)
  ├─ particles.update(deltaMs)
  ├─ xpSystem.update(delta, player)
  ├─ hud.update(player, xpSystem, elapsed)
  │
  └─ if !player.isAlive() → GAME_OVER
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
├── core/
│   ├── game.ts                 # Orchestrator: setup, loop, state, reset
│   ├── loop.ts                 # Ticker wrapper (createLoop)
│   ├── state.ts                # State enum (RUNNING, PAUSED, LEVEL_UP, GAME_OVER)
│   ├── input.ts                # Keyboard tracking (isDown, wasPressed)
│   ├── playerStats.ts          # Shared mutable stats interface + factory
│   └── screenShake.ts          # Shakes a Container with intensity decay
├── entities/
│   ├── player.ts               # Player: movement, HP, armor, regen, invulnerability
│   ├── enemy.ts                # Enemy: chase AI, hit flash, boss variant, poolable
│   ├── projectile.ts           # Projectile: directional, lifetime, collision, poolable
│   └── xpOrb.ts                # XP orb: magnetic attraction, collection
├── system/
│   ├── combat.ts               # Auto-attack, projectile lifecycle, spatial collision
│   ├── enemy.ts                # Spawn logic, enemy updates, player collision
│   ├── xp.ts                   # Orb management, XP/level tracking
│   ├── difficulty.ts           # Time-based scaling (spawn rate, HP, speed, XP, bosses)
│   ├── particles.ts            # Radial burst particles with friction + fade
│   └── spatialGrid.ts          # Uniform grid spatial hash for O(1) neighbour lookup
├── pool/
│   ├── projectilePool.ts       # Reuse Projectile instances (acquire/release)
│   └── enemyPool.ts            # Reuse Enemy instances (acquire/release)
├── data/
│   └── upgrades.ts             # 10 upgrades with stat modifiers
└── ui/
    ├── hud.ts                  # HP bar, XP bar, level, timer
    ├── levelUpScreen.ts        # 3 upgrade cards with keyboard/click selection
    └── overlay.ts              # PAUSED and GAME OVER screens
```

---

## System Integration

### How systems connect

```
Game (orchestrator)
 │
 ├── PlayerStats ──────────► shared by Player + CombatSystem + Upgrades
 │
 ├── DifficultySystem ─────► feeds EnemySystem (spawn rate, HP, speed, XP)
 │
 ├── EnemySystem
 │    ├── uses EnemyPool (acquire/release instead of new/destroy)
 │    ├── onEnemyDied → XpSystem.spawnOrb + ParticleSystem.burst
 │    └── onPlayerHit → ScreenShake.trigger
 │
 ├── CombatSystem
 │    ├── uses ProjectilePool (acquire/release)
 │    ├── uses SpatialGrid (rebuild per frame, query per projectile)
 │    └── reads PlayerStats for damage, speed, count, interval
 │
 ├── XpSystem
 │    └── on level up → Game triggers LEVEL_UP state + LevelUpScreen
 │
 └── LevelUpScreen
      └── on pick → Upgrade.apply(stats, heal) → resume RUNNING
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

### Reset Flow

On game reset (R key), cleanup happens in order:

1. `combatSystem.reset()` — destroy active projectiles, clear pool
2. `enemySystem.reset()` — release active enemies, clear pool
3. `particles.reset()` — destroy active particle sprites
4. `xpSystem.reset()` — destroy orb sprites, reset level/XP
5. `hud.destroy()` — destroy UI graphics
6. `stage.removeChildren()` — remove empty containers
7. `setup()` — create fresh world, player, systems, UI

### Difficulty Progression

All values scale with elapsed time:

| Stat           | Formula                                |
| -------------- | -------------------------------------- |
| Spawn interval | `max(200, 1000 - floor(t/30) × 80)` ms |
| Enemy HP       | `3 + floor(t/30)`                      |
| Enemy speed    | `1.5 + t/180`                          |
| Enemy XP       | `floor(20 × (1 + t/120))`              |
| Boss HP        | `enemyHp × 8`                          |
| Boss XP        | `enemyXp × 8`                          |
| Boss spawns    | Every 2 minutes starting at 3:00       |

XP required per level: `level × 100`
