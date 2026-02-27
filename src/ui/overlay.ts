import { Graphics, Text, TextStyle } from "pixi.js";
import type { Container } from "pixi.js";

const W = 1280;
const H = 720;

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export class StateOverlay {
  private elements: (Graphics | Text)[] = [];
  private container: Container;

  constructor(container: Container) {
    this.container = container;
  }

  public showPaused(): void {
    this.hide();

    const bg = new Graphics();
    bg.rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.5 });
    this.add(bg);

    this.addText("PAUSED", 0xfbbf24, 56, W / 2, H / 2 - 40, true);
    this.addText(
      "[SPACE] Resume   [R] Restart",
      0x94a3b8,
      16,
      W / 2,
      H / 2 + 30,
      true,
    );
  }

  public showGameOver(elapsedSeconds: number, level: number): void {
    this.hide();

    const bg = new Graphics();
    bg.rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.7 });
    this.add(bg);

    this.addText("GAME OVER", 0xf43f5e, 60, W / 2, H / 2 - 80, true);
    this.addText(
      `Survived  ${fmt(elapsedSeconds)}   Level ${level}`,
      0xdde1e7,
      20,
      W / 2,
      H / 2,
      true,
    );
    this.addText("[R] Play Again", 0x94a3b8, 16, W / 2, H / 2 + 50, true);
  }

  public hide(): void {
    for (const el of this.elements) el.destroy();
    this.elements = [];
  }

  private add(el: Graphics | Text): void {
    this.elements.push(el);
    this.container.addChild(el);
  }

  private addText(
    text: string,
    color: number,
    size: number,
    x: number,
    y: number,
    centered: boolean,
  ): void {
    const t = new Text({
      text,
      style: new TextStyle({
        fill: color,
        fontSize: size,
        fontFamily: "monospace",
        fontWeight: size >= 40 ? "bold" : "normal",
      }),
    });
    if (centered) t.anchor.set(0.5);
    t.x = x;
    t.y = y;
    this.add(t);
  }
}
