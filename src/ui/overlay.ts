import { Graphics, Text, TextStyle } from "pixi.js";
import type { Container } from "pixi.js";
import type { RunStats } from "../core/runStats";

function screenW(): number { return window.innerWidth; }
function screenH(): number { return window.innerHeight; }

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
    bg.rect(0, 0, screenW(), screenH()).fill({ color: 0x000000, alpha: 0.5 });
    this.add(bg);

    this.addText("PAUSED", 0xfbbf24, 56, screenW() / 2, screenH() / 2 - 40, true);
    this.addText(
      "[SPACE] Resume   [R] Restart",
      0x94a3b8,
      16,
      screenW() / 2,
      screenH() / 2 + 30,
      true,
    );
  }

  public showGameOver(elapsedSeconds: number, level: number, stats: RunStats): void {
    this.hide();

    const bg = new Graphics();
    bg.rect(0, 0, screenW(), screenH()).fill({ color: 0x000000, alpha: 0.7 });
    this.add(bg);

    const cx = screenW() / 2;
    let y = screenH() / 2 - 140;

    this.addText("GAME OVER", 0xf43f5e, 60, cx, y, true);
    y += 70;

    this.addText(
      `Survived  ${fmt(elapsedSeconds)}   Level ${level}`,
      0xdde1e7,
      20,
      cx,
      y,
      true,
    );
    y += 40;

    const lines = [
      `Enemies  ${stats.enemiesKilled}   Bosses  ${stats.bossesKilled}`,
      `Damage dealt  ${stats.totalDamageDealt}   Taken  ${stats.totalDamageTaken}`,
      `XP collected  ${stats.totalXpCollected}`,
    ];

    for (const line of lines) {
      this.addText(line, 0x94a3b8, 16, cx, y, true);
      y += 26;
    }

    if (stats.upgradesChosen.length > 0) {
      y += 6;
      this.addText(
        `Upgrades: ${stats.upgradesChosen.join(", ")}`,
        0xa78bfa,
        14,
        cx,
        y,
        true,
      );
      y += 30;
    } else {
      y += 10;
    }

    this.addText("[R] Play Again", 0x94a3b8, 16, cx, y, true);
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
