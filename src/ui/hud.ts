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
  private banner: Text | null = null;
  private bannerTimer = 0;
  private bannerDuration = 0;
  private container: Container;

  constructor(container: Container) {
    this.container = container;
    this.hpBg = new Graphics();
    this.hpFill = new Graphics();
    this.hpText = new Text({ text: "", style: STYLE });

    this.xpBg = new Graphics();
    this.xpFill = new Graphics();
    this.xpText = new Text({ text: "", style: STYLE });

    this.timerText = new Text({ text: "00:00", style: TIMER_STYLE });
    this.timerText.anchor.set(1, 0);
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

  public update(player: Player, xp: XpSystem, elapsedSeconds: number, screenW: number, screenH: number): void {
    const hp = player.getHp();
    const maxHp = player.getMaxHp();
    const hpY = PAD;
    const xpY = screenH - PAD - BAR_H;

    // Reposition dynamic elements
    this.timerText.x = screenW - PAD;

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

    // Fade banner over its duration
    if (this.banner && this.bannerDuration > 0) {
      this.bannerTimer += 16.666; // approximate frame ms
      const progress = this.bannerTimer / this.bannerDuration;
      if (progress >= 1) {
        this.hideBanner();
      } else {
        // Full opacity first 70%, then fade out
        this.banner.alpha = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
      }
    }
  }

  public showBanner(name: string, color: number, duration: number): void {
    this.hideBanner();
    this.banner = new Text({
      text: name,
      style: new TextStyle({
        fill: color,
        fontSize: 32,
        fontFamily: "monospace",
        fontWeight: "bold",
        stroke: { color: 0x000000, width: 4 },
      }),
    });
    this.banner.anchor.set(0.5);
    this.banner.x = window.innerWidth / 2;
    this.banner.y = 80;
    this.bannerTimer = 0;
    this.bannerDuration = duration;
    this.container.addChild(this.banner);
  }

  public hideBanner(): void {
    if (this.banner) {
      this.banner.destroy();
      this.banner = null;
    }
  }

  public destroy(): void {
    this.hideBanner();
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
