import { Graphics, Text, TextStyle } from "pixi.js";
import type { Container } from "pixi.js";
import type { RunStats } from "../core/runStats";
import { COLORS, OVERLAY, HUD } from '../constants';

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
    bg.rect(0, 0, screenW(), screenH()).fill({ color: COLORS.BACKDROP, alpha: OVERLAY.PAUSE_ALPHA });
    this.add(bg);

    this.addText("PAUSED", COLORS.TITLE_GOLD, OVERLAY.PAUSE_FONT_SIZE, screenW() / 2, screenH() / 2 - 40, true);
    this.addText(
      "[SPACE] Resume   [R] Restart",
      COLORS.TEXT_SECONDARY,
      OVERLAY.HINT_FONT_SIZE,
      screenW() / 2,
      screenH() / 2 + 30,
      true,
    );
  }

  public showGameOver(elapsedSeconds: number, level: number, stats: RunStats): void {
    this.hide();

    const bg = new Graphics();
    bg.rect(0, 0, screenW(), screenH()).fill({ color: COLORS.BACKDROP, alpha: OVERLAY.GAME_OVER_ALPHA });
    this.add(bg);

    const cx = screenW() / 2;
    let y = screenH() / 2 - 140;

    this.addText("GAME OVER", COLORS.GAME_OVER_RED, OVERLAY.GAME_OVER_FONT_SIZE, cx, y, true);
    y += 70;

    this.addText(
      `Survived  ${fmt(elapsedSeconds)}   Level ${level}`,
      COLORS.TEXT_LIGHT,
      OVERLAY.STATS_FONT_SIZE,
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
      this.addText(line, COLORS.TEXT_SECONDARY, OVERLAY.DETAILS_FONT_SIZE, cx, y, true);
      y += 26;
    }

    if (stats.upgradesChosen.length > 0) {
      y += 6;
      this.addText(
        `Upgrades: ${stats.upgradesChosen.join(", ")}`,
        COLORS.XP_BAR,
        OVERLAY.UPGRADE_LIST_FONT_SIZE,
        cx,
        y,
        true,
      );
      y += 30;
    } else {
      y += 10;
    }

    this.addText("[R] Play Again", COLORS.TEXT_SECONDARY, OVERLAY.HINT_FONT_SIZE, cx, y, true);
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
        fontFamily: HUD.FONT_FAMILY,
        fontWeight: size >= 40 ? "bold" : "normal",
      }),
    });
    if (centered) t.anchor.set(0.5);
    t.x = x;
    t.y = y;
    this.add(t);
  }
}
