import { Graphics } from "pixi.js";
import type { Player } from "./player";
import type { PlayerStats } from "../core/playerStats";

export class XpOrb {
  public sprite: Graphics;
  public isAlive = true;
  public readonly xpValue: number;

  private readonly collectRange = 18;

  constructor(x: number, y: number, xpValue: number) {
    this.xpValue = xpValue;

    this.sprite = new Graphics();
    this.sprite.circle(0, 0, 7);
    this.sprite.fill(0xa78bfa); // violet
    this.sprite.x = x;
    this.sprite.y = y;
  }

  /** Returns xp collected (> 0) or 0 if not yet collected */
  public update(delta: number, player: Player, stats: PlayerStats): number {
    if (!this.isAlive) return 0;

    const dx = player.sprite.x - this.sprite.x;
    const dy = player.sprite.y - this.sprite.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.collectRange) {
      this.isAlive = false;
      return this.xpValue;
    }

    if (dist < stats.attractRange) {
      // Always faster than the player so orbs never lag behind
      const speed = (stats.speed + 2) * 1.5;
      this.sprite.x += (dx / dist) * speed * delta;
      this.sprite.y += (dy / dist) * speed * delta;
    }

    return 0;
  }
}
