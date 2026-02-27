import type { Container } from "pixi.js";
import { Enemy } from "../entities/enemy";
import { Player } from "../entities/player";

export class EnemySystem {
  private enemies: Enemy[] = [];
  private spawnTimer = 0;
  private spawnInterval = 1000; // ms

  private container: Container;
  private player: Player;
  private onEnemyDied?: (x: number, y: number, xp: number) => void;

  constructor(
    container: Container,
    player: Player,
    onEnemyDied?: (x: number, y: number, xp: number) => void,
  ) {
    this.container = container;
    this.player = player;
    this.onEnemyDied = onEnemyDied;
  }

  public update(deltaMS: number): void {
    this.spawnTimer += deltaMS;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
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
      enemy.update(deltaMS / 16.666, this.player);

      const dx = enemy.sprite.x - this.player.sprite.x;
      const dy = enemy.sprite.y - this.player.sprite.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 30) {
        this.player.takeDamage(1);
      }
    }
  }

  public getEnemies(): Enemy[] {
    return this.enemies;
  }

  public spawnEnemy(): void {
    const margin = 100;
    const side = Math.floor(Math.random() * 4);

    let x = 0;
    let y = 0;

    switch (side) {
      case 0: // up
        x = Math.random() * 1280;
        y = -margin;
        break;
      case 1: // down
        x = Math.random() * 1280;
        y = 720 + margin;
        break;
      case 2: // left
        x = -margin;
        y = Math.random() * 720;
        break;
      case 3: // right
        x = 1280 + margin;
        y = Math.random() * 720;
        break;
    }

    const enemy = new Enemy(x, y);
    this.enemies.push(enemy);
    this.container.addChild(enemy.sprite);
  }
}
