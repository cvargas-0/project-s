import { Graphics, Text, TextStyle } from "pixi.js";
import type { Container } from "pixi.js";
import type { Player } from "../entities/player";
import type { XpSystem } from "../system/xp";

const BAR_W = 200;
const BAR_H = 16;
const PAD = 16;
const STYLE = new TextStyle({
  fill: 0xffffff,
  fontSize: 13,
  fontFamily: "monospace",
});
const TIMER_STYLE = new TextStyle({
  fill: 0x94a3b8,
  fontSize: 18,
  fontFamily: "monospace",
});

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export class Hud {
  private hpBg: Graphics;
  private hpFill: Graphics;
  private hpText: Text;

  private xpBg: Graphics;
  private xpFill: Graphics;
  private xpText: Text;

  private timerText: Text;

  constructor(container: Container) {
    this.hpBg = new Graphics();
    this.hpFill = new Graphics();
    this.hpText = new Text({ text: "", style: STYLE });

    this.xpBg = new Graphics();
    this.xpFill = new Graphics();
    this.xpText = new Text({ text: "", style: STYLE });

    this.timerText = new Text({ text: "00:00", style: TIMER_STYLE });
    this.timerText.anchor.set(1, 0); // right-align
    this.timerText.x = 1280 - PAD;
    this.timerText.y = PAD;

    for (const el of [
      this.hpBg,
      this.hpFill,
      this.hpText,
      this.xpBg,
      this.xpFill,
      this.xpText,
      this.timerText,
    ]) {
      container.addChild(el);
    }
  }

  public update(player: Player, xp: XpSystem, elapsedSeconds: number): void {
    const hp = player.getHp();
    const maxHp = player.getMaxHp();
    const hpY = PAD;
    const xpY = 720 - PAD - BAR_H;

    // HP bar
    this.hpBg.clear().rect(PAD, hpY, BAR_W, BAR_H).fill({ color: 0x1e293b });
    const hpRatio = Math.max(0, hp / maxHp);
    this.hpFill.clear();
    if (hpRatio > 0) {
      this.hpFill
        .rect(PAD, hpY, BAR_W * hpRatio, BAR_H)
        .fill({ color: 0xf43f5e });
    }
    this.hpText.text = `${hp}/${maxHp} HP`;
    this.hpText.x = PAD + BAR_W + 8;
    this.hpText.y = hpY;

    // XP bar
    this.xpBg.clear().rect(PAD, xpY, BAR_W, BAR_H).fill({ color: 0x1e293b });
    const xpRatio = xp.xpToNext > 0 ? Math.min(1, xp.xp / xp.xpToNext) : 0;
    this.xpFill.clear();
    if (xpRatio > 0) {
      this.xpFill
        .rect(PAD, xpY, BAR_W * xpRatio, BAR_H)
        .fill({ color: 0xa78bfa });
    }
    this.xpText.text = `Lv ${xp.level}  ${xp.xp}/${xp.xpToNext} XP`;
    this.xpText.x = PAD + BAR_W + 8;
    this.xpText.y = xpY;

    // Timer (top-right)
    this.timerText.text = fmtTime(elapsedSeconds);
  }

  public destroy(): void {
    for (const el of [
      this.hpBg,
      this.hpFill,
      this.hpText,
      this.xpBg,
      this.xpFill,
      this.xpText,
      this.timerText,
    ]) {
      el.destroy();
    }
  }
}
