import { PLAYER } from '../constants';

export interface PlayerStats {
  speed: number;
  maxHp: number;
  damage: number;
  attackInterval: number; // ms
  projectileCount: number;
  projectileSpeed: number; // px/frame
  armor: number; // flat damage reduction per hit (min 1 always dealt)
  regenRate: number; // HP per second (0 = disabled)
  attractRange: number; // px — XP orb magnet range
  piercingCount: number; // number of extra enemies a projectile can pass through
  homingEnabled: boolean;
  orbitalCount: number; // number of orbital shield orbs
  novaEnabled: boolean;
}

export function createStats(): PlayerStats {
  return {
    speed: PLAYER.INITIAL_SPEED,
    maxHp: PLAYER.INITIAL_MAX_HP,
    damage: PLAYER.INITIAL_DAMAGE,
    attackInterval: PLAYER.INITIAL_ATTACK_INTERVAL,
    projectileCount: PLAYER.INITIAL_PROJECTILE_COUNT,
    projectileSpeed: PLAYER.INITIAL_PROJECTILE_SPEED,
    armor: PLAYER.INITIAL_ARMOR,
    regenRate: PLAYER.INITIAL_REGEN,
    attractRange: PLAYER.INITIAL_ATTRACT_RANGE,
    piercingCount: 0,
    homingEnabled: false,
    orbitalCount: 0,
    novaEnabled: false,
  };
}
