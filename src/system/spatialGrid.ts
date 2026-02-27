import type { Enemy } from "../entities/enemy";

/**
 * Uniform-grid spatial hash for fast enemy lookups.
 * Reduces projectile-enemy collision from O(P×E) to roughly O(P × k)
 * where k is the average number of enemies per cell neighbourhood.
 *
 * Usage per frame:
 *   grid.clear()
 *   for (enemy of enemies) grid.insert(enemy)
 *   const nearby = grid.query(projectile.x, projectile.y)
 */
export class SpatialGrid {
  private cells = new Map<number, Enemy[]>();

  constructor(private readonly cellSize = 64) {}

  clear(): void {
    this.cells.clear();
  }

  /** Insert enemy into the single cell containing its centre */
  insert(enemy: Enemy): void {
    const key = this.cellKey(
      Math.floor(enemy.sprite.x / this.cellSize),
      Math.floor(enemy.sprite.y / this.cellSize),
    );
    let cell = this.cells.get(key);
    if (!cell) {
      cell = [];
      this.cells.set(key, cell);
    }
    cell.push(enemy);
  }

  /**
   * Return all enemies whose cell overlaps the 3×3 neighbourhood of (x, y).
   * With cellSize=64 and a collision threshold of 20px this is always correct:
   * any enemy within 20px must be in an adjacent or same cell.
   */
  query(x: number, y: number): Enemy[] {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const result: Enemy[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cell = this.cells.get(this.cellKey(cx + dx, cy + dy));
        if (cell) result.push(...cell);
      }
    }
    return result;
  }

  /** Pack (cx, cy) into a single integer key. Safe for |cx|, |cy| < 10 000. */
  private cellKey(cx: number, cy: number): number {
    return cx * 10_000 + cy;
  }
}
