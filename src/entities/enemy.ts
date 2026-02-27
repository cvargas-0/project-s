import { Graphics } from "pixi.js";
import { Player } from "./player";
import { ENEMY, COLORS } from '../constants';
import type { EnemyShape, EnemyShapeConfig } from '../constants';

export class Enemy {
  public sprite: Graphics;
  public isAlive = true;

  // Mutable so the pool can reset an instance for reuse
  public xpValue: number;
  public isBoss: boolean;
  public collisionRadius: number;
  public contactDamage: number;
  public shape: EnemyShape;
  public baseColor: number;

  private speed: number;
  private hp: number;
  private radius: number;
  private hitFlashTimer = 0;

  constructor(
    x: number,
    y: number,
    hp = 3,
    speed = 1.5,
    xpValue = 20,
    isBoss = false,
    shapeConfig?: EnemyShapeConfig,
  ) {
    this.isBoss = isBoss;
    this.radius = isBoss ? ENEMY.BOSS_RADIUS : ENEMY.NORMAL_RADIUS;

    if (isBoss || !shapeConfig) {
      this.shape = 'circle';
      this.baseColor = isBoss ? COLORS.ENEMY_BOSS : COLORS.ENEMY_NORMAL;
      this.hp = hp;
      this.speed = speed;
      this.xpValue = xpValue;
      this.contactDamage = isBoss ? ENEMY.BOSS_CONTACT_DAMAGE : ENEMY.NORMAL_CONTACT_DAMAGE;
    } else {
      this.shape = shapeConfig.shape;
      this.baseColor = shapeConfig.color;
      this.hp = hp * shapeConfig.hpMult;
      this.speed = speed * shapeConfig.speedMult;
      this.xpValue = Math.round(xpValue * shapeConfig.xpMult);
      this.contactDamage = ENEMY.NORMAL_CONTACT_DAMAGE * shapeConfig.damageMult;
    }

    this.collisionRadius = this.radius + ENEMY.COLLISION_RADIUS_OFFSET;

    // Sprite created once; container management is the pool's responsibility
    this.sprite = new Graphics();
    this.drawShape(this.baseColor);
    this.sprite.x = x;
    this.sprite.y = y;
  }

  /** Re-initialise a pooled enemy for reuse (redraws sprite if type changed) */
  public reset(
    x: number,
    y: number,
    hp: number,
    speed: number,
    xpValue: number,
    isBoss: boolean,
    shapeConfig?: EnemyShapeConfig,
  ): void {
    this.isBoss = isBoss;
    this.isAlive = true;
    this.hitFlashTimer = 0;

    this.radius = isBoss ? ENEMY.BOSS_RADIUS : ENEMY.NORMAL_RADIUS;

    if (isBoss || !shapeConfig) {
      this.shape = 'circle';
      this.baseColor = isBoss ? COLORS.ENEMY_BOSS : COLORS.ENEMY_NORMAL;
      this.hp = hp;
      this.speed = speed;
      this.xpValue = xpValue;
      this.contactDamage = isBoss ? ENEMY.BOSS_CONTACT_DAMAGE : ENEMY.NORMAL_CONTACT_DAMAGE;
    } else {
      this.shape = shapeConfig.shape;
      this.baseColor = shapeConfig.color;
      this.hp = hp * shapeConfig.hpMult;
      this.speed = speed * shapeConfig.speedMult;
      this.xpValue = Math.round(xpValue * shapeConfig.xpMult);
      this.contactDamage = ENEMY.NORMAL_CONTACT_DAMAGE * shapeConfig.damageMult;
    }

    this.collisionRadius = this.radius + ENEMY.COLLISION_RADIUS_OFFSET;

    this.sprite.x = x;
    this.sprite.y = y;
    this.drawShape(this.baseColor);
  }

  public update(delta: number, player: Player): void {
    if (!this.isAlive) return;

    const dx = player.sprite.x - this.sprite.x;
    const dy = player.sprite.y - this.sprite.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) return;

    this.sprite.x += (dx / length) * this.speed * delta;
    this.sprite.y += (dy / length) * this.speed * delta;

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= delta * 16.666;
      if (this.hitFlashTimer <= 0) {
        this.drawShape(this.baseColor);
      }
    }
  }

  public takeDamage(damage: number): void {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.isAlive = false;
    } else {
      this.hitFlashTimer = ENEMY.HIT_FLASH_DURATION;
      this.drawShape(COLORS.HIT_FLASH);
    }
  }

  private drawShape(color: number): void {
    const r = this.radius;
    this.sprite.clear();

    switch (this.shape) {
      case 'triangle':
        this.sprite.poly([
          0, -r,
          r * 0.87, r * 0.5,
          -r * 0.87, r * 0.5,
        ]).fill(color);
        break;

      case 'square':
        this.sprite.rect(-r, -r, r * 2, r * 2).fill(color);
        break;

      case 'hexagon': {
        const points: number[] = [];
        for (let i = 0; i < 6; i++) {
          const angle = i * Math.PI / 3;
          points.push(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        this.sprite.poly(points).fill(color);
        break;
      }

      case 'circle':
      default:
        this.sprite.circle(0, 0, r).fill(color);
        break;
    }
  }
}
