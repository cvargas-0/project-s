import type { PlayerStats } from "../core/playerStats";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export const RARITY_COLORS: Record<Rarity, number> = {
  common: 0x94a3b8, // grey
  rare: 0x38bdf8, // blue
  epic: 0xa78bfa, // purple
  legendary: 0xfbbf24, // gold
};

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 50,
  rare: 30,
  epic: 15,
  legendary: 5,
};

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  apply(stats: PlayerStats, heal: (amount: number) => void): void;
}

export const ALL_UPGRADES: Upgrade[] = [
  // ── Common ──────────────────────────────────────────
  {
    id: "speed",
    name: "Swift Feet",
    description: "+20% movement speed",
    rarity: "common",
    apply(stats) {
      stats.speed *= 1.2;
    },
  },
  {
    id: "damage",
    name: "Sharp Edge",
    description: "+1 damage per projectile",
    rarity: "common",
    apply(stats) {
      stats.damage += 1;
    },
  },
  {
    id: "attack_speed",
    name: "Rapid Fire",
    description: "-15% time between attacks",
    rarity: "common",
    apply(stats) {
      stats.attackInterval = Math.max(150, stats.attackInterval * 0.85);
    },
  },
  {
    id: "max_hp",
    name: "Vitality",
    description: "+3 max HP, restore 3 HP",
    rarity: "common",
    apply(stats, heal) {
      stats.maxHp += 3;
      heal(3);
    },
  },
  {
    id: "armor",
    name: "Iron Hide",
    description: "+1 armor (reduce damage taken)",
    rarity: "common",
    apply(stats) {
      stats.armor += 1;
    },
  },
  {
    id: "regen",
    name: "Regeneration",
    description: "Recover 1 HP every 4 seconds",
    rarity: "common",
    apply(stats) {
      stats.regenRate += 0.25;
    },
  },
  {
    id: "magnet",
    name: "Magnetism",
    description: "+40% orb attract range",
    rarity: "common",
    apply(stats) {
      stats.attractRange *= 1.4;
    },
  },

  // ── Rare ────────────────────────────────────────────
  {
    id: "multishot",
    name: "Multishot",
    description: "+1 projectile per attack",
    rarity: "rare",
    apply(stats) {
      stats.projectileCount += 1;
    },
  },
  {
    id: "projectile_speed",
    name: "Swift Shot",
    description: "+30% projectile speed",
    rarity: "rare",
    apply(stats) {
      stats.projectileSpeed *= 1.3;
    },
  },
  {
    id: "blitz",
    name: "Blitz",
    description: "+15% move speed, -10% attack interval",
    rarity: "rare",
    apply(stats) {
      stats.speed *= 1.15;
      stats.attackInterval = Math.max(150, stats.attackInterval * 0.9);
    },
  },
  {
    id: "thick_skin",
    name: "Thick Skin",
    description: "+2 armor, -10% move speed",
    rarity: "rare",
    apply(stats) {
      stats.armor += 2;
      stats.speed *= 0.9;
    },
  },
  {
    id: "adrenaline",
    name: "Adrenaline",
    description: "-25% attack interval, -2 max HP",
    rarity: "rare",
    apply(stats) {
      stats.attackInterval = Math.max(150, stats.attackInterval * 0.75);
      stats.maxHp = Math.max(1, stats.maxHp - 2);
    },
  },
  {
    id: "heavy_rounds",
    name: "Heavy Rounds",
    description: "+2 damage, -20% projectile speed",
    rarity: "rare",
    apply(stats) {
      stats.damage += 2;
      stats.projectileSpeed *= 0.8;
    },
  },
  {
    id: "second_wind",
    name: "Second Wind",
    description: "+0.5 HP/s regen, -1 armor",
    rarity: "rare",
    apply(stats) {
      stats.regenRate += 0.5;
      stats.armor = Math.max(0, stats.armor - 1);
    },
  },

  // ── Epic ────────────────────────────────────────────
  {
    id: "overcharge",
    name: "Overcharge",
    description: "+3 damage, +20% attack interval",
    rarity: "epic",
    apply(stats) {
      stats.damage += 3;
      stats.attackInterval *= 1.2;
    },
  },
  {
    id: "glass_cannon",
    name: "Glass Cannon",
    description: "+4 damage, -4 max HP",
    rarity: "epic",
    apply(stats) {
      stats.damage += 4;
      stats.maxHp = Math.max(1, stats.maxHp - 4);
    },
  },
  {
    id: "magnetar",
    name: "Magnetar",
    description: "+100% orb range, -15% move speed",
    rarity: "epic",
    apply(stats) {
      stats.attractRange *= 2;
      stats.speed *= 0.85;
    },
  },
  {
    id: "barrage",
    name: "Barrage",
    description: "+2 projectiles, -30% projectile speed",
    rarity: "epic",
    apply(stats) {
      stats.projectileCount += 2;
      stats.projectileSpeed *= 0.7;
    },
  },
  {
    id: "fortress",
    name: "Fortress",
    description: "+3 armor, +5 max HP, -25% move speed",
    rarity: "epic",
    apply(stats) {
      stats.armor += 3;
      stats.maxHp += 5;
      stats.speed *= 0.75;
    },
  },

  // ── Legendary ───────────────────────────────────────
  {
    id: "magnetize",
    name: "Magnetize",
    description: "Collect ALL orbs on the map instantly",
    rarity: "legendary",
    apply(_stats, _heal) {
      // Handled specially in game.ts via onSpecial callback
    },
  },
];

/**
 * Weighted random selection respecting rarity.
 * Higher-rarity upgrades are less likely to appear.
 * Returns `count` unique upgrades.
 */
export function getRandomUpgrades(count: number): Upgrade[] {
  const pool = [...ALL_UPGRADES];
  const picked: Upgrade[] = [];

  while (picked.length < count && pool.length > 0) {
    const totalWeight = pool.reduce(
      (sum, u) => sum + RARITY_WEIGHTS[u.rarity],
      0,
    );
    let roll = Math.random() * totalWeight;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) {
      roll -= RARITY_WEIGHTS[pool[i].rarity];
      if (roll <= 0) {
        idx = i;
        break;
      }
    }
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return picked;
}
