import type { Container } from "pixi.js";
import { Player } from "../entities/player";
import { DifficultySystem } from "./difficulty";
import { EnemyPool } from "../pool/enemyPool";
import { WaveSystem } from "./waves";
import type { Enemy } from "../entities/enemy";
import { ENEMY, CAMERA, ENEMY_SHAPES } from '../constants';
import type { EnemyShapeConfig } from '../constants';

export class EnemySystem {
  private enemies: Enemy[] = [];
  private spawnTimer = 0;

  private readonly pool: EnemyPool;
  private readonly waves: WaveSystem;
  private player: Player;
  private difficulty: DifficultySystem;
  private onEnemyDied?: (
    x: number,
    y: number,
    xp: number,
    isBoss: boolean,
    color: number,
  ) => void;
  private onPlayerHit?: (damageTaken: number) => void;
  private onWaveStart?: (name: string) => void;

  /** Camera viewport — updated by game loop for camera-relative spawning */
  public camX = 0;
  public camY = 0;
  public viewW: number = CAMERA.DEFAULT_VIEWPORT_WIDTH;
  public viewH: number = CAMERA.DEFAULT_VIEWPORT_HEIGHT;

  constructor(
    container: Container,
    player: Player,
    difficulty: DifficultySystem,
    onEnemyDied?: (x: number, y: number, xp: number, isBoss: boolean, color: number) => void,
    onPlayerHit?: (damageTaken: number) => void,
    onWaveStart?: (name: string) => void,
  ) {
    this.pool = new EnemyPool(container);
    this.waves = new WaveSystem();
    this.player = player;
    this.difficulty = difficulty;
    this.onEnemyDied = onEnemyDied;
    this.onPlayerHit = onPlayerHit;
    this.onWaveStart = onWaveStart;
  }

  public update(deltaMs: number): void {
    // Check for wave trigger
    const waveName = this.waves.update(
      deltaMs,
      (x, y, hp, speed, xp, isBoss) => this.spawnEnemyAt(x, y, hp, speed, xp, isBoss),
      this.player.sprite.x,
      this.player.sprite.y,
      this.difficulty,
    );
    if (waveName) this.onWaveStart?.(waveName);

    // Normal trickle spawning (suppressed during waves)
    if (!this.waves.isSuppressing) {
      this.spawnTimer += deltaMs;
      if (this.spawnTimer >= this.difficulty.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnEnemy();
      }
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
          enemy.baseColor,
        );
        this.pool.release(enemy);
        continue;
      }

      enemy.update(deltaMs / 16.666, this.player);

      const dx = enemy.sprite.x - this.player.sprite.x;
      const dy = enemy.sprite.y - this.player.sprite.y;
      if (Math.hypot(dx, dy) < enemy.collisionRadius) {
        const dmg = this.player.takeDamage(enemy.contactDamage);
        if (dmg) this.onPlayerHit?.(dmg);
      }

      next.push(enemy);
    }
    this.enemies = next;
  }

  public getEnemies(): Enemy[] {
    return this.enemies;
  }

  /** Spawn an enemy at arbitrary world position — used by WaveSystem */
  public spawnEnemyAt(
    x: number,
    y: number,
    hp: number,
    speed: number,
    xp: number,
    isBoss: boolean,
  ): void {
    const shapeConfig = isBoss ? undefined : this.randomShapeConfig();
    const enemy = this.pool.acquire(x, y, hp, speed, xp, isBoss, shapeConfig);
    this.enemies.push(enemy);
  }

  public spawnEnemy(): void {
    const [x, y] = this.randomEdgePosition();
    this.spawnEnemyAt(
      x,
      y,
      this.difficulty.enemyHp,
      this.difficulty.enemySpeed,
      this.difficulty.enemyXp,
      false,
    );
  }

  public spawnBoss(): void {
    const [x, y] = this.randomEdgePosition();
    this.spawnEnemyAt(
      x,
      y,
      this.difficulty.bossHp,
      1.0,
      this.difficulty.bossXp,
      true,
    );
  }

  private randomShapeConfig(): EnemyShapeConfig {
    return ENEMY_SHAPES[Math.floor(Math.random() * ENEMY_SHAPES.length)];
  }

  /** Release all active enemies and destroy the free pool — call before game reset */
  public reset(): void {
    for (const enemy of this.enemies) {
      this.pool.release(enemy);
    }
    this.enemies = [];
    this.pool.destroyAll();
    this.waves.reset();
    this.spawnTimer = 0;
  }

  private randomEdgePosition(): [number, number] {
    const margin = ENEMY.SPAWN_MARGIN;
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0:
        return [this.camX + Math.random() * this.viewW, this.camY - margin];
      case 1:
        return [this.camX + Math.random() * this.viewW, this.camY + this.viewH + margin];
      case 2:
        return [this.camX - margin, this.camY + Math.random() * this.viewH];
      default:
        return [this.camX + this.viewW + margin, this.camY + Math.random() * this.viewH];
    }
  }
}
