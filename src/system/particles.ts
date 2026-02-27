import { Graphics } from "pixi.js";
import type { Container } from "pixi.js";
import { PARTICLES } from '../constants';

interface Particle {
  sprite: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  constructor(private container: Container) {}

  /** Spawn a radial burst of particles at (x, y) */
  burst(x: number, y: number, color: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * PARTICLES.ANGLE_VARIANCE;
      const speed = PARTICLES.SPEED_MIN + Math.random() * PARTICLES.SPEED_RANGE;
      const size = PARTICLES.SIZE_MIN + Math.random() * PARTICLES.SIZE_RANGE;
      const life = PARTICLES.LIFETIME_MIN + Math.random() * PARTICLES.LIFETIME_RANGE;

      const sprite = new Graphics();
      sprite.circle(0, 0, size).fill(color);
      sprite.x = x + (Math.random() - 0.5) * PARTICLES.POSITION_VARIANCE;
      sprite.y = y + (Math.random() - 0.5) * PARTICLES.POSITION_VARIANCE;
      this.container.addChild(sprite);

      this.particles.push({
        sprite,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
      });
    }
  }

  update(deltaMs: number): void {
    const delta = deltaMs / 16.666;

    this.particles = this.particles.filter((p) => {
      p.life -= deltaMs;
      if (p.life <= 0) {
        p.sprite.destroy();
        return false;
      }

      p.sprite.x += p.vx * delta;
      p.sprite.y += p.vy * delta;
      p.vx *= PARTICLES.FRICTION;
      p.vy *= PARTICLES.FRICTION;
      p.sprite.alpha = p.life / p.maxLife; // fade out
      return true;
    });
  }

  public reset(): void {
    for (const p of this.particles) p.sprite.destroy();
    this.particles = [];
  }
}
