export interface RunStats {
  enemiesKilled: number;
  bossesKilled: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalXpCollected: number;
  upgradesChosen: string[];
}

export function createRunStats(): RunStats {
  return {
    enemiesKilled: 0,
    bossesKilled: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    totalXpCollected: 0,
    upgradesChosen: [],
  };
}
