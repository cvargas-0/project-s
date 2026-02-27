import { Graphics } from "pixi.js";
import { Input } from "../core/input";
import type { PlayerStats } from "../core/playerStats";
import { PLAYER, COLORS } from '../constants';

export class Player {
  public sprite: Graphics;

  private input = new Input();
  private hp: number;

  private isInvulnerable = false;
  private invulnerableTimer = 0;

  private regenAccum = 0; // accumulated HP from regen
  private worldWidth: number;
  private worldHeight: number;

  constructor(
    x: number,
    y: number,
    private stats: PlayerStats,
    worldWidth = 1280,
    worldHeight = 720,
  ) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.hp = stats.maxHp;

    this.sprite = new Graphics();
    this.sprite.circle(0, 0, PLAYER.RADIUS);
    this.sprite.fill(COLORS.PLAYER);
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

    // Clamp to world bounds
    this.sprite.x = Math.max(PLAYER.RADIUS, Math.min(this.worldWidth - PLAYER.RADIUS, this.sprite.x));
    this.sprite.y = Math.max(PLAYER.RADIUS, Math.min(this.worldHeight - PLAYER.RADIUS, this.sprite.y));

    // Invulnerability timer
    if (this.isInvulnerable) {
      this.invulnerableTimer += deltaMs;
      if (this.invulnerableTimer >= PLAYER.INVULNERABILITY_DURATION) {
        this.isInvulnerable = false;
        this.sprite.tint = COLORS.NEUTRAL_TINT;
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

  /** Returns actual damage dealt (0 if blocked by invulnerability) */
  public takeDamage(damage: number): number {
    if (this.isInvulnerable) return 0;

    const actual = Math.max(PLAYER.MIN_DAMAGE_TAKEN, damage - this.stats.armor);
    this.hp -= actual;
    this.isInvulnerable = true;
    this.invulnerableTimer = 0;
    this.sprite.tint = COLORS.DAMAGE_TINT;
    return actual;
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
