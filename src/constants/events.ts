export const EVENTS = {
  // ── Cooldown ──
  COOLDOWN_BASE: 60_000,        // ms base between events
  COOLDOWN_VARIANCE: 30_000,    // ms ± random variance

  // ── Swarm ──
  SWARM_DURATION: 15_000,
  SWARM_SPAWN_RATE: 2,

  // ── Berserker ──
  BERSERKER_DURATION: 10_000,
  BERSERKER_DAMAGE: 2,

  // ── Frost ──
  FROST_DURATION: 12_000,
  FROST_SPEED_MULTIPLIER: 0.5,

  // ── Blood Moon ──
  BLOOD_MOON_DURATION: 20_000,
  BLOOD_MOON_HP_MULTIPLIER: 2,
  BLOOD_MOON_XP_MULTIPLIER: 2,
} as const;
