import type { PlayerStats } from "../core/playerStats";

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  apply(stats: PlayerStats, heal: (amount: number) => void): void;
}

export const ALL_UPGRADES: Upgrade[] = [
  {
    id: "speed",
    name: "Swift Feet",
    description: "+25% movement speed",
    apply(stats) {
      stats.speed *= 1.25;
    },
  },
  {
    id: "damage",
    name: "Sharp Edge",
    description: "+1 damage per projectile",
    apply(stats) {
      stats.damage += 1;
    },
  },
  {
    id: "attack_speed",
    name: "Rapid Fire",
    description: "-20% time between attacks",
    apply(stats) {
      stats.attackInterval = Math.max(150, stats.attackInterval * 0.8);
    },
  },
  {
    id: "multishot",
    name: "Multishot",
    description: "+1 projectile per attack",
    apply(stats) {
      stats.projectileCount += 1;
    },
  },
  {
    id: "max_hp",
    name: "Vitality",
    description: "+3 max HP, restore 3 HP",
    apply(stats, heal) {
      stats.maxHp += 3;
      heal(3);
    },
  },
  {
    id: "projectile_speed",
    name: "Swift Shot",
    description: "+30% projectile speed",
    apply(stats) {
      stats.projectileSpeed *= 1.3;
    },
  },
  {
    id: "armor",
    name: "Iron Hide",
    description: "+1 armor (reduce damage taken)",
    apply(stats) {
      stats.armor += 1;
    },
  },
  {
    id: "regen",
    name: "Regeneration",
    description: "Recover 1 HP every 4 seconds",
    apply(stats) {
      stats.regenRate += 0.25;
    },
  },
  {
    id: "overcharge",
    name: "Overcharge",
    description: "+2 damage, -15% attack speed",
    apply(stats) {
      stats.damage += 2;
      stats.attackInterval = Math.min(3000, stats.attackInterval * 1.15);
    },
  },
  {
    id: "blitz",
    name: "Blitz",
    description: "+15% move speed, -10% attack interval",
    apply(stats) {
      stats.speed *= 1.15;
      stats.attackInterval = Math.max(150, stats.attackInterval * 0.9);
    },
  },
];

export function getRandomUpgrades(count: number): Upgrade[] {
  return [...ALL_UPGRADES].sort(() => Math.random() - 0.5).slice(0, count);
}
