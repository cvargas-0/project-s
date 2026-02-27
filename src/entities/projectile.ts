import { Graphics } from "pixi.js";
import type { Enemy } from "./enemy";

export class Projectile {
  public sprite: Graphics;
  public isAlive: boolean = true;

  private speed: number;
  private lifeTime = 2000; // ms
  private lifeTimer = 0; // ms

  private dx: number;
  private dy: number;
  private damage: number;

  constructor(
    x: number,
    y: number,
    dx: number,
    dy: number,
    damage = 1,
    speed = 6,
  ) {
    this.damage = damage;
    this.speed = speed;

    this.sprite = new Graphics();
    this.sprite.circle(0, 0, 8);
    this.sprite.fill(0xfacc15);

    this.sprite.x = x;
    this.sprite.y = y;

    this.dx = dx;
    this.dy = dy;
  }

  /**
   * Update projectile position
   *
   * @param delta
   * @returns void
   */
  public update(delta: number, deltaMs: number): void {
    if (!this.isAlive) return;

    this.sprite.x += this.dx * this.speed * delta;
    this.sprite.y += this.dy * this.speed * delta;

    this.lifeTimer += deltaMs;
    if (this.lifeTimer >= this.lifeTime) {
      this.destroy();
    }
  }

  /**
   * Take damage to the enemy
   *
   * @param damage
   * @returns void
   */
  public checkCollision(enemy: Enemy): void {
    if (!enemy.isAlive) return;
    if (!this.isAlive) return;
    const dx = enemy.sprite.x - this.sprite.x;
    const dy = enemy.sprite.y - this.sprite.y;

    const distance = Math.hypot(dx, dy);
    if (distance < 20) {
      enemy.takeDamage(this.damage);
      this.destroy();
    }
  }

  /**
   * Destroy projectile
   *
   * @returns void
   */
  private destroy(): void {
    this.isAlive = false;
    this.sprite.destroy();
  }
}
