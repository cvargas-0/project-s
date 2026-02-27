import { Application, Container } from "pixi.js";
import { Player } from "../entities/player";
import { createLoop } from "./loop";
import { EnemySystem } from "../system/enemy";
import { CombatSystem } from "../system/combat";
import { XpSystem } from "../system/xp";
import { DifficultySystem } from "../system/difficulty";
import { ParticleSystem } from "../system/particles";
import { ScreenShake } from "./screenShake";
import { State } from "./state";
import { Input } from "./input";
import { createStats, type PlayerStats } from "./playerStats";
import { getRandomUpgrades } from "../data/upgrades";
import { Hud } from "../ui/hud";
import { LevelUpScreen } from "../ui/levelUpScreen";
import { StateOverlay } from "../ui/overlay";
import { createRunStats, type RunStats } from "./runStats";
import { EventSystem } from "../system/events";
import { Camera } from "./camera";

const WORLD_W = 3000;
const WORLD_H = 3000;

export class Game {
  private app!: Application;

  private state: State = State.RUNNING;
  private input: Input = new Input();

  // World container — only this shakes, HUD/UI stay on stage
  private world!: Container;

  private player!: Player;
  private stats!: PlayerStats;
  private enemySystem!: EnemySystem;
  private combatSystem!: CombatSystem;
  private xpSystem!: XpSystem;
  private difficulty!: DifficultySystem;
  private particles!: ParticleSystem;
  private screenShake!: ScreenShake;
  private hud!: Hud;
  private levelUpScreen!: LevelUpScreen;
  private overlay!: StateOverlay;
  private runStats!: RunStats;
  private events!: EventSystem;
  private camera!: Camera;

  public async start() {
    this.app = new Application();

    await this.app.init({
      backgroundColor: 0x0f172a,
      antialias: false,
      resizeTo: window,
    });

    document.body.appendChild(this.app.canvas);

    this.setup();

    createLoop(this.app, (delta) => {
      const deltaMs = this.app.ticker.deltaMS;
      this.handleGlobalInput();

      // Keep camera viewport synced with window size
      this.camera.viewportWidth = this.app.screen.width;
      this.camera.viewportHeight = this.app.screen.height;

      // Screen shake runs even while paused so it can finish naturally
      this.screenShake.update(deltaMs);
      // Camera + shake always applied so paused view stays correct
      this.camera.update(this.player.sprite.x, this.player.sprite.y);
      this.camera.applyTo(this.world, this.screenShake.offsetX, this.screenShake.offsetY);

      if (this.state !== State.RUNNING) return;

      this.events.update(deltaMs);
      this.difficulty.update(deltaMs);
      this.player.update(delta);

      // Feed camera viewport to enemy spawning
      this.enemySystem.camX = this.camera.x;
      this.enemySystem.camY = this.camera.y;
      this.enemySystem.viewW = this.app.screen.width;
      this.enemySystem.viewH = this.app.screen.height;
      this.enemySystem.update(deltaMs);

      this.combatSystem.update(delta, deltaMs);
      this.particles.update(deltaMs);

      if (this.xpSystem.update(delta, this.player)) {
        this.triggerLevelUp();
      }

      this.hud.update(
        this.player,
        this.xpSystem,
        this.difficulty.elapsedSeconds,
        this.app.screen.width,
        this.app.screen.height,
      );

      if (!this.player.isAlive()) {
        this.state = State.GAME_OVER;
        this.overlay.showGameOver(
          this.difficulty.elapsedSeconds,
          this.xpSystem.level,
          this.runStats,
        );
      }
    });
  }

  private setup(): void {
    this.stats = createStats();
    this.runStats = createRunStats();
    this.events = new EventSystem(
      (name, color, duration) => this.hud.showBanner(name, color, duration),
      () => this.hud.hideBanner(),
    );
    this.difficulty = new DifficultySystem(this.events, () => this.xpSystem?.level ?? 1);

    // World container: all game entities live here so camera + shake are applied to it
    this.world = new Container();
    this.app.stage.addChild(this.world);

    this.camera = new Camera(WORLD_W, WORLD_H);
    this.screenShake = new ScreenShake();

    this.player = new Player(WORLD_W / 2, WORLD_H / 2, this.stats, WORLD_W, WORLD_H);
    this.world.addChild(this.player.sprite);

    this.xpSystem = new XpSystem(this.world, this.stats, (amount) => {
      this.runStats.totalXpCollected += amount;
    });
    this.particles = new ParticleSystem(this.world);

    this.enemySystem = new EnemySystem(
      this.world,
      this.player,
      this.difficulty,
      (x, y, baseXp, isBoss) => {
        if (isBoss) this.runStats.bossesKilled++;
        else this.runStats.enemiesKilled++;

        const xp = Math.round(baseXp * this.events.xpMultiplier);
        const orbCount = isBoss
          ? this.difficulty.bossOrbCount
          : this.difficulty.enemyOrbCount;
        const xpPerOrb = Math.ceil(xp / orbCount);

        for (let i = 0; i < orbCount; i++) {
          const angle = (Math.PI * 2 * i) / orbCount;
          const spread = 8 + orbCount * 2;
          this.xpSystem.spawnOrb(
            x + Math.cos(angle) * spread,
            y + Math.sin(angle) * spread,
            xpPerOrb,
          );
        }

        this.particles.burst(
          x,
          y,
          isBoss ? 0xf97316 : 0xef4444,
          isBoss ? 20 : 10,
        );
        if (isBoss) this.screenShake.trigger(10, 500);
      },
      (dmg) => {
        this.runStats.totalDamageTaken += dmg;
        this.screenShake.trigger(5, 300);
      },
      (waveName) => this.hud.showBanner(waveName, 0xfbbf24, 3000),
    );

    this.combatSystem = new CombatSystem(
      this.world,
      this.player,
      this.stats,
      () => this.enemySystem.getEnemies(),
      (amount) => { this.runStats.totalDamageDealt += amount; },
      () => this.events.damageMultiplier,
    );

    // UI stays on stage — unaffected by world shake
    this.hud = new Hud(this.app.stage);
    this.levelUpScreen = new LevelUpScreen(this.app.stage);
    this.overlay = new StateOverlay(this.app.stage);
  }

  private triggerLevelUp(): void {
    this.state = State.LEVEL_UP;

    const upgrades = getRandomUpgrades(3);
    this.levelUpScreen.show(this.xpSystem.level, upgrades, (chosen) => {
      chosen.apply(this.stats, (amount) => this.player.heal(amount));
      if (chosen.id === "magnetize") this.xpSystem.collectAll();
      this.runStats.upgradesChosen.push(chosen.name);
      this.levelUpScreen.hide();
      this.state = State.RUNNING;
    });
  }

  private handleGlobalInput(): void {
    if (this.state === State.LEVEL_UP) {
      if (this.input.wasPressed("Digit1")) this.levelUpScreen.pickByIndex(0);
      if (this.input.wasPressed("Digit2")) this.levelUpScreen.pickByIndex(1);
      if (this.input.wasPressed("Digit3")) this.levelUpScreen.pickByIndex(2);
      return;
    }

    if (this.input.wasPressed("Space")) {
      if (this.state === State.RUNNING) {
        this.state = State.PAUSED;
        this.overlay.showPaused();
      } else if (this.state === State.PAUSED) {
        this.state = State.RUNNING;
        this.overlay.hide();
      }
    }

    if (this.input.wasPressed("KeyR")) {
      this.reset();
    }
  }

  private reset(): void {
    // Clean up pools and active sprites before tearing down containers
    this.events.reset();
    this.combatSystem.reset();
    this.enemySystem.reset();
    this.particles.reset();
    this.xpSystem.reset();

    this.overlay.hide();
    this.levelUpScreen.hide();
    this.hud.destroy();
    this.app.stage.removeChildren();
    this.setup();
    this.state = State.RUNNING;
  }
}
