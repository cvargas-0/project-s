# Project-S

A 2D survival game built with PixiJS and TypeScript.

## Game Loop

```
┌─────────────────────────────────────────────────────────────┐
│                     PixiJS Ticker                           │
│                  (requestAnimationFrame)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │ each frame
                      ▼
              ┌───────────────┐
              │  delta/deltaMS│
              └───────┬───────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │     handleGlobalInput()     │
        │  ┌───────────┬───────────┐  │
        │  │ Space:    │ R:        │  │
        │  │ pause/    │ reset     │  │
        │  │ resume    │ game      │  │
        │  └───────────┴───────────┘  │
        └──────────────┬──────────────┘
                       │
                       ▼
              ┌────────────────┐     ┌────────────┐
              │ state !=       │────▶│ skip frame │
              │ RUNNING?       │ yes └────────────┘
              └───────┬────────┘
                      │ no
                      ▼
  ┌────────────────────────────────────────────────┐
  │               Update Systems                   │
  │                                                │
  │  ┌──────────────────────────────────────────┐  │
  │  │ 1. player.update(delta)                  │  │
  │  │    - WASD movement (normalized)          │  │
  │  │    - Invulnerability timer               │  │
  │  └──────────────────────────────────────────┘  │
  │                                                │
  │  ┌──────────────────────────────────────────┐  │
  │  │ 2. enemySystem.update(deltaMs)           │  │
  │  │    - Spawn timer (every 1000ms)          │  │
  │  │    - Spawn at random screen edge         │  │
  │  │    - Move toward player                  │  │
  │  │    - Check collision → deal damage       │  │
  │  │    - Remove dead enemies                 │  │
  │  └──────────────────────────────────────────┘  │
  │                                                │
  │  ┌──────────────────────────────────────────┐  │
  │  │ 3. combatSystem.update(delta, deltaMs)   │  │
  │  │    - Attack timer (every 600ms)          │  │
  │  │    - Auto-fire at nearest enemy          │  │
  │  │    - Move projectiles                    │  │
  │  │    - Check collision → deal damage       │  │
  │  │    - Remove expired projectiles          │  │
  │  └──────────────────────────────────────────┘  │
  │                                                │
  └────────────────────────────────────────────────┘
                      │
                      ▼
            ┌───────────────────┐     ┌────────────┐
            │ player.isAlive()? │────▶│ GAME_OVER  │
            └───────────────────┘ no  └────────────┘
```

## State Machine

```
                   ┌─────────┐
         ┌─────────│ RUNNING │◀─────────┐
         │         └────┬────┘          │
         │ Space        │          Space│
         ▼              │               │
    ┌─────────┐         │          ┌────┘
    │ PAUSED  │         │ player   │
    └─────────┘         │ dies     │
         │              ▼          │
       R │        ┌───────────┐    │
         └───────▶│ GAME_OVER │────┘
              R   └───────────┘
```

## Project Structure

```
src/
├── main.ts                  # Entry point
├── core/
│   ├── game.ts              # Game orchestrator
│   ├── loop.ts              # PixiJS ticker wrapper
│   ├── state.ts             # State enum (RUNNING, PAUSED, GAME_OVER)
│   └── input.ts             # Keyboard input (isDown, wasPressed)
├── entities/
│   ├── player.ts            # Blue circle, WASD, 10 HP, invulnerability
│   ├── enemy.ts             # Red circle, chases player, 3 HP
│   └── projectile.ts        # Yellow circle, auto-aimed, 2s lifetime
└── system/
    ├── enemy.ts             # Spawning, movement, player collision
    └── combat.ts            # Auto-attack, projectile management
```

## Controls

| Key     | Action         |
| ------- | -------------- |
| W A S D | Move player    |
| Space   | Pause / Resume |
| R       | Reset game     |
