export class ScreenShake {
  public offsetX = 0;
  public offsetY = 0;

  private intensity = 0;
  private duration = 0;
  private timer = 0;

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
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }

    this.timer += deltaMs;
    const progress = this.timer / this.duration;
    const mag = this.intensity * (1 - progress);

    this.offsetX = (Math.random() * 2 - 1) * mag;
    this.offsetY = (Math.random() * 2 - 1) * mag;
  }

  reset(): void {
    this.intensity = 0;
    this.duration = 0;
    this.timer = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }
}
