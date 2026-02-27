import { Graphics } from "pixi.js";
import type { Enemy } from "./enemy";
import { PROJECTILE, COLORS, HOMING } from '../constants';

export class Projectile {
  public sprite: Graphics;
  public isAlive: boolean = true;

  private speed: number;
  private lifeTimer = 0;

  private dx: number;
  private dy: number;
  private damage: number;

  public piercingLeft: number;
  public homing: boolean;
  private hitEnemies: Set<Enemy> | null = null;

  constructor(x: number, y: number, dx: number, dy: number, damage = 1, speed = 6, piercing = 0, homing = false) {
    this.damage = damage;
    this.speed = speed;
    this.dx = dx;
    this.dy = dy;
    this.piercingLeft = piercing;
    this.homing = homing;
    this.hitEnemies = piercing > 0 ? new Set() : null;

    // Sprite created once; container management is the pool's responsibility
    this.sprite = new Graphics();
    this.sprite.circle(0, 0, PROJECTILE.RADIUS).fill(homing ? COLORS.HOMING_PROJ : COLORS.PROJECTILE);
    this.sprite.x = x;
    this.sprite.y = y;
  }

  /** Re-initialise a pooled projectile for reuse */
  public reset(x: number, y: number, dx: number, dy: number, damage: number, speed: number, piercing = 0, homing = false): void {
    this.isAlive = true;
    this.lifeTimer = 0;
    this.dx = dx;
    this.dy = dy;
    this.damage = damage;
    this.speed = speed;
    this.piercingLeft = piercing;
    this.homing = homing;
    this.hitEnemies = piercing > 0 ? new Set() : null;
    this.sprite.x = x;
    this.sprite.y = y;

    // Redraw with correct color
    this.sprite.clear();
    this.sprite.circle(0, 0, PROJECTILE.RADIUS).fill(homing ? COLORS.HOMING_PROJ : COLORS.PROJECTILE);
  }

  public update(delta: number, deltaMs: number, targetX?: number, targetY?: number): void {
    if (!this.isAlive) return;

    // Homing: lerp direction toward target
    if (this.homing && targetX !== undefined && targetY !== undefined) {
      const toX = targetX - this.sprite.x;
      const toY = targetY - this.sprite.y;
      const len = Math.hypot(toX, toY);
      if (len > 0) {
        const desiredDx = toX / len;
        const desiredDy = toY / len;
        this.dx += (desiredDx - this.dx) * HOMING.TURN_RATE;
        this.dy += (desiredDy - this.dy) * HOMING.TURN_RATE;
        // Re-normalize
        const newLen = Math.hypot(this.dx, this.dy);
        if (newLen > 0) {
          this.dx /= newLen;
          this.dy /= newLen;
        }
      }
    }

    this.sprite.x += this.dx * this.speed * delta;
    this.sprite.y += this.dy * this.speed * delta;

    this.lifeTimer += deltaMs;
    if (this.lifeTimer >= PROJECTILE.LIFETIME) {
      this.deactivate();
    }
  }

  /** Returns damage dealt (0 if no hit) */
  public checkCollision(enemy: Enemy): number {
    if (!enemy.isAlive || !this.isAlive) return 0;

    // Skip enemies already hit by this piercing projectile
    if (this.hitEnemies && this.hitEnemies.has(enemy)) return 0;

    const dx = enemy.sprite.x - this.sprite.x;
    const dy = enemy.sprite.y - this.sprite.y;

    if (Math.hypot(dx, dy) < PROJECTILE.COLLISION_DISTANCE) {
      enemy.takeDamage(this.damage);

      if (this.piercingLeft > 0) {
        this.piercingLeft--;
        this.hitEnemies!.add(enemy);
      } else {
        this.deactivate();
      }
      return this.damage;
    }
    return 0;
  }

  /** Mark inactive — the pool removes the sprite from the container */
  private deactivate(): void {
    this.isAlive = false;
  }
}
