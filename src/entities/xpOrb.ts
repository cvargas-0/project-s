import { Graphics } from "pixi.js";
import type { Player } from "./player";
import type { PlayerStats } from "../core/playerStats";
import { XP_ORB, COLORS } from '../constants';

export class XpOrb {
  public sprite: Graphics;
  public isAlive = true;
  public readonly xpValue: number;

  constructor(x: number, y: number, xpValue: number) {
    this.xpValue = xpValue;

    this.sprite = new Graphics();
    this.sprite.circle(0, 0, XP_ORB.RADIUS);
    this.sprite.fill(COLORS.XP_ORB);
    this.sprite.x = x;
    this.sprite.y = y;
  }

  /** Returns xp collected (> 0) or 0 if not yet collected */
  public update(delta: number, player: Player, stats: PlayerStats): number {
    if (!this.isAlive) return 0;

    const dx = player.sprite.x - this.sprite.x;
    const dy = player.sprite.y - this.sprite.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= XP_ORB.COLLECT_RANGE) {
      this.isAlive = false;
      return this.xpValue;
    }

    if (dist < stats.attractRange) {
      // Always faster than the player so orbs never lag behind
      const speed = (stats.speed + XP_ORB.ATTRACT_SPEED_OFFSET) * XP_ORB.ATTRACT_SPEED_MULTIPLIER;
      this.sprite.x += (dx / dist) * speed * delta;
      this.sprite.y += (dy / dist) * speed * delta;
    }

    return 0;
  }
}
