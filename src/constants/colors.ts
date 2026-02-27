export const COLORS = {
  // ── Background ──
  BACKGROUND: 0x0f172a,

  // ── Entities ──
  PLAYER: 0x38bdf8,
  ENEMY_NORMAL: 0xef4444,
  ENEMY_BOSS: 0xf97316,
  ENEMY_CIRCLE: 0xef4444,
  ENEMY_TRIANGLE: 0x22d3ee,
  ENEMY_SQUARE: 0xf97316,
  ENEMY_HEXAGON: 0xa78bfa,
  PROJECTILE: 0xfacc15,
  XP_ORB: 0xa78bfa,

  // ── Feedback ──
  HIT_FLASH: 0xffffff,
  DAMAGE_TINT: 0xff0000,
  NEUTRAL_TINT: 0xffffff,

  // ── UI Chrome ──
  UI_BG: 0x1e293b,
  HP_BAR: 0xf43f5e,
  XP_BAR: 0xa78bfa,
  TEXT_PRIMARY: 0xffffff,
  TEXT_SECONDARY: 0x94a3b8,
  TEXT_SUBTLE: 0x475569,
  TEXT_LIGHT: 0xdde1e7,
  TITLE_GOLD: 0xfbbf24,
  GAME_OVER_RED: 0xf43f5e,
  BACKDROP: 0x000000,

  // ── Card UI ──
  CARD_BG: 0x1e293b,
  CARD_BG_HOVER: 0x2d3f5e,
  CARD_BORDER_HOVER: 0xffffff,

  // ── Rarity ──
  RARITY_COMMON: 0x94a3b8,
  RARITY_RARE: 0x38bdf8,
  RARITY_EPIC: 0xa78bfa,
  RARITY_LEGENDARY: 0xfbbf24,

  // ── Events ──
  EVENT_SWARM: 0xf97316,
  EVENT_BERSERKER: 0xef4444,
  EVENT_FROST: 0x38bdf8,
  EVENT_BLOOD_MOON: 0xdc2626,

  // ── Weapons ──
  ORBITAL_ORB: 0x34d399,
  NOVA_BURST: 0xff6b35,
  HOMING_PROJ: 0xf472b6,

  // ── Waves ──
  WAVE_ENCIRCLEMENT: 0xfbbf24,
  WAVE_RUSH: 0xf97316,
  WAVE_ELITE: 0xa78bfa,
} as const;
