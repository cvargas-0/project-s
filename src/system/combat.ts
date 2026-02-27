import type { Container } from "pixi.js";
import { Projectile } from "../entities/projectile";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";
import type { PlayerStats } from "../core/playerStats";
import { ProjectilePool } from "../pool/projectilePool";
import { SpatialGrid } from "./spatialGrid";

export class CombatSystem {
  private projectiles: Projectile[] = [];
  private attackTimer = 0;

  private readonly pool: ProjectilePool;
  private readonly grid: SpatialGrid;

  private player: Player;
  private stats: PlayerStats;
  private getEnemies: () => Enemy[];

  constructor(
    container: Container,
    player: Player,
    stats: PlayerStats,
    getEnemies: () => Enemy[],
  ) {
    this.player = player;
    this.stats = stats;
    this.getEnemies = getEnemies;
    this.pool = new ProjectilePool(container);
    this.grid = new SpatialGrid(64);
  }

  public update(delta: number, deltaMs: number): void {
    this.attackTimer += deltaMs;

    if (this.attackTimer >= this.stats.attackInterval) {
      this.attackTimer = 0;
      this.autoAttack();
    }

    const enemies = this.getEnemies();

    // Rebuild spatial grid each frame — O(E)
    this.grid.clear();
    for (const enemy of enemies) {
      if (enemy.isAlive) this.grid.insert(enemy);
    }

    // Update projectiles and check collisions — O(P × k) instead of O(P × E)
    const next: Projectile[] = [];
    for (const p of this.projectiles) {
      if (!p.isAlive) {
        this.pool.release(p); // carry-over dead from last frame
        continue;
      }

      p.update(delta, deltaMs);

      if (p.isAlive) {
        const nearby = this.grid.query(p.sprite.x, p.sprite.y);
        for (const enemy of nearby) {
          p.checkCollision(enemy);
          if (!p.isAlive) break;
        }
      }

      if (p.isAlive) {
        next.push(p);
      } else {
        this.pool.release(p);
      }
    }
    this.projectiles = next;
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
    const spread = count > 1 ? 0.2 : 0;

    for (let i = 0; i < count; i++) {
      const angleOffset = (i - (count - 1) / 2) * spread;
      const cos = Math.cos(angleOffset);
      const sin = Math.sin(angleOffset);

      // Acquire from pool — no new allocation if pool has free instances
      const p = this.pool.acquire(
        this.player.sprite.x,
        this.player.sprite.y,
        dirX * cos - dirY * sin,
        dirX * sin + dirY * cos,
        this.stats.damage,
        this.stats.projectileSpeed,
      );
      this.projectiles.push(p);
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

  /** Destroy all active and pooled sprites — call before game reset */
  public reset(): void {
    for (const p of this.projectiles) {
      p.sprite.parent?.removeChild(p.sprite);
      p.sprite.destroy();
    }
    this.projectiles = [];
    this.pool.destroyAll();
    this.attackTimer = 0;
  }
}
