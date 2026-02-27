import { Graphics, Text, TextStyle } from "pixi.js";
import type { Container } from "pixi.js";
import type { Player } from "../entities/player";
import type { XpSystem } from "../system/xp";
import { COLORS, HUD } from '../constants';

const BAR_W = HUD.BAR_WIDTH;
const BAR_H = HUD.BAR_HEIGHT;
const PAD = HUD.PADDING;
const STYLE = new TextStyle({
  fill: COLORS.TEXT_PRIMARY,
  fontSize: HUD.FONT_SIZE,
  fontFamily: HUD.FONT_FAMILY,
});
const TIMER_STYLE = new TextStyle({
  fill: COLORS.TEXT_SECONDARY,
  fontSize: HUD.TIMER_FONT_SIZE,
  fontFamily: HUD.FONT_FAMILY,
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
    this.hpBg.clear().rect(PAD, hpY, BAR_W, BAR_H).fill({ color: COLORS.UI_BG });
    const hpRatio = Math.max(0, hp / maxHp);
    this.hpFill.clear();
    if (hpRatio > 0) {
      this.hpFill
        .rect(PAD, hpY, BAR_W * hpRatio, BAR_H)
        .fill({ color: COLORS.HP_BAR });
    }
    this.hpText.text = `${hp}/${maxHp} HP`;
    this.hpText.x = PAD + BAR_W + 8;
    this.hpText.y = hpY;

    // XP bar
    this.xpBg.clear().rect(PAD, xpY, BAR_W, BAR_H).fill({ color: COLORS.UI_BG });
    const xpRatio = xp.xpToNext > 0 ? Math.min(1, xp.xp / xp.xpToNext) : 0;
    this.xpFill.clear();
    if (xpRatio > 0) {
      this.xpFill
        .rect(PAD, xpY, BAR_W * xpRatio, BAR_H)
        .fill({ color: COLORS.XP_BAR });
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
        // Full opacity first, then fade out
        this.banner.alpha = progress < HUD.BANNER_FADE_THRESHOLD
          ? 1
          : 1 - (progress - HUD.BANNER_FADE_THRESHOLD) / (1 - HUD.BANNER_FADE_THRESHOLD);
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
        fontFamily: HUD.FONT_FAMILY,
        fontWeight: "bold",
        stroke: { color: COLORS.BACKDROP, width: 4 },
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
