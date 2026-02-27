export const RARITY_WEIGHTS = {
  COMMON: 50,
  RARE: 30,
  EPIC: 15,
  LEGENDARY: 5,
} as const;

// ── Common Upgrades ──
export const UP_SWIFT_FEET = { SPEED_MULT: 1.2 } as const;
export const UP_SHARP_EDGE = { DAMAGE_ADD: 1 } as const;
export const UP_RAPID_FIRE = { INTERVAL_MULT: 0.85 } as const;
export const UP_VITALITY = { MAX_HP_ADD: 3, HEAL: 3 } as const;
export const UP_IRON_HIDE = { ARMOR_ADD: 1 } as const;
export const UP_REGENERATION = { REGEN_ADD: 0.25 } as const;
export const UP_MAGNETISM = { ATTRACT_MULT: 1.4 } as const;

// ── Rare Upgrades ──
export const UP_MULTISHOT = { PROJECTILE_ADD: 1 } as const;
export const UP_SWIFT_SHOT = { PROJ_SPEED_MULT: 1.3 } as const;
export const UP_BLITZ = { SPEED_MULT: 1.15, INTERVAL_MULT: 0.9 } as const;
export const UP_THICK_SKIN = { ARMOR_ADD: 2, SPEED_MULT: 0.9 } as const;
export const UP_ADRENALINE = { INTERVAL_MULT: 0.75, MAX_HP_SUB: 2 } as const;
export const UP_HEAVY_ROUNDS = { DAMAGE_ADD: 2, PROJ_SPEED_MULT: 0.8 } as const;
export const UP_SECOND_WIND = { REGEN_ADD: 0.5, ARMOR_SUB: 1 } as const;

// ── Epic Upgrades ──
export const UP_OVERCHARGE = { DAMAGE_ADD: 3, INTERVAL_MULT: 1.2 } as const;
export const UP_GLASS_CANNON = { DAMAGE_ADD: 4, MAX_HP_SUB: 4 } as const;
export const UP_MAGNETAR = { ATTRACT_MULT: 2, SPEED_MULT: 0.85 } as const;
export const UP_BARRAGE = { PROJECTILE_ADD: 2, PROJ_SPEED_MULT: 0.7 } as const;
export const UP_FORTRESS = { ARMOR_ADD: 3, MAX_HP_ADD: 5, SPEED_MULT: 0.75 } as const;

// ── Legendary Upgrades ──
export const UP_ORBITAL_SHIELD = { ORB_COUNT: 3 } as const;

// ── Stat Floors ── (minimum allowed values after trade-off upgrades)
export const STAT_FLOORS = {
  HP: 1,
  ARMOR: 0,
  ATTACK_INTERVAL: 150,         // ms
} as const;
