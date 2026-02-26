import { Application } from "pixi.js";
import { Player } from "../entities/player";
import { createLoop } from "./loop";
import { EnemySystem } from "../system/enemy";
import { CombatSystem } from "../system/combat";
import { State } from "./state";
import { Input } from "./input";

export class Game {
  private app!: Application;

  private state: State = State.RUNNING;
  private input: Input = new Input();

  private player!: Player;

  private enemySystem!: EnemySystem;

  private combatSystem!: CombatSystem;

  public async start() {
    this.app = new Application();

    await this.app.init({
      width: 1280,
      height: 720,
      backgroundColor: 0x0f172a,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
    });

    await document.body.appendChild(this.app.canvas);

    this.player = new Player(640, 360);
    this.enemySystem = new EnemySystem(this.app.stage, this.player);

    this.combatSystem = new CombatSystem(this.app.stage, this.player, () =>
      this.enemySystem.getEnemies(),
    );

    this.app.stage.addChild(this.player.sprite);

    createLoop(this.app, (delta) => {
      const deltaMs = this.app.ticker.deltaMS;

      this.handleGlobalInput();

      if (this.state !== State.RUNNING) return;

      this.player.update(delta);
      this.enemySystem.update(deltaMs);
      this.combatSystem.update(delta, deltaMs);

      if (!this.player.isAlive()) {
        this.state = State.GAME_OVER;
        console.log("Game over");
      }
    });
  }

  private handleGlobalInput(): void {
    if (this.input.wasPressed("Space")) {
      if (this.state === State.RUNNING) {
        this.state = State.PAUSED;
        console.log("PAUSED");
      } else if (this.state === State.PAUSED) {
        this.state = State.RUNNING;
        console.log("RESUMED");
      }
    }

    if (this.input.wasPressed("KeyR")) {
      this.reset();
    }
  }

  private reset(): void {
    console.log("Reset");

    this.app.stage.removeChildren();

    this.player = new Player(640, 360);
    this.app.stage.addChild(this.player.sprite);

    this.enemySystem = new EnemySystem(this.app.stage, this.player);
    this.combatSystem = new CombatSystem(this.app.stage, this.player, () =>
      this.enemySystem.getEnemies(),
    );

    this.state = State.RUNNING;
  }
}
