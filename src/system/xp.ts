import type { Container } from "pixi.js";
import { XpOrb } from "../entities/xpOrb";
import type { Player } from "../entities/player";

export class XpSystem {
  public level = 1;
  public xp = 0;
  public xpToNext = 100;

  private orbs: XpOrb[] = [];
  private readonly container: Container;
  private onXpGained?: (amount: number) => void;

  constructor(container: Container, onXpGained?: (amount: number) => void) {
    this.container = container;
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
      const gained = orb.update(delta, player);
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

  public reset(): void {
    for (const orb of this.orbs) orb.sprite.destroy();
    this.orbs = [];
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 100;
  }
}
