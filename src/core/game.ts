import { Application } from "pixi.js";
import { Player } from "../entities/player";
import { createLoop } from "./loop";

export class Game {
  private app!: Application;
  private player!: Player;

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
    this.app.stage.addChild(this.player.sprite);

    createLoop(this.app, (delta) => {
      this.player.update(delta);
    });
  }
}
