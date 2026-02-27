import type { PlayerStats } from "../core/playerStats";
import {
  COLORS,
  RARITY_WEIGHTS as WEIGHTS,
  STAT_FLOORS,
  UP_SWIFT_FEET,
  UP_SHARP_EDGE,
  UP_RAPID_FIRE,
  UP_VITALITY,
  UP_IRON_HIDE,
  UP_REGENERATION,
  UP_MAGNETISM,
  UP_MULTISHOT,
  UP_SWIFT_SHOT,
  UP_BLITZ,
  UP_THICK_SKIN,
  UP_ADRENALINE,
  UP_HEAVY_ROUNDS,
  UP_SECOND_WIND,
  UP_OVERCHARGE,
  UP_GLASS_CANNON,
  UP_MAGNETAR,
  UP_BARRAGE,
  UP_FORTRESS,
  UP_ORBITAL_SHIELD,
} from '../constants';

export type Rarity = "common" | "rare" | "epic" | "legendary";

export const RARITY_COLORS: Record<Rarity, number> = {
  common: COLORS.RARITY_COMMON,
  rare: COLORS.RARITY_RARE,
  epic: COLORS.RARITY_EPIC,
  legendary: COLORS.RARITY_LEGENDARY,
};

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: WEIGHTS.COMMON,
  rare: WEIGHTS.RARE,
  epic: WEIGHTS.EPIC,
  legendary: WEIGHTS.LEGENDARY,
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
      stats.speed *= UP_SWIFT_FEET.SPEED_MULT;
    },
  },
  {
    id: "damage",
    name: "Sharp Edge",
    description: "+1 damage per projectile",
    rarity: "common",
    apply(stats) {
      stats.damage += UP_SHARP_EDGE.DAMAGE_ADD;
    },
  },
  {
    id: "attack_speed",
    name: "Rapid Fire",
    description: "-15% time between attacks",
    rarity: "common",
    apply(stats) {
      stats.attackInterval = Math.max(STAT_FLOORS.ATTACK_INTERVAL, stats.attackInterval * UP_RAPID_FIRE.INTERVAL_MULT);
    },
  },
  {
    id: "max_hp",
    name: "Vitality",
    description: "+3 max HP, restore 3 HP",
    rarity: "common",
    apply(stats, heal) {
      stats.maxHp += UP_VITALITY.MAX_HP_ADD;
      heal(UP_VITALITY.HEAL);
    },
  },
  {
    id: "armor",
    name: "Iron Hide",
    description: "+1 armor (reduce damage taken)",
    rarity: "common",
    apply(stats) {
      stats.armor += UP_IRON_HIDE.ARMOR_ADD;
    },
  },
  {
    id: "regen",
    name: "Regeneration",
    description: "Recover 1 HP every 4 seconds",
    rarity: "common",
    apply(stats) {
      stats.regenRate += UP_REGENERATION.REGEN_ADD;
    },
  },
  {
    id: "magnet",
    name: "Magnetism",
    description: "+40% orb attract range",
    rarity: "common",
    apply(stats) {
      stats.attractRange *= UP_MAGNETISM.ATTRACT_MULT;
    },
  },

  // ── Rare ────────────────────────────────────────────
  {
    id: "multishot",
    name: "Multishot",
    description: "+1 projectile per attack",
    rarity: "rare",
    apply(stats) {
      stats.projectileCount += UP_MULTISHOT.PROJECTILE_ADD;
    },
  },
  {
    id: "projectile_speed",
    name: "Swift Shot",
    description: "+30% projectile speed",
    rarity: "rare",
    apply(stats) {
      stats.projectileSpeed *= UP_SWIFT_SHOT.PROJ_SPEED_MULT;
    },
  },
  {
    id: "blitz",
    name: "Blitz",
    description: "+15% move speed, -10% attack interval",
    rarity: "rare",
    apply(stats) {
      stats.speed *= UP_BLITZ.SPEED_MULT;
      stats.attackInterval = Math.max(STAT_FLOORS.ATTACK_INTERVAL, stats.attackInterval * UP_BLITZ.INTERVAL_MULT);
    },
  },
  {
    id: "thick_skin",
    name: "Thick Skin",
    description: "+2 armor, -10% move speed",
    rarity: "rare",
    apply(stats) {
      stats.armor += UP_THICK_SKIN.ARMOR_ADD;
      stats.speed *= UP_THICK_SKIN.SPEED_MULT;
    },
  },
  {
    id: "adrenaline",
    name: "Adrenaline",
    description: "-25% attack interval, -2 max HP",
    rarity: "rare",
    apply(stats) {
      stats.attackInterval = Math.max(STAT_FLOORS.ATTACK_INTERVAL, stats.attackInterval * UP_ADRENALINE.INTERVAL_MULT);
      stats.maxHp = Math.max(STAT_FLOORS.HP, stats.maxHp - UP_ADRENALINE.MAX_HP_SUB);
    },
  },
  {
    id: "heavy_rounds",
    name: "Heavy Rounds",
    description: "+2 damage, -20% projectile speed",
    rarity: "rare",
    apply(stats) {
      stats.damage += UP_HEAVY_ROUNDS.DAMAGE_ADD;
      stats.projectileSpeed *= UP_HEAVY_ROUNDS.PROJ_SPEED_MULT;
    },
  },
  {
    id: "second_wind",
    name: "Second Wind",
    description: "+0.5 HP/s regen, -1 armor",
    rarity: "rare",
    apply(stats) {
      stats.regenRate += UP_SECOND_WIND.REGEN_ADD;
      stats.armor = Math.max(STAT_FLOORS.ARMOR, stats.armor - UP_SECOND_WIND.ARMOR_SUB);
    },
  },

  // ── Epic ────────────────────────────────────────────
  {
    id: "overcharge",
    name: "Overcharge",
    description: "+3 damage, +20% attack interval",
    rarity: "epic",
    apply(stats) {
      stats.damage += UP_OVERCHARGE.DAMAGE_ADD;
      stats.attackInterval *= UP_OVERCHARGE.INTERVAL_MULT;
    },
  },
  {
    id: "glass_cannon",
    name: "Glass Cannon",
    description: "+4 damage, -4 max HP",
    rarity: "epic",
    apply(stats) {
      stats.damage += UP_GLASS_CANNON.DAMAGE_ADD;
      stats.maxHp = Math.max(STAT_FLOORS.HP, stats.maxHp - UP_GLASS_CANNON.MAX_HP_SUB);
    },
  },
  {
    id: "magnetar",
    name: "Magnetar",
    description: "+100% orb range, -15% move speed",
    rarity: "epic",
    apply(stats) {
      stats.attractRange *= UP_MAGNETAR.ATTRACT_MULT;
      stats.speed *= UP_MAGNETAR.SPEED_MULT;
    },
  },
  {
    id: "barrage",
    name: "Barrage",
    description: "+2 projectiles, -30% projectile speed",
    rarity: "epic",
    apply(stats) {
      stats.projectileCount += UP_BARRAGE.PROJECTILE_ADD;
      stats.projectileSpeed *= UP_BARRAGE.PROJ_SPEED_MULT;
    },
  },
  {
    id: "fortress",
    name: "Fortress",
    description: "+3 armor, +5 max HP, -25% move speed",
    rarity: "epic",
    apply(stats) {
      stats.armor += UP_FORTRESS.ARMOR_ADD;
      stats.maxHp += UP_FORTRESS.MAX_HP_ADD;
      stats.speed *= UP_FORTRESS.SPEED_MULT;
    },
  },

  {
    id: "piercing_shot",
    name: "Piercing Shot",
    description: "+1 pierce (projectiles pass through enemies)",
    rarity: "epic",
    apply(stats) {
      stats.piercingCount += 1;
    },
  },
  {
    id: "homing_missiles",
    name: "Homing Missiles",
    description: "Projectiles curve toward nearby enemies",
    rarity: "epic",
    apply(stats) {
      stats.homingEnabled = true;
    },
  },

  // ── Legendary ───────────────────────────────────────
  {
    id: "orbital_shield",
    name: "Orbital Shield",
    description: "+3 orbs rotate around you, damaging enemies",
    rarity: "legendary",
    apply(stats) {
      stats.orbitalCount += UP_ORBITAL_SHIELD.ORB_COUNT;
    },
  },
  {
    id: "nova_burst",
    name: "Nova Burst",
    description: "Periodic AoE explosion damages nearby enemies",
    rarity: "legendary",
    apply(stats) {
      stats.novaEnabled = true;
    },
  },
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
