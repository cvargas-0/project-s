import { Graphics } from "pixi.js";
import type { Enemy } from "./enemy";
import { ORBITAL, COLORS } from '../constants';

export class OrbitalOrb {
  public sprite: Graphics;
  private angle: number;
  private hitCooldowns: Map<Enemy, number> = new Map();

  constructor(angle: number) {
    this.angle = angle;
    this.sprite = new Graphics();
    this.sprite.circle(0, 0, ORBITAL.ORB_RADIUS).fill(COLORS.ORBITAL_ORB);
  }

  public update(
    deltaMs: number,
    playerX: number,
    playerY: number,
    nearbyEnemies: Enemy[],
    onDamageDealt?: (amount: number) => void,
  ): void {
    // Rotate
    this.angle += ORBITAL.ROTATION_SPEED * (deltaMs / 1000);

    // Position around player
    this.sprite.x = playerX + Math.cos(this.angle) * ORBITAL.RADIUS;
    this.sprite.y = playerY + Math.sin(this.angle) * ORBITAL.RADIUS;

    // Tick down cooldowns
    for (const [enemy, cd] of this.hitCooldowns) {
      const remaining = cd - deltaMs;
      if (remaining <= 0 || !enemy.isAlive) {
        this.hitCooldowns.delete(enemy);
      } else {
        this.hitCooldowns.set(enemy, remaining);
      }
    }

    // Check collisions with nearby enemies
    for (const enemy of nearbyEnemies) {
      if (!enemy.isAlive) continue;
      if (this.hitCooldowns.has(enemy)) continue;

      const dx = enemy.sprite.x - this.sprite.x;
      const dy = enemy.sprite.y - this.sprite.y;
      const dist = Math.hypot(dx, dy);

      if (dist < ORBITAL.ORB_RADIUS + enemy.collisionRadius) {
        enemy.takeDamage(ORBITAL.DAMAGE);
        this.hitCooldowns.set(enemy, ORBITAL.HIT_COOLDOWN);
        onDamageDealt?.(ORBITAL.DAMAGE);
      }
    }
  }

  public destroy(): void {
    this.sprite.parent?.removeChild(this.sprite);
    this.sprite.destroy();
  }
}
