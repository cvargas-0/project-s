import { Application } from "pixi.js";
import { Player } from "../entities/player";
import { createLoop } from "./loop";
import { EnemySystem } from "../system/enemy";
import { CombatSystem } from "../system/combat";

export class Game {
  private app!: Application;
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

      this.player.update(delta);
      this.enemySystem.update(deltaMs);
      this.combatSystem.update(delta, deltaMs);
    });
  }
}
