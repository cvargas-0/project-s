import type { Container } from "pixi.js";
import { Enemy } from "../entities/enemy";
import { Player } from "../entities/player";
import { DifficultySystem } from "./difficulty";

export class EnemySystem {
  private enemies: Enemy[] = [];
  private spawnTimer = 0;

  private container: Container;
  private player: Player;
  private difficulty: DifficultySystem;
  private onEnemyDied?: (x: number, y: number, xp: number) => void;

  constructor(
    container: Container,
    player: Player,
    difficulty: DifficultySystem,
    onEnemyDied?: (x: number, y: number, xp: number) => void,
  ) {
    this.container = container;
    this.player = player;
    this.difficulty = difficulty;
    this.onEnemyDied = onEnemyDied;
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

    this.enemies = this.enemies.filter((enemy) => {
      if (!enemy.isAlive) {
        this.onEnemyDied?.(enemy.sprite.x, enemy.sprite.y, enemy.xpValue);
        enemy.sprite.destroy();
        return false;
      }
      return true;
    });

    for (const enemy of this.enemies) {
      enemy.update(deltaMs / 16.666, this.player);

      const dx = enemy.sprite.x - this.player.sprite.x;
      const dy = enemy.sprite.y - this.player.sprite.y;
      const distance = Math.hypot(dx, dy);

      if (distance < enemy.collisionRadius) {
        this.player.takeDamage(enemy.contactDamage);
      }
    }
  }

  public getEnemies(): Enemy[] {
    return this.enemies;
  }

  private spawnAt(x: number, y: number, hp: number, speed: number, xpValue: number, isBoss: boolean): void {
    const enemy = new Enemy(x, y, hp, speed, xpValue, isBoss);
    this.enemies.push(enemy);
    this.container.addChild(enemy.sprite);
  }

  public spawnEnemy(): void {
    const [x, y] = this.randomEdgePosition();
    this.spawnAt(x, y, this.difficulty.enemyHp, this.difficulty.enemySpeed, this.difficulty.enemyXp, false);
  }

  public spawnBoss(): void {
    const [x, y] = this.randomEdgePosition();
    // Boss is slow but very tanky
    this.spawnAt(x, y, this.difficulty.bossHp, 1.0, this.difficulty.bossXp, true);
  }

  private randomEdgePosition(): [number, number] {
    const margin = 100;
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: return [Math.random() * 1280, -margin];           // top
      case 1: return [Math.random() * 1280, 720 + margin];      // bottom
      case 2: return [-margin, Math.random() * 720];            // left
      default: return [1280 + margin, Math.random() * 720];     // right
    }
  }
}
