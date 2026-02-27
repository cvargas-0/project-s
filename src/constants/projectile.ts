export const PROJECTILE = {
  RADIUS: 8,
  LIFETIME: 2000,                // ms before despawn
  COLLISION_DISTANCE: 20,        // px for hit detection
  SPREAD_ANGLE: 0.2,            // radians between multishot projectiles
  MIN_ATTACK_INTERVAL: 150,      // ms — lower bound for attack speed upgrades
} as const;
