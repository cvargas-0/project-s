import type { Container } from "pixi.js";
import { Enemy } from "../entities/enemy";

/**
 * Reuses Enemy instances (both normal and boss) instead of allocating new ones.
 * Enemy.reset() redraws the sprite to match the new type (boss/normal).
 */
export class EnemyPool {
  private free: Enemy[] = [];

  constructor(private container: Container) {}

  acquire(x: number, y: number, hp: number, speed: number, xpValue: number, isBoss: boolean): Enemy {
    const e = this.free.pop();
    if (e) {
      e.reset(x, y, hp, speed, xpValue, isBoss);
      this.container.addChild(e.sprite);
      return e;
    }
    const fresh = new Enemy(x, y, hp, speed, xpValue, isBoss);
    this.container.addChild(fresh.sprite);
    return fresh;
  }

  release(e: Enemy): void {
    e.sprite.parent?.removeChild(e.sprite);
    this.free.push(e);
  }

  /** Destroy all pooled (free) sprites — call before game reset */
  destroyAll(): void {
    for (const e of this.free) e.sprite.destroy();
    this.free = [];
  }
}
