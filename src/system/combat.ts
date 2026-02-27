import type { Container } from "pixi.js";
import { Projectile } from "../entities/projectile";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";
import type { PlayerStats } from "../core/playerStats";

export class CombatSystem {
  private projectiles: Projectile[] = [];
  private attackTimer = 0;

  private container: Container;
  private player: Player;
  private stats: PlayerStats;
  private getEnemies: () => Enemy[];

  constructor(
    container: Container,
    player: Player,
    stats: PlayerStats,
    getEnemies: () => Enemy[],
  ) {
    this.container = container;
    this.player = player;
    this.stats = stats;
    this.getEnemies = getEnemies;
  }

  public update(delta: number, deltaMs: number): void {
    this.attackTimer += deltaMs;

    if (this.attackTimer >= this.stats.attackInterval) {
      this.attackTimer = 0;
      this.autoAttack();
    }

    const enemies = this.getEnemies();

    for (const projectile of this.projectiles) {
      if (!projectile.isAlive) continue;

      projectile.update(delta, deltaMs);

      for (const enemy of enemies) {
        projectile.checkCollision(enemy);
      }
    }

    this.projectiles = this.projectiles.filter((p) => p.isAlive);
  }

  private autoAttack(): void {
    const enemies = this.getEnemies();
    if (enemies.length === 0) return;

    const nearest = this.findNearest(enemies);
    if (!nearest) return;

    const dx = nearest.sprite.x - this.player.sprite.x;
    const dy = nearest.sprite.y - this.player.sprite.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) return;

    const dirX = dx / length;
    const dirY = dy / length;

    const count = this.stats.projectileCount;
    const spread = count > 1 ? 0.2 : 0; // radians between projectiles

    for (let i = 0; i < count; i++) {
      const angleOffset = (i - (count - 1) / 2) * spread;
      const cos = Math.cos(angleOffset);
      const sin = Math.sin(angleOffset);
      const px = dirX * cos - dirY * sin;
      const py = dirX * sin + dirY * cos;

      const projectile = new Projectile(
        this.player.sprite.x,
        this.player.sprite.y,
        px,
        py,
        this.stats.damage,
        this.stats.projectileSpeed,
      );
      this.projectiles.push(projectile);
      this.container.addChild(projectile.sprite);
    }
  }

  findNearest(enemies: Enemy[]): Enemy | null {
    let nearest: Enemy | null = null;
    let minDistance = Infinity;

    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
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
