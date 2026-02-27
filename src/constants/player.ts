export const PLAYER = {
  // ── Visual ──
  RADIUS: 20,

  // ── Initial Stats ──
  INITIAL_SPEED: 4,
  INITIAL_MAX_HP: 10,
  INITIAL_DAMAGE: 1,
  INITIAL_ATTACK_INTERVAL: 600,   // ms between attacks
  INITIAL_PROJECTILE_COUNT: 1,
  INITIAL_PROJECTILE_SPEED: 6,
  INITIAL_ARMOR: 0,
  INITIAL_REGEN: 0,               // HP per second
  INITIAL_ATTRACT_RANGE: 120,     // px

  // ── Combat ──
  INVULNERABILITY_DURATION: 500,  // ms after taking damage
  MIN_DAMAGE_TAKEN: 1,            // armor can't reduce below this
} as const;
