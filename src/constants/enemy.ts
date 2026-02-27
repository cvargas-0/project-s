import { COLORS } from './colors';

export type EnemyShape = 'circle' | 'triangle' | 'square' | 'hexagon';

export interface EnemyShapeConfig {
  readonly shape: EnemyShape;
  readonly color: number;
  readonly hpMult: number;
  readonly speedMult: number;
  readonly damageMult: number;
  readonly xpMult: number;
}

export const ENEMY_SHAPES: readonly EnemyShapeConfig[] = [
  { shape: 'circle',   color: COLORS.ENEMY_CIRCLE,   hpMult: 1.0, speedMult: 1.0, damageMult: 1.0, xpMult: 1.0 },
  { shape: 'triangle', color: COLORS.ENEMY_TRIANGLE,  hpMult: 0.7, speedMult: 1.4, damageMult: 1.0, xpMult: 0.8 },
  { shape: 'square',   color: COLORS.ENEMY_SQUARE,    hpMult: 1.6, speedMult: 0.7, damageMult: 1.5, xpMult: 1.3 },
  { shape: 'hexagon',  color: COLORS.ENEMY_HEXAGON,   hpMult: 1.2, speedMult: 1.0, damageMult: 1.0, xpMult: 1.5 },
] as const;

export const ENEMY = {
  // ── Visual ──
  NORMAL_RADIUS: 16,
  BOSS_RADIUS: 32,
  COLLISION_RADIUS_OFFSET: 12,    // added to base radius for hit detection

  // ── Combat ──
  NORMAL_CONTACT_DAMAGE: 1,
  BOSS_CONTACT_DAMAGE: 2,

  // ── Feedback ──
  HIT_FLASH_DURATION: 80,        // ms

  // ── Spawning ──
  SPAWN_MARGIN: 100,             // px beyond viewport edge
} as const;
