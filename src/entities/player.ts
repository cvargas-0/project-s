import { Graphics } from "pixi.js";
import { Input } from "../core/input";

export class Player {
  public sprite: Graphics;

  private speed = 4;
  private input = new Input();

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

    if (this.input.isDown("KeyW")) dy -= 1;
    if (this.input.isDown("KeyS")) dy += 1;
    if (this.input.isDown("KeyA")) dx -= 1;
    if (this.input.isDown("KeyD")) dx += 1;

    // Normalize diagonal movement
    const length = Math.hypot(dx, dy);
    if (length > 0) {
      dx /= length;
      dy /= length;
    }
    this.sprite.x += dx * this.speed * delta;
    this.sprite.y += dy * this.speed * delta;
  }
}
