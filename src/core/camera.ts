import type { Container } from "pixi.js";

export class Camera {
  public x = 0;
  public y = 0;
  public viewportWidth: number;
  public viewportHeight: number;

  constructor(
    private worldWidth: number,
    private worldHeight: number,
    viewportWidth = 1280,
    viewportHeight = 720,
    private lerp = 0.08,
  ) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  update(targetX: number, targetY: number): void {
    const desiredX = targetX - this.viewportWidth / 2;
    const desiredY = targetY - this.viewportHeight / 2;

    this.x += (desiredX - this.x) * this.lerp;
    this.y += (desiredY - this.y) * this.lerp;

    this.x = Math.max(0, Math.min(this.worldWidth - this.viewportWidth, this.x));
    this.y = Math.max(0, Math.min(this.worldHeight - this.viewportHeight, this.y));
  }

  applyTo(container: Container, shakeX = 0, shakeY = 0): void {
    container.x = -this.x + shakeX;
    container.y = -this.y + shakeY;
  }

  reset(): void {
    this.x = 0;
    this.y = 0;
  }
}
