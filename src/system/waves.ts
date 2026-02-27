import type { DifficultySystem } from "./difficulty";
import {
  COLORS,
  WAVE_TIMING,
  WAVE_ENCIRCLEMENT,
  WAVE_RUSH,
  WAVE_ELITE,
} from '../constants';

type SpawnFn = (
  x: number,
  y: number,
  hp: number,
  speed: number,
  xp: number,
  isBoss: boolean,
) => void;

interface WaveDefinition {
  name: string;
  color: number;
  spawn: (
    fn: SpawnFn,
    px: number,
    py: number,
    diff: DifficultySystem,
  ) => void;
  suppressMs: number;
}

const WAVES: WaveDefinition[] = [
  {
    name: WAVE_ENCIRCLEMENT.NAME,
    color: COLORS.WAVE_ENCIRCLEMENT,
    suppressMs: WAVE_ENCIRCLEMENT.SUPPRESS_DURATION,
    spawn(fn, px, py, diff) {
      const count = WAVE_ENCIRCLEMENT.ENEMY_COUNT_BASE + Math.floor(Math.random() * (WAVE_ENCIRCLEMENT.ENEMY_COUNT_RANGE + 1));
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const r = WAVE_ENCIRCLEMENT.SPAWN_RADIUS + Math.random() * WAVE_ENCIRCLEMENT.SPAWN_RADIUS_VARIANCE;
        fn(
          px + Math.cos(angle) * r,
          py + Math.sin(angle) * r,
          diff.enemyHp,
          diff.enemySpeed,
          diff.enemyXp,
          false,
        );
      }
    },
  },
  {
    name: WAVE_RUSH.NAME,
    color: COLORS.WAVE_RUSH,
    suppressMs: WAVE_RUSH.SUPPRESS_DURATION,
    spawn(fn, px, py, diff) {
      const side = Math.floor(Math.random() * 4);
      const count = WAVE_RUSH.ENEMY_COUNT_BASE + Math.floor(Math.random() * (WAVE_RUSH.ENEMY_COUNT_RANGE + 1));
      for (let i = 0; i < count; i++) {
        let x: number;
        let y: number;
        const offset = (i - count / 2) * WAVE_RUSH.ENEMY_SPACING;
        switch (side) {
          case 0: x = px + offset; y = py - WAVE_RUSH.SPAWN_DISTANCE; break;
          case 1: x = px + offset; y = py + WAVE_RUSH.SPAWN_DISTANCE; break;
          case 2: x = px - WAVE_RUSH.SPAWN_DISTANCE; y = py + offset; break;
          default: x = px + WAVE_RUSH.SPAWN_DISTANCE; y = py + offset; break;
        }
        fn(x, y, diff.enemyHp, diff.enemySpeed * WAVE_RUSH.SPEED_MULTIPLIER, diff.enemyXp, false);
      }
    },
  },
  {
    name: WAVE_ELITE.NAME,
    color: COLORS.WAVE_ELITE,
    suppressMs: WAVE_ELITE.SUPPRESS_DURATION,
    spawn(fn, px, py, diff) {
      const count = WAVE_ELITE.ENEMY_COUNT_BASE + Math.floor(Math.random() * (WAVE_ELITE.ENEMY_COUNT_RANGE + 1));
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = WAVE_ELITE.SPAWN_RADIUS + Math.random() * WAVE_ELITE.SPAWN_RADIUS_VARIANCE;
        fn(
          px + Math.cos(angle) * r,
          py + Math.sin(angle) * r,
          diff.enemyHp * WAVE_ELITE.HP_MULTIPLIER,
          diff.enemySpeed * WAVE_ELITE.SPEED_MULTIPLIER,
          diff.enemyXp * WAVE_ELITE.XP_MULTIPLIER,
          false,
        );
      }
    },
  },
];

export class WaveSystem {
  private cooldown: number;
  private suppressTimer = 0;
  private lastIndex = -1;

  constructor() {
    this.cooldown = WAVE_TIMING.FIRST_DELAY_BASE + Math.random() * WAVE_TIMING.FIRST_DELAY_VARIANCE;
  }

  get isSuppressing(): boolean {
    return this.suppressTimer > 0;
  }

  update(
    deltaMs: number,
    spawnFn: SpawnFn,
    playerX: number,
    playerY: number,
    difficulty: DifficultySystem,
  ): string | null {
    if (this.suppressTimer > 0) {
      this.suppressTimer -= deltaMs;
      return null;
    }

    this.cooldown -= deltaMs;
    if (this.cooldown <= 0) {
      return this.triggerWave(spawnFn, playerX, playerY, difficulty);
    }
    return null;
  }

  private triggerWave(
    spawnFn: SpawnFn,
    px: number,
    py: number,
    diff: DifficultySystem,
  ): string {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * WAVES.length);
    } while (idx === this.lastIndex && WAVES.length > 1);
    this.lastIndex = idx;

    const wave = WAVES[idx];
    wave.spawn(spawnFn, px, py, diff);
    this.suppressTimer = wave.suppressMs;
    this.cooldown = WAVE_TIMING.COOLDOWN_BASE + Math.random() * WAVE_TIMING.COOLDOWN_VARIANCE;
    return wave.name;
  }

  public reset(): void {
    this.cooldown = WAVE_TIMING.FIRST_DELAY_BASE + Math.random() * WAVE_TIMING.FIRST_DELAY_VARIANCE;
    this.suppressTimer = 0;
    this.lastIndex = -1;
  }
}
