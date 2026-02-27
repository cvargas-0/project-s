import { Graphics } from "pixi.js";
import { Player } from "./player";

export class Enemy {
  public sprite: Graphics;
  public isAlive: boolean = true;
  public readonly xpValue = 20;

  private speed = 1.5;
  private hp = 3;

  constructor(x: number, y: number) {
    this.sprite = new Graphics();
    this.sprite.circle(0, 0, 16);
    this.sprite.fill(0xef4444);

    this.sprite.x = x;
    this.sprite.y = y;
  }

  /**
   * Update enemy position towards the player
   *
   * @param delta
   * @param player
   * @returns void
   */
  public update(delta: number, player: Player): void {
    if (!this.isAlive) return;

    const dx = player.sprite.x - this.sprite.x;
    const dy = player.sprite.y - this.sprite.y;

    const length = Math.hypot(dx, dy);
    if (length == 0) return;

    this.sprite.x += (dx / length) * this.speed * delta;
    this.sprite.y += (dy / length) * this.speed * delta;
  }

  /**
   * Take damage to the enemy
   *
   * @param damage
   * @returns void
   */
  public takeDamage(damage: number): void {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.isAlive = false;
      //   this.sprite.destroy();
    }
  }
}
