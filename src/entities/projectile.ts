import { Graphics } from "pixi.js";
import type { Enemy } from "./enemy";

export class Projectile {
  public sprite: Graphics;
  public isAlive: boolean = true;

  private speed: number;
  private lifeTime = 2000; // ms
  private lifeTimer = 0;

  private dx: number;
  private dy: number;
  private damage: number;

  constructor(x: number, y: number, dx: number, dy: number, damage = 1, speed = 6) {
    this.damage = damage;
    this.speed = speed;
    this.dx = dx;
    this.dy = dy;

    // Sprite created once; container management is the pool's responsibility
    this.sprite = new Graphics();
    this.sprite.circle(0, 0, 8).fill(0xfacc15);
    this.sprite.x = x;
    this.sprite.y = y;
  }

  /** Re-initialise a pooled projectile for reuse */
  public reset(x: number, y: number, dx: number, dy: number, damage: number, speed: number): void {
    this.isAlive = true;
    this.lifeTimer = 0;
    this.dx = dx;
    this.dy = dy;
    this.damage = damage;
    this.speed = speed;
    this.sprite.x = x;
    this.sprite.y = y;
  }

  public update(delta: number, deltaMs: number): void {
    if (!this.isAlive) return;

    this.sprite.x += this.dx * this.speed * delta;
    this.sprite.y += this.dy * this.speed * delta;

    this.lifeTimer += deltaMs;
    if (this.lifeTimer >= this.lifeTime) {
      this.deactivate();
    }
  }

  /** Returns damage dealt (0 if no hit) */
  public checkCollision(enemy: Enemy): number {
    if (!enemy.isAlive || !this.isAlive) return 0;

    const dx = enemy.sprite.x - this.sprite.x;
    const dy = enemy.sprite.y - this.sprite.y;

    if (Math.hypot(dx, dy) < 20) {
      enemy.takeDamage(this.damage);
      this.deactivate();
      return this.damage;
    }
    return 0;
  }

  /** Mark inactive — the pool removes the sprite from the container */
  private deactivate(): void {
    this.isAlive = false;
  }
}
