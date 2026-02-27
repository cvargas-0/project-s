export const DIFFICULTY = {
  // ── Tier Calculation ──
  TIME_DIVISOR: 20,
  LEVEL_WEIGHT: 0.5,

  // ── Spawn Rate ──
  SPAWN_INTERVAL_BASE: 1000,     // ms starting interval
  SPAWN_INTERVAL_REDUCTION: 60,  // ms subtracted per tier
  SPAWN_INTERVAL_FLOOR: 150,     // ms minimum interval

  // ── Enemy HP ──
  ENEMY_HP_BASE: 3,
  ENEMY_HP_PER_TIER: 0.8,

  // ── Enemy Speed ──
  ENEMY_SPEED_BASE: 1.5,
  ENEMY_SPEED_PER_TIER: 0.12,
  ENEMY_SPEED_CAP: 4.0,

  // ── Enemy XP ──
  ENEMY_XP_BASE: 20,
  ENEMY_XP_TIER_SCALE: 0.15,

  // ── Boss ──
  BOSS_HP_BASE: 25,
  BOSS_HP_PER_COUNT: 10,
  BOSS_HP_TIER_SCALE: 0.1,
  BOSS_XP_MULTIPLIER: 8,
  BOSS_FIRST_SPAWN_TIME: 120,    // seconds
  BOSS_SPAWN_INTERVAL: 90,       // seconds between subsequent bosses

  // ── Orb Count ──
  ORB_TIER_DIVISOR: 4,           // +1 orb every N tiers
  BOSS_ORB_MULTIPLIER: 3,
} as const;
