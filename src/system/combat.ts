import type { Container } from "pixi.js";
import { Projectile } from "../entities/projectile";
import { OrbitalOrb } from "../entities/orbitalOrb";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";
import type { PlayerStats } from "../core/playerStats";
import { ProjectilePool } from "../pool/projectilePool";
import { SpatialGrid } from "./spatialGrid";
import { SPATIAL_GRID, PROJECTILE, HOMING, NOVA } from '../constants';

export class CombatSystem {
  private projectiles: Projectile[] = [];
  private attackTimer = 0;

  private readonly pool: ProjectilePool;
  private readonly grid: SpatialGrid;
  private readonly container: Container;

  private player: Player;
  private stats: PlayerStats;
  private getEnemies: () => Enemy[];
  private onDamageDealt?: (amount: number) => void;
  private getDamageMultiplier: () => number;
  private onNova?: (x: number, y: number) => void;

  // Orbital shield
  private orbitalOrbs: OrbitalOrb[] = [];

  // Nova burst
  private novaTimer = 0;

  constructor(
    container: Container,
    player: Player,
    stats: PlayerStats,
    getEnemies: () => Enemy[],
    onDamageDealt?: (amount: number) => void,
    getDamageMultiplier: () => number = () => 1,
    onNova?: (x: number, y: number) => void,
  ) {
    this.container = container;
    this.player = player;
    this.stats = stats;
    this.getEnemies = getEnemies;
    this.onDamageDealt = onDamageDealt;
    this.getDamageMultiplier = getDamageMultiplier;
    this.onNova = onNova;
    this.pool = new ProjectilePool(container);
    this.grid = new SpatialGrid(SPATIAL_GRID.CELL_SIZE);
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

    // Find nearest enemy once for homing projectiles
    let homingTarget: Enemy | null = null;
    if (this.stats.homingEnabled) {
      homingTarget = this.findNearest(enemies);
    }

    // Update projectiles and check collisions — O(P × k) instead of O(P × E)
    const next: Projectile[] = [];
    for (const p of this.projectiles) {
      if (!p.isAlive) {
        this.pool.release(p); // carry-over dead from last frame
        continue;
      }

      // Pass homing target position if this is a homing projectile
      if (p.homing && homingTarget && homingTarget.isAlive) {
        p.update(delta, deltaMs, homingTarget.sprite.x, homingTarget.sprite.y);
      } else {
        p.update(delta, deltaMs);
      }

      if (p.isAlive) {
        const nearby = this.grid.query(p.sprite.x, p.sprite.y);
        for (const enemy of nearby) {
          const dmg = p.checkCollision(enemy);
          if (dmg) this.onDamageDealt?.(dmg);
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

    // Orbital shield
    this.syncOrbitalOrbs();
    const playerX = this.player.sprite.x;
    const playerY = this.player.sprite.y;
    const orbitalNearby = this.grid.query(playerX, playerY);
    for (const orb of this.orbitalOrbs) {
      orb.update(deltaMs, playerX, playerY, orbitalNearby, this.onDamageDealt);
    }

    // Nova burst
    if (this.stats.novaEnabled) {
      this.novaTimer += deltaMs;
      if (this.novaTimer >= NOVA.INTERVAL) {
        this.novaTimer = 0;
        this.triggerNova(enemies);
      }
    }
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
    const spread = count > 1 ? PROJECTILE.SPREAD_ANGLE : 0;
    const isHoming = this.stats.homingEnabled;
    const speed = isHoming ? HOMING.PROJECTILE_SPEED : this.stats.projectileSpeed;

    for (let i = 0; i < count; i++) {
      const angleOffset = (i - (count - 1) / 2) * spread;
      const cos = Math.cos(angleOffset);
      const sin = Math.sin(angleOffset);

      const damage = Math.round(this.stats.damage * this.getDamageMultiplier());
      const p = this.pool.acquire(
        this.player.sprite.x,
        this.player.sprite.y,
        dirX * cos - dirY * sin,
        dirX * sin + dirY * cos,
        damage,
        speed,
        this.stats.piercingCount,
        isHoming,
      );
      this.projectiles.push(p);
    }
  }

  private syncOrbitalOrbs(): void {
    const desired = this.stats.orbitalCount;
    const current = this.orbitalOrbs.length;

    if (current < desired) {
      for (let i = current; i < desired; i++) {
        const angle = (Math.PI * 2 * i) / desired;
        const orb = new OrbitalOrb(angle);
        this.container.addChild(orb.sprite);
        this.orbitalOrbs.push(orb);
      }
    } else if (current > desired) {
      while (this.orbitalOrbs.length > desired) {
        const orb = this.orbitalOrbs.pop()!;
        orb.destroy();
      }
    }
  }

  private triggerNova(enemies: Enemy[]): void {
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const dmgMult = this.getDamageMultiplier();

    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      const dx = enemy.sprite.x - px;
      const dy = enemy.sprite.y - py;
      if (Math.hypot(dx, dy) < NOVA.RADIUS) {
        const dmg = Math.round(NOVA.DAMAGE * dmgMult);
        enemy.takeDamage(dmg);
        this.onDamageDealt?.(dmg);
      }
    }

    this.onNova?.(px, py);
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

    // Orbital cleanup
    for (const orb of this.orbitalOrbs) {
      orb.destroy();
    }
    this.orbitalOrbs = [];

    // Nova reset
    this.novaTimer = 0;
  }
}
