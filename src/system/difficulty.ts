export class DifficultySystem {
  private elapsedMs = 0;
  private bossCount = 0;

  get elapsedSeconds(): number {
    return this.elapsedMs / 1000;
  }

  /** Spawn interval in ms — decreases every 30s, floor at 200ms */
  get spawnInterval(): number {
    const stages = Math.floor(this.elapsedSeconds / 30);
    return Math.max(200, 1000 - stages * 80);
  }

  /** Enemy HP — increases every 60s */
  get enemyHp(): number {
    return 3 + Math.floor(this.elapsedSeconds / 60);
  }

  /** Enemy move speed — increases every 90s, cap at 3.5 */
  get enemySpeed(): number {
    return Math.min(3.5, 1.5 + Math.floor(this.elapsedSeconds / 90) * 0.2);
  }

  /**
   * Enemy XP reward — grows smoothly with time.
   * Every 2 minutes: +10 XP. t=0 → 20, t=2min → 30, t=4min → 40...
   */
  get enemyXp(): number {
    return Math.floor(20 * (1 + this.elapsedSeconds / 120));
  }

  /** Boss HP for the current boss count */
  get bossHp(): number {
    return 25 + this.bossCount * 10;
  }

  /** Boss XP — always 8× the current regular enemy drop */
  get bossXp(): number {
    return this.enemyXp * 8;
  }

  /** Number of orbs a normal enemy drops — increases every 2 minutes */
  get enemyOrbCount(): number {
    return 1 + Math.floor(this.elapsedSeconds / 120);
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
   * Bosses spawn at 3:00, 5:00, 7:00, 9:00...
   */
  checkBossSpawn(): boolean {
    const nextThreshold = 180 + this.bossCount * 120;
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
