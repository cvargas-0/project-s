import { Graphics } from "pixi.js";
import { Input } from "../core/input";
import type { PlayerStats } from "../core/playerStats";

export class Player {
  public sprite: Graphics;

  private input = new Input();
  private hp: number;

  private isInvulnerable = false;
  private invulnerableDuration = 500; // ms
  private invulnerableTimer = 0;

  private regenAccum = 0; // accumulated HP from regen

  constructor(
    x: number,
    y: number,
    private stats: PlayerStats,
  ) {
    this.hp = stats.maxHp;

    this.sprite = new Graphics();
    this.sprite.circle(0, 0, 20);
    this.sprite.fill(0x38bdf8);
    this.sprite.x = x;
    this.sprite.y = y;
  }

  public update(delta: number) {
    const deltaMs = delta * 16.666;

    let dx = 0;
    let dy = 0;

    if (this.input.isDown("KeyW") || this.input.isDown("ArrowUp")) dy -= 1;
    if (this.input.isDown("KeyS") || this.input.isDown("ArrowDown")) dy += 1;
    if (this.input.isDown("KeyA") || this.input.isDown("ArrowLeft")) dx -= 1;
    if (this.input.isDown("KeyD") || this.input.isDown("ArrowRight")) dx += 1;

    const length = Math.hypot(dx, dy);
    if (length > 0) {
      dx /= length;
      dy /= length;
    }
    this.sprite.x += dx * this.stats.speed * delta;
    this.sprite.y += dy * this.stats.speed * delta;

    // Invulnerability timer
    if (this.isInvulnerable) {
      this.invulnerableTimer += deltaMs;
      if (this.invulnerableTimer >= this.invulnerableDuration) {
        this.isInvulnerable = false;
        this.sprite.tint = 0xffffff;
      }
    }

    // Passive regeneration
    if (this.stats.regenRate > 0) {
      this.regenAccum += this.stats.regenRate * (deltaMs / 1000);
      if (this.regenAccum >= 1) {
        this.regenAccum -= 1;
        this.heal(1);
      }
    }
  }

  /** Returns true if damage was actually applied (not blocked by invulnerability) */
  public takeDamage(damage: number): boolean {
    if (this.isInvulnerable) return false;

    const actual = Math.max(1, damage - this.stats.armor);
    this.hp -= actual;
    this.isInvulnerable = true;
    this.invulnerableTimer = 0;
    this.sprite.tint = 0xff0000;
    return true;
  }

  public heal(amount: number): void {
    this.hp = Math.min(this.stats.maxHp, this.hp + amount);
  }

  public getHp(): number {
    return this.hp;
  }

  public getMaxHp(): number {
    return this.stats.maxHp;
  }

  public isAlive(): boolean {
    return this.hp > 0;
  }
}
