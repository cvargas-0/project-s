import type { Enemy } from "../entities/enemy";
import { SPATIAL_GRID } from '../constants';

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

  constructor(private readonly cellSize = SPATIAL_GRID.CELL_SIZE) {}

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
   */
  query(x: number, y: number): Enemy[] {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const result: Enemy[] = [];

    for (let dx = -SPATIAL_GRID.QUERY_RADIUS; dx <= SPATIAL_GRID.QUERY_RADIUS; dx++) {
      for (let dy = -SPATIAL_GRID.QUERY_RADIUS; dy <= SPATIAL_GRID.QUERY_RADIUS; dy++) {
        const cell = this.cells.get(this.cellKey(cx + dx, cy + dy));
        if (cell) result.push(...cell);
      }
    }
    return result;
  }

  /** Pack (cx, cy) into a single integer key. */
  private cellKey(cx: number, cy: number): number {
    return cx * SPATIAL_GRID.KEY_MULTIPLIER + cy;
  }
}
