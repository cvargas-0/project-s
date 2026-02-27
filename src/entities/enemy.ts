import { Graphics } from "pixi.js";
import { Player } from "./player";

export class Enemy {
  public sprite: Graphics;
  public isAlive: boolean = true;
  public readonly xpValue: number;
  public readonly isBoss: boolean;
  public readonly collisionRadius: number;
  public readonly contactDamage: number;

  private speed: number;
  private hp: number;

  constructor(x: number, y: number, hp = 3, speed = 1.5, xpValue = 20, isBoss = false) {
    this.hp = hp;
    this.speed = speed;
    this.xpValue = xpValue;
    this.isBoss = isBoss;

    const radius = isBoss ? 32 : 16;
    const color = isBoss ? 0xf97316 : 0xef4444; // orange for boss, red for normal
    this.collisionRadius = radius + 12;
    this.contactDamage = isBoss ? 2 : 1;

    this.sprite = new Graphics();
    this.sprite.circle(0, 0, radius);
    this.sprite.fill(color);
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
  }

  public takeDamage(damage: number): void {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.isAlive = false;
    }
  }
}
