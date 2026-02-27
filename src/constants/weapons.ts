export const HOMING = {
  TURN_RATE: 0.08,
  PROJECTILE_SPEED: 3.5,
} as const;

export const ORBITAL = {
  RADIUS: 80,
  ORB_RADIUS: 10,
  ROTATION_SPEED: 1.8,       // rad/s
  DAMAGE: 4,
  HIT_COOLDOWN: 800,         // ms
} as const;

export const NOVA = {
  RADIUS: 180,
  DAMAGE: 6,
  INTERVAL: 5000,            // ms
} as const;
