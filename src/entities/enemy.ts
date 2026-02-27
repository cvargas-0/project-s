import { Graphics } from "pixi.js";
import { Player } from "./player";

const HIT_FLASH_DURATION = 80; // ms

export class Enemy {
  public sprite: Graphics;
  public isAlive = true;

  // Mutable so the pool can reset an instance for reuse
  public xpValue: number;
  public isBoss: boolean;
  public collisionRadius: number;
  public contactDamage: number;

  private speed: number;
  private hp: number;
  private radius: number;
  private baseColor: number;
  private hitFlashTimer = 0;

  constructor(x: number, y: number, hp = 3, speed = 1.5, xpValue = 20, isBoss = false) {
    this.hp = hp;
    this.speed = speed;
    this.xpValue = xpValue;
    this.isBoss = isBoss;

    this.radius = isBoss ? 32 : 16;
    this.baseColor = isBoss ? 0xf97316 : 0xef4444;
    this.collisionRadius = this.radius + 12;
    this.contactDamage = isBoss ? 2 : 1;

    // Sprite created once; container management is the pool's responsibility
    this.sprite = new Graphics();
    this.sprite.circle(0, 0, this.radius).fill(this.baseColor);
    this.sprite.x = x;
    this.sprite.y = y;
  }

  /** Re-initialise a pooled enemy for reuse (redraws sprite if type changed) */
  public reset(x: number, y: number, hp: number, speed: number, xpValue: number, isBoss: boolean): void {
    this.hp = hp;
    this.speed = speed;
    this.xpValue = xpValue;
    this.isBoss = isBoss;
    this.isAlive = true;
    this.hitFlashTimer = 0;

    this.radius = isBoss ? 32 : 16;
    this.baseColor = isBoss ? 0xf97316 : 0xef4444;
    this.collisionRadius = this.radius + 12;
    this.contactDamage = isBoss ? 2 : 1;

    this.sprite.x = x;
    this.sprite.y = y;
    this.redrawSprite(this.baseColor);
  }

  public update(delta: number, player: Player): void {
    if (!this.isAlive) return;

    const dx = player.sprite.x - this.sprite.x;
    const dy = player.sprite.y - this.sprite.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) return;

    this.sprite.x += (dx / length) * this.speed * delta;
    this.sprite.y += (dy / length) * this.speed * delta;

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= delta * 16.666;
      if (this.hitFlashTimer <= 0) {
        this.redrawSprite(this.baseColor);
      }
    }
  }

  public takeDamage(damage: number): void {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.isAlive = false;
    } else {
      this.hitFlashTimer = HIT_FLASH_DURATION;
      this.redrawSprite(0xffffff);
    }
  }

  private redrawSprite(color: number): void {
    this.sprite.clear();
    this.sprite.circle(0, 0, this.radius).fill(color);
  }
}
