import type { Container } from "pixi.js";
import { Projectile } from "../entities/projectile";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";

export class CombatSystem {
  private projectiles: Projectile[] = [];
  private attackTimer = 0;
  private attackInterval = 600; // ms

  private container: Container;
  private player: Player;

  private getEnemies: () => Enemy[];

  constructor(container: Container, player: Player, getEnemies: () => Enemy[]) {
    this.container = container;
    this.player = player;
    this.getEnemies = getEnemies;
  }

  public update(delta: number, deltaMs: number): void {
    this.attackTimer += deltaMs;

    if (this.attackTimer >= this.attackInterval) {
      this.attackTimer = 0;
      this.autoAttack();
    }

    const enemies = this.getEnemies();

    for (const projectile of this.projectiles) {
      if (!projectile.isAlive) continue;

      projectile.update(delta, deltaMs);

      // Check collision with enemies
      for (const enemy of enemies) {
        projectile.checkCollision(enemy);
      }
    }
  }

  private autoAttack(): void {
    const enemies = this.getEnemies();
    if (enemies.length == 0) return;

    const nearest = this.findNearest(enemies);
    if (!nearest) return;

    const dx = nearest.sprite.x - this.player.sprite.x;
    const dy = nearest.sprite.y - this.player.sprite.y;
    const length = Math.hypot(dx, dy);

    if (length == 0) return;

    const dirX = dx / length;
    const dirY = dy / length;

    const projectile = new Projectile(
      this.player.sprite.x,
      this.player.sprite.y,
      dirX,
      dirY,
    );
    this.projectiles.push(projectile);
    this.container.addChild(projectile.sprite);
  }

  /**
   * Find the nearest enemy
   * @param enemies
   */
  findNearest(enemies: Enemy[]): Enemy | null {
    let nearest: Enemy | null = null;
    let minDistance = Infinity;

    for (const enemy of enemies) {
      const dx = enemy.sprite.x - this.player.sprite.x;
      const dy = enemy.sprite.y - this.player.sprite.y;
      const distance = Math.hypot(dx, dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }

    return nearest;
  }
}
