import type { Container } from "pixi.js";
import { Projectile } from "../entities/projectile";

/**
 * Reuses Projectile instances instead of allocating new ones every attack.
 * Sprites are removed from the container on release and re-added on acquire.
 */
export class ProjectilePool {
  private free: Projectile[] = [];

  constructor(private container: Container) {}

  acquire(x: number, y: number, dx: number, dy: number, damage: number, speed: number, piercing = 0, homing = false): Projectile {
    const p = this.free.pop();
    if (p) {
      p.reset(x, y, dx, dy, damage, speed, piercing, homing);
      this.container.addChild(p.sprite);
      return p;
    }
    // Pool empty — allocate a new one and add to container
    const fresh = new Projectile(x, y, dx, dy, damage, speed, piercing, homing);
    this.container.addChild(fresh.sprite);
    return fresh;
  }

  release(p: Projectile): void {
    p.sprite.parent?.removeChild(p.sprite);
    this.free.push(p);
  }

  /** Destroy all pooled (free) sprites — call before game reset */
  destroyAll(): void {
    for (const p of this.free) p.sprite.destroy();
    this.free = [];
  }
}
