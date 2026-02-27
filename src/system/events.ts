import { COLORS, EVENTS } from '../constants';

interface GameEvent {
  name: string;
  color: number;
  duration: number;
  apply: (self: EventSystem) => void;
  revert: (self: EventSystem) => void;
}

const EVENT_POOL: GameEvent[] = [
  {
    name: "Swarm!",
    color: COLORS.EVENT_SWARM,
    duration: EVENTS.SWARM_DURATION,
    apply: (s) => { s.spawnRateMultiplier = EVENTS.SWARM_SPAWN_RATE; },
    revert: (s) => { s.spawnRateMultiplier = 1; },
  },
  {
    name: "Berserker!",
    color: COLORS.EVENT_BERSERKER,
    duration: EVENTS.BERSERKER_DURATION,
    apply: (s) => { s.damageMultiplier = EVENTS.BERSERKER_DAMAGE; },
    revert: (s) => { s.damageMultiplier = 1; },
  },
  {
    name: "Frost",
    color: COLORS.EVENT_FROST,
    duration: EVENTS.FROST_DURATION,
    apply: (s) => { s.enemySpeedMultiplier = EVENTS.FROST_SPEED_MULTIPLIER; },
    revert: (s) => { s.enemySpeedMultiplier = 1; },
  },
  {
    name: "Blood Moon",
    color: COLORS.EVENT_BLOOD_MOON,
    duration: EVENTS.BLOOD_MOON_DURATION,
    apply: (s) => { s.enemyHpMultiplier = EVENTS.BLOOD_MOON_HP_MULTIPLIER; s.xpMultiplier = EVENTS.BLOOD_MOON_XP_MULTIPLIER; },
    revert: (s) => { s.enemyHpMultiplier = 1; s.xpMultiplier = 1; },
  },
];

export class EventSystem {
  public spawnRateMultiplier = 1;
  public damageMultiplier = 1;
  public enemySpeedMultiplier = 1;
  public enemyHpMultiplier = 1;
  public xpMultiplier = 1;

  private cooldown: number;
  private activeEvent: GameEvent | null = null;
  private activeTimer = 0;
  private lastIndex = -1;

  private onStart?: (name: string, color: number, duration: number) => void;
  private onEnd?: () => void;

  constructor(
    onStart?: (name: string, color: number, duration: number) => void,
    onEnd?: () => void,
  ) {
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.cooldown = EVENTS.COOLDOWN_BASE + Math.random() * EVENTS.COOLDOWN_VARIANCE;
  }

  update(deltaMs: number): void {
    if (this.activeEvent) {
      this.activeTimer += deltaMs;
      if (this.activeTimer >= this.activeEvent.duration) {
        this.activeEvent.revert(this);
        this.activeEvent = null;
        this.onEnd?.();
        this.cooldown = EVENTS.COOLDOWN_BASE + Math.random() * EVENTS.COOLDOWN_VARIANCE;
      }
      return;
    }

    this.cooldown -= deltaMs;
    if (this.cooldown <= 0) {
      this.triggerRandom();
    }
  }

  private triggerRandom(): void {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * EVENT_POOL.length);
    } while (idx === this.lastIndex && EVENT_POOL.length > 1);
    this.lastIndex = idx;

    const event = EVENT_POOL[idx];
    this.activeEvent = event;
    this.activeTimer = 0;
    event.apply(this);
    this.onStart?.(event.name, event.color, event.duration);
  }

  public reset(): void {
    if (this.activeEvent) {
      this.activeEvent.revert(this);
      this.activeEvent = null;
    }
    this.cooldown = EVENTS.COOLDOWN_BASE + Math.random() * EVENTS.COOLDOWN_VARIANCE;
    this.activeTimer = 0;
    this.lastIndex = -1;
  }
}
