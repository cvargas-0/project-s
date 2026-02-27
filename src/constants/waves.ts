export const WAVE_TIMING = {
  FIRST_DELAY_BASE: 120_000,     // ms before first wave
  FIRST_DELAY_VARIANCE: 30_000,  // ms ± random
  COOLDOWN_BASE: 90_000,         // ms between waves
  COOLDOWN_VARIANCE: 30_000,     // ms ± random
  BANNER_DURATION: 3000,         // ms to show wave banner
} as const;

export const WAVE_ENCIRCLEMENT = {
  NAME: 'Encirclement!',
  ENEMY_COUNT_BASE: 8,
  ENEMY_COUNT_RANGE: 4,         // +random(0..N)
  SPAWN_RADIUS: 280,
  SPAWN_RADIUS_VARIANCE: 40,
  SUPPRESS_DURATION: 4000,      // ms normal spawns are paused
} as const;

export const WAVE_RUSH = {
  NAME: 'Rush!',
  ENEMY_COUNT_BASE: 10,
  ENEMY_COUNT_RANGE: 5,
  SPAWN_DISTANCE: 350,          // px from player
  ENEMY_SPACING: 40,            // px between enemies in line
  SPEED_MULTIPLIER: 1.3,
  SUPPRESS_DURATION: 3000,
} as const;

export const WAVE_ELITE = {
  NAME: 'Elite Squad!',
  ENEMY_COUNT_BASE: 3,
  ENEMY_COUNT_RANGE: 2,
  SPAWN_RADIUS: 250,
  SPAWN_RADIUS_VARIANCE: 100,
  HP_MULTIPLIER: 3,
  SPEED_MULTIPLIER: 0.8,
  XP_MULTIPLIER: 2,
  SUPPRESS_DURATION: 5000,
} as const;
