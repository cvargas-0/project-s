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

  public async start() {
    this.app = new Application();

    await this.app.init({
      width: 1280,
      height: 720,
      backgroundColor: 0x0f172a,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
    });

    document.body.appendChild(this.app.canvas);

    this.setup();

    createLoop(this.app, (delta) => {
      const deltaMs = this.app.ticker.deltaMS;
      this.handleGlobalInput();

      // Screen shake runs even while paused so it can finish naturally
      this.screenShake.update(deltaMs);

      if (this.state !== State.RUNNING) return;

      this.difficulty.update(deltaMs);
      this.player.update(delta);
      this.enemySystem.update(deltaMs);
      this.combatSystem.update(delta, deltaMs);
      this.particles.update(deltaMs);

      if (this.xpSystem.update(delta, this.player)) {
        this.triggerLevelUp();
      }

      this.hud.update(this.player, this.xpSystem, this.difficulty.elapsedSeconds);

      if (!this.player.isAlive()) {
        this.state = State.GAME_OVER;
        this.overlay.showGameOver(this.difficulty.elapsedSeconds, this.xpSystem.level);
      }
    });
  }

  private setup(): void {
    this.stats = createStats();
    this.difficulty = new DifficultySystem();

    // World container: all game entities live here so shaking is isolated from HUD
    this.world = new Container();
    this.app.stage.addChild(this.world);

    this.player = new Player(640, 360, this.stats);
    this.world.addChild(this.player.sprite);

    this.xpSystem = new XpSystem(this.world);
    this.particles = new ParticleSystem(this.world);
    this.screenShake = new ScreenShake(this.world);

    this.enemySystem = new EnemySystem(
      this.world,
      this.player,
      this.difficulty,
      (x, y, xp, isBoss) => {
        this.xpSystem.spawnOrb(x, y, xp);
        this.particles.burst(x, y, isBoss ? 0xf97316 : 0xef4444, isBoss ? 20 : 10);
        if (isBoss) this.screenShake.trigger(10, 500);
      },
      () => this.screenShake.trigger(5, 300),
    );

    this.combatSystem = new CombatSystem(
      this.world,
      this.player,
      this.stats,
      () => this.enemySystem.getEnemies(),
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
    this.overlay.hide();
    this.levelUpScreen.hide();
    this.hud.destroy();
    this.app.stage.removeChildren();
    this.setup();
    this.state = State.RUNNING;
  }
}
