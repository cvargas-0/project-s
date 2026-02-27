import type { Container } from "pixi.js";

export class ScreenShake {
  private intensity = 0;
  private duration = 0;
  private timer = 0;

  constructor(private target: Container) {}

  /** Start a shake. A stronger shake always overrides a weaker one. */
  trigger(intensity: number, durationMs: number): void {
    if (intensity >= this.intensity) {
      this.intensity = intensity;
      this.duration = durationMs;
      this.timer = 0;
    }
  }

  update(deltaMs: number): void {
    if (this.timer >= this.duration) {
      this.target.position.set(0, 0);
      return;
    }

    this.timer += deltaMs;
    const progress = this.timer / this.duration;
    const mag = this.intensity * (1 - progress); // fade out over time

    this.target.position.set(
      (Math.random() * 2 - 1) * mag,
      (Math.random() * 2 - 1) * mag,
    );
  }

  reset(): void {
    this.intensity = 0;
    this.duration = 0;
    this.timer = 0;
    this.target.position.set(0, 0);
  }
}
