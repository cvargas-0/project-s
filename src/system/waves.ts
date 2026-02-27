import type { DifficultySystem } from "./difficulty";

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
    name: "Encirclement!",
    color: 0xfbbf24,
    suppressMs: 4000,
    spawn(fn, px, py, diff) {
      const count = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const r = 280 + Math.random() * 40;
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
    name: "Rush!",
    color: 0xf97316,
    suppressMs: 3000,
    spawn(fn, px, py, diff) {
      const side = Math.floor(Math.random() * 4);
      const count = 10 + Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i++) {
        let x: number;
        let y: number;
        const offset = (i - count / 2) * 40;
        switch (side) {
          case 0: x = px + offset; y = py - 350; break;
          case 1: x = px + offset; y = py + 350; break;
          case 2: x = px - 350; y = py + offset; break;
          default: x = px + 350; y = py + offset; break;
        }
        fn(x, y, diff.enemyHp, diff.enemySpeed * 1.3, diff.enemyXp, false);
      }
    },
  },
  {
    name: "Elite Squad!",
    color: 0xa78bfa,
    suppressMs: 5000,
    spawn(fn, px, py, diff) {
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 250 + Math.random() * 100;
        fn(
          px + Math.cos(angle) * r,
          py + Math.sin(angle) * r,
          diff.enemyHp * 3,
          diff.enemySpeed * 0.8,
          diff.enemyXp * 2,
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
    this.cooldown = 120_000 + Math.random() * 30_000;
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
    this.cooldown = 90_000 + Math.random() * 30_000;
    return wave.name;
  }

  public reset(): void {
    this.cooldown = 120_000 + Math.random() * 30_000;
    this.suppressTimer = 0;
    this.lastIndex = -1;
  }
}
