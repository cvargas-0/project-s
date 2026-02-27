import { Graphics } from "pixi.js";
import { Player } from "./player";

const HIT_FLASH_DURATION = 80; // ms

export class Enemy {
  public sprite: Graphics;
  public isAlive: boolean = true;
  public readonly xpValue: number;
  public readonly isBoss: boolean;
  public readonly collisionRadius: number;
  public readonly contactDamage: number;

  private speed: number;
  private hp: number;
  private readonly radius: number;
  private readonly baseColor: number;
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

    this.sprite = new Graphics();
    this.sprite.circle(0, 0, this.radius).fill(this.baseColor);
    this.sprite.x = x;
    this.sprite.y = y;
  }

  public update(delta: number, player: Player): void {
    if (!this.isAlive) return;

    const dx = player.sprite.x - this.sprite.x;
    const dy = player.sprite.y - this.sprite.y;
    const length = Math.hypot(dx, dy);
    if (length == 0) return;

    this.sprite.x += (dx / length) * this.speed * delta;
    this.sprite.y += (dy / length) * this.speed * delta;

    // Hit flash timer
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
