export const WORLD = {
  WIDTH: 3000,
  HEIGHT: 3000,
} as const;

export const SPATIAL_GRID = {
  CELL_SIZE: 64,
  KEY_MULTIPLIER: 10_000,
  QUERY_RADIUS: 1, // +-1 cell = 3x3 neighbourhood
} as const;
