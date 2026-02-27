import type { EventSystem } from "./events";
import { DIFFICULTY } from '../constants';

export class DifficultySystem {
  private elapsedMs = 0;
  private bossCount = 0;
  private events?: EventSystem;
  private getPlayerLevel: () => number;

  constructor(events?: EventSystem, getPlayerLevel: () => number = () => 1) {
    this.events = events;
    this.getPlayerLevel = getPlayerLevel;
  }

  get elapsedSeconds(): number {
    return this.elapsedMs / 1000;
  }

  /**
   * Combined difficulty factor: time contributes a base ramp,
   * player level adds an extra push so levelling up makes the
   * game harder even if time hasn't advanced much.
   */
  private get tier(): number {
    return this.elapsedSeconds / DIFFICULTY.TIME_DIVISOR + (this.getPlayerLevel() - 1) * DIFFICULTY.LEVEL_WEIGHT;
  }

  /** Spawn interval in ms — drops fast */
  get spawnInterval(): number {
    const base = Math.max(DIFFICULTY.SPAWN_INTERVAL_FLOOR, DIFFICULTY.SPAWN_INTERVAL_BASE - this.tier * DIFFICULTY.SPAWN_INTERVAL_REDUCTION);
    return base / (this.events?.spawnRateMultiplier ?? 1);
  }

  /** Enemy HP — grows with tier */
  get enemyHp(): number {
    const base = DIFFICULTY.ENEMY_HP_BASE + Math.floor(this.tier * DIFFICULTY.ENEMY_HP_PER_TIER);
    return Math.round(base * (this.events?.enemyHpMultiplier ?? 1));
  }

  /** Enemy move speed — grows with tier, capped */
  get enemySpeed(): number {
    const base = Math.min(DIFFICULTY.ENEMY_SPEED_CAP, DIFFICULTY.ENEMY_SPEED_BASE + this.tier * DIFFICULTY.ENEMY_SPEED_PER_TIER);
    return base * (this.events?.enemySpeedMultiplier ?? 1);
  }

  /** Enemy XP reward — scales with tier so higher levels still feel rewarding */
  get enemyXp(): number {
    return Math.floor(DIFFICULTY.ENEMY_XP_BASE * (1 + this.tier * DIFFICULTY.ENEMY_XP_TIER_SCALE));
  }

  /** Boss HP — scales with tier + boss count */
  get bossHp(): number {
    return Math.round((DIFFICULTY.BOSS_HP_BASE + this.bossCount * DIFFICULTY.BOSS_HP_PER_COUNT) * (1 + this.tier * DIFFICULTY.BOSS_HP_TIER_SCALE));
  }

  /** Boss XP — always N× the current regular enemy drop */
  get bossXp(): number {
    return this.enemyXp * DIFFICULTY.BOSS_XP_MULTIPLIER;
  }

  /** Number of orbs a normal enemy drops — increases with tier */
  get enemyOrbCount(): number {
    return 1 + Math.floor(this.tier / DIFFICULTY.ORB_TIER_DIVISOR);
  }

  /** Number of orbs a boss drops — always N× enemy orb count */
  get bossOrbCount(): number {
    return this.enemyOrbCount * DIFFICULTY.BOSS_ORB_MULTIPLIER;
  }

  update(deltaMs: number): void {
    this.elapsedMs += deltaMs;
  }

  /**
   * Returns true exactly once when each boss threshold is crossed.
   */
  checkBossSpawn(): boolean {
    const nextThreshold = DIFFICULTY.BOSS_FIRST_SPAWN_TIME + this.bossCount * DIFFICULTY.BOSS_SPAWN_INTERVAL;
    if (this.elapsedSeconds >= nextThreshold) {
      this.bossCount++;
      return true;
    }
    return false;
  }

  reset(): void {
    this.elapsedMs = 0;
    this.bossCount = 0;
  }
}
