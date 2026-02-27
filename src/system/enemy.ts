import type { Container } from "pixi.js";
import { Player } from "../entities/player";
import { DifficultySystem } from "./difficulty";
import { EnemyPool } from "../pool/enemyPool";
import type { Enemy } from "../entities/enemy";

export class EnemySystem {
  private enemies: Enemy[] = [];
  private spawnTimer = 0;

  private readonly pool: EnemyPool;
  private player: Player;
  private difficulty: DifficultySystem;
  private onEnemyDied?: (
    x: number,
    y: number,
    xp: number,
    isBoss: boolean,
  ) => void;
  private onPlayerHit?: () => void;

  constructor(
    container: Container,
    player: Player,
    difficulty: DifficultySystem,
    onEnemyDied?: (x: number, y: number, xp: number, isBoss: boolean) => void,
    onPlayerHit?: () => void,
  ) {
    this.pool = new EnemyPool(container);
    this.player = player;
    this.difficulty = difficulty;
    this.onEnemyDied = onEnemyDied;
    this.onPlayerHit = onPlayerHit;
  }

  public update(deltaMs: number): void {
    this.spawnTimer += deltaMs;

    if (this.spawnTimer >= this.difficulty.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }

    if (this.difficulty.checkBossSpawn()) {
      this.spawnBoss();
    }

    const next: Enemy[] = [];
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) {
        this.onEnemyDied?.(
          enemy.sprite.x,
          enemy.sprite.y,
          enemy.xpValue,
          enemy.isBoss,
        );
        this.pool.release(enemy);
        continue;
      }

      enemy.update(deltaMs / 16.666, this.player);

      const dx = enemy.sprite.x - this.player.sprite.x;
      const dy = enemy.sprite.y - this.player.sprite.y;
      if (Math.hypot(dx, dy) < enemy.collisionRadius) {
        const hit = this.player.takeDamage(enemy.contactDamage);
        if (hit) this.onPlayerHit?.();
      }

      next.push(enemy);
    }
    this.enemies = next;
  }

  public getEnemies(): Enemy[] {
    return this.enemies;
  }

  public spawnEnemy(): void {
    const [x, y] = this.randomEdgePosition();
    const enemy = this.pool.acquire(
      x,
      y,
      this.difficulty.enemyHp,
      this.difficulty.enemySpeed,
      this.difficulty.enemyXp,
      false,
    );
    this.enemies.push(enemy);
  }

  public spawnBoss(): void {
    const [x, y] = this.randomEdgePosition();
    const boss = this.pool.acquire(
      x,
      y,
      this.difficulty.bossHp,
      1.0,
      this.difficulty.bossXp,
      true,
    );
    this.enemies.push(boss);
  }

  /** Release all active enemies and destroy the free pool — call before game reset */
  public reset(): void {
    for (const enemy of this.enemies) {
      this.pool.release(enemy);
    }
    this.enemies = [];
    this.pool.destroyAll();
    this.spawnTimer = 0;
  }

  private randomEdgePosition(): [number, number] {
    const margin = 100;
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0:
        return [Math.random() * 1280, -margin]; // top
      case 1:
        return [Math.random() * 1280, 720 + margin]; // bottom
      case 2:
        return [-margin, Math.random() * 720]; // left
      default:
        return [1280 + margin, Math.random() * 720]; // right
    }
  }
}
