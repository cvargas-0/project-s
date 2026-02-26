import { Graphics } from "pixi.js";
import { Input } from "../core/input";

export class Player {
  public sprite: Graphics;

  private speed = 4;
  private input = new Input();

  private maxHp = 10;
  private hp = 10;
  private isInvulnerable = false;
  private invulnerableDuration = 500; // ms
  private invulnerableTimer = 0;

  constructor(x: number, y: number) {
    this.sprite = new Graphics();
    this.sprite.circle(0, 0, 20);
    this.sprite.fill(0x38bdf8);

    this.sprite.x = x;
    this.sprite.y = y;
  }

  public update(delta: number) {
    let dx = 0;
    let dy = 0;

    if (this.input.isDown("KeyW") || this.input.isDown("ArrowUp")) dy -= 1;
    if (this.input.isDown("KeyS") || this.input.isDown("ArrowDown")) dy += 1;
    if (this.input.isDown("KeyA") || this.input.isDown("ArrowLeft")) dx -= 1;
    if (this.input.isDown("KeyD") || this.input.isDown("ArrowRight")) dx += 1;

    // Normalize diagonal movement
    const length = Math.hypot(dx, dy);
    if (length > 0) {
      dx /= length;
      dy /= length;
    }
    this.sprite.x += dx * this.speed * delta;
    this.sprite.y += dy * this.speed * delta;

    // Check invulnerability
    if (this.isInvulnerable) {
      this.invulnerableTimer += delta * 16.666; // Convert to ms
      if (this.invulnerableTimer >= this.invulnerableDuration) {
        this.isInvulnerable = false;
        this.sprite.tint = 0xffffff; // Reset tint
      }
    }
  }

  public takeDamage(damage: number): void {
    if (this.isInvulnerable) return;

    this.hp -= damage;
    this.isInvulnerable = true;
    this.invulnerableTimer = 0;

    // feedback effect simple
    this.sprite.tint = 0xff0000;
  }

  public isAlive(): boolean {
    return this.hp > 0;
  }
}
