export const XP_ORB = {
  RADIUS: 7,
  COLLECT_RANGE: 18,             // px to auto-collect
  ATTRACT_SPEED_OFFSET: 2,      // added to player speed for attract calc
  ATTRACT_SPEED_MULTIPLIER: 1.5, // multiplier for attraction velocity
} as const;

export const LEVELING = {
  INITIAL_XP_TO_NEXT: 100,
  XP_PER_LEVEL_MULTIPLIER: 100, // xpToNext = level * this
} as const;
