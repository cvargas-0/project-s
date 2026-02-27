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
    color: 0xf97316,
    duration: 15_000,
    apply: (s) => { s.spawnRateMultiplier = 2; },
    revert: (s) => { s.spawnRateMultiplier = 1; },
  },
  {
    name: "Berserker!",
    color: 0xef4444,
    duration: 10_000,
    apply: (s) => { s.damageMultiplier = 2; },
    revert: (s) => { s.damageMultiplier = 1; },
  },
  {
    name: "Frost",
    color: 0x38bdf8,
    duration: 12_000,
    apply: (s) => { s.enemySpeedMultiplier = 0.5; },
    revert: (s) => { s.enemySpeedMultiplier = 1; },
  },
  {
    name: "Blood Moon",
    color: 0xdc2626,
    duration: 20_000,
    apply: (s) => { s.enemyHpMultiplier = 2; s.xpMultiplier = 2; },
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
    this.cooldown = 60_000 + Math.random() * 30_000;
  }

  update(deltaMs: number): void {
    if (this.activeEvent) {
      this.activeTimer += deltaMs;
      if (this.activeTimer >= this.activeEvent.duration) {
        this.activeEvent.revert(this);
        this.activeEvent = null;
        this.onEnd?.();
        this.cooldown = 60_000 + Math.random() * 30_000;
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
    this.cooldown = 60_000 + Math.random() * 30_000;
    this.activeTimer = 0;
    this.lastIndex = -1;
  }
}
