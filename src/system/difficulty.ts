import type { EventSystem } from "./events";

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
   *
   * tier 0 at start, roughly +1 every 20s of play, +0.5 per player level above 1.
   */
  private get tier(): number {
    return this.elapsedSeconds / 20 + (this.getPlayerLevel() - 1) * 0.5;
  }

  /** Spawn interval in ms — drops fast: 1000 → 150 floor */
  get spawnInterval(): number {
    const base = Math.max(150, 1000 - this.tier * 60);
    return base / (this.events?.spawnRateMultiplier ?? 1);
  }

  /** Enemy HP — grows with tier */
  get enemyHp(): number {
    const base = 3 + Math.floor(this.tier * 0.8);
    return Math.round(base * (this.events?.enemyHpMultiplier ?? 1));
  }

  /** Enemy move speed — grows with tier, cap at 4.0 */
  get enemySpeed(): number {
    const base = Math.min(4.0, 1.5 + this.tier * 0.12);
    return base * (this.events?.enemySpeedMultiplier ?? 1);
  }

  /** Enemy XP reward — scales with tier so higher levels still feel rewarding */
  get enemyXp(): number {
    return Math.floor(20 * (1 + this.tier * 0.15));
  }

  /** Boss HP — scales with tier + boss count */
  get bossHp(): number {
    return Math.round((25 + this.bossCount * 10) * (1 + this.tier * 0.1));
  }

  /** Boss XP — always 8× the current regular enemy drop */
  get bossXp(): number {
    return this.enemyXp * 8;
  }

  /** Number of orbs a normal enemy drops — increases with tier */
  get enemyOrbCount(): number {
    return 1 + Math.floor(this.tier / 4);
  }

  /** Number of orbs a boss drops — always 3× enemy orb count */
  get bossOrbCount(): number {
    return this.enemyOrbCount * 3;
  }

  update(deltaMs: number): void {
    this.elapsedMs += deltaMs;
  }

  /**
   * Returns true exactly once when each boss threshold is crossed.
   * Bosses spawn at 2:00, 3:30, 5:00, 6:30... (every 90s after first at 120s)
   */
  checkBossSpawn(): boolean {
    const nextThreshold = 120 + this.bossCount * 90;
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
