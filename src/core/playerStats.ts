export interface PlayerStats {
  speed: number;
  maxHp: number;
  damage: number;
  attackInterval: number; // ms
  projectileCount: number;
  projectileSpeed: number; // px/frame
  armor: number;          // flat damage reduction per hit (min 1 always dealt)
  regenRate: number;      // HP per second (0 = disabled)
}

export function createStats(): PlayerStats {
  return {
    speed: 4,
    maxHp: 10,
    damage: 1,
    attackInterval: 600,
    projectileCount: 1,
    projectileSpeed: 6,
    armor: 0,
    regenRate: 0,
  };
}
