export const PARTICLES = {
  // ── Size ──
  SIZE_MIN: 2,
  SIZE_RANGE: 3,                 // actual = SIZE_MIN + random * SIZE_RANGE

  // ── Speed ──
  SPEED_MIN: 1.5,
  SPEED_RANGE: 3.5,             // actual = SPEED_MIN + random * SPEED_RANGE

  // ── Lifetime ──
  LIFETIME_MIN: 280,            // ms
  LIFETIME_RANGE: 220,          // actual = LIFETIME_MIN + random * LIFETIME_RANGE

  // ── Physics ──
  FRICTION: 0.92,               // velocity decay per frame

  // ── Spawn ──
  POSITION_VARIANCE: 12,        // +-half of this value in px
  ANGLE_VARIANCE: 0.8,          // radians added to base angle

  // ── Burst Counts ──
  ENEMY_DEATH_NORMAL: 10,
  ENEMY_DEATH_BOSS: 20,
  NOVA_BURST_COUNT: 20,
} as const;
