import type { Container } from "pixi.js";
import { XpOrb } from "../entities/xpOrb";
import type { Player } from "../entities/player";
import type { PlayerStats } from "../core/playerStats";

export class XpSystem {
  public level = 1;
  public xp = 0;
  public xpToNext = 100;

  private orbs: XpOrb[] = [];
  private readonly container: Container;
  private readonly stats: PlayerStats;
  private onXpGained?: (amount: number) => void;

  constructor(container: Container, stats: PlayerStats, onXpGained?: (amount: number) => void) {
    this.container = container;
    this.stats = stats;
    this.onXpGained = onXpGained;
  }

  public spawnOrb(x: number, y: number, xpValue: number): void {
    const orb = new XpOrb(x, y, xpValue);
    this.orbs.push(orb);
    this.container.addChild(orb.sprite);
  }

  /** Returns true if the player leveled up this frame */
  public update(delta: number, player: Player): boolean {
    let leveledUp = false;

    this.orbs = this.orbs.filter((orb) => {
      if (!orb.isAlive) {
        orb.sprite.destroy();
        return false;
      }
      return true;
    });

    for (const orb of this.orbs) {
      const gained = orb.update(delta, player, this.stats);
      if (gained > 0) {
        this.xp += gained;
        this.onXpGained?.(gained);
        if (this.xp >= this.xpToNext) {
          this.xp -= this.xpToNext;
          this.level += 1;
          this.xpToNext = this.level * 100;
          leveledUp = true;
        }
      }
    }

    return leveledUp;
  }

  /** Instantly collect all living orbs (magnet power) */
  public collectAll(): void {
    for (const orb of this.orbs) {
      if (orb.isAlive) {
        this.xp += orb.xpValue;
        this.onXpGained?.(orb.xpValue);
        orb.isAlive = false;
      }
    }
  }

  public reset(): void {
    for (const orb of this.orbs) orb.sprite.destroy();
    this.orbs = [];
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 100;
  }
}
