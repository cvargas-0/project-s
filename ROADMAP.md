# Nordic Survivor — Roadmap

Vampire Survivors-inspired game built with PixiJS + TypeScript.

---

# Current State

- Game loop, state machine, input, reset — all stable
- XP / Level Up / Upgrades fully working
- Difficulty scaling + boss spawns
- Object pooling + spatial partitioning
- Visual feedback (hit flash, particles, screen shake)
- Full HUD and UI overlays
- Dynamic events with gameplay multipliers
- Special waves (Encirclement, Rush, Elite Squad)
- Dynamic camera (3000×3000 world, lerp follow, clamped)
- Run statistics on Game Over screen
- Fullscreen responsive layout

---

# PHASE 1 — Core Gameplay ✅

## 1. XP and Level Up System ✅

- [x] Enemies drop XP orbs ("souls")
- [x] XP bar in HUD
- [x] Leveling up pauses the game
- [x] Choose 1 of 3 upgrades

## 2. Power Ups ✅

- [x] +Speed (Swift Feet)
- [x] +Damage (Sharp Edge)
- [x] +Attack speed (Rapid Fire)
- [x] +Projectiles (Multishot)
- [x] +Max HP (Vitality)
- [x] +Projectile speed (Swift Shot)
- [x] +Armor (Iron Hide)
- [x] +Regeneration (Regeneration)
- [x] +Damage & attack speed (Overcharge)
- [x] +Speed & attack speed (Blitz)

## 3. Difficulty Scaling ✅

- [x] Progressive spawn rate (1000ms → 200ms min)
- [x] Enemy HP and speed increase with time
- [x] Boss spawns at 3:00, 5:00, 7:00, 9:00...
- [x] Enemy XP scales procedurally with elapsed time

## 4. Minimal UI ✅

- [x] HP bar (top-left)
- [x] XP bar (bottom)
- [x] Level display
- [x] Timer (top-right, MM:SS)
- [x] PAUSED / GAME OVER overlays

---

# PHASE 2 — Nordic Identity

## 1. Real Art

- [ ] Replace placeholder circles with sprites/spritesheets
- [ ] Animations (idle / walk / attack / death)

## 2. Nordic Rune System

- [ ] Rune of Odin → more damage, less HP
- [ ] Rune of Thor → random lightning
- [ ] Rune of Loki → unpredictable effects
- [ ] Rune of Hel → lifesteal

## 3. Visual Feedback ✅

- [x] Hit flash (white flash 80ms on enemy damage)
- [x] Particle bursts (radial on enemy death, color-coded)
- [x] Screen shake (mild on player hit, strong on boss death)

## 4. Basic Sound

- [ ] Hit SFX
- [ ] Death SFX
- [ ] Level up SFX

---

# PHASE 3 — Technical Scalability ✅

## 1. Object Pooling ✅

- [x] Projectile pool (ProjectilePool — acquire/release/destroyAll)
- [x] Enemy pool (EnemyPool — acquire/release/destroyAll)
- [x] Reset methods clean up active + pooled sprites

## 2. Spatial Partitioning ✅

- [x] Uniform grid (SpatialGrid, cell size 64px)
- [x] 3x3 neighbourhood query for collision
- [x] Reduced from O(P×E) to O(P×k)

## 3. Optional ECS Refactor

- [ ] Only if complexity demands it

## 4. Advanced Difficulty Curve ✅

- [x] Time-based formulas (spawn rate, HP, speed, XP)
- [x] Dynamic events (Swarm, Berserker, Frost, Blood Moon)
- [x] Special waves (Encirclement, Rush, Elite Squad)
- [x] Scaling XP orb drops per difficulty tier

---

# PHASE 4 — Publishable Web Game

## 1. Dynamic Camera ✅

- [x] World larger than screen (3000×3000)
- [x] Lerp-following camera with world bounds clamping
- [x] Spawn relative to player position (camera-relative edges)
- [x] Fullscreen responsive layout (resizeTo: window)

## 2. Run Statistics ✅

- [x] Survival time
- [x] Total damage dealt / taken
- [x] Enemies / bosses defeated
- [x] XP collected
- [x] Upgrades chosen
- [x] Full stats shown on Game Over screen

## 3. Daily Seed

- [ ] Shared seed
- [ ] Deterministic spawning

## 4. Leaderboard

- [ ] LocalStorage (first version)
- [ ] Optional backend later

---

# Strategy

- Stability first
- Then identity
- Then optimization
- Finally social features

Not planned:

- Multiplayer
- Complex crafting
- Premature infinite procedural generation
