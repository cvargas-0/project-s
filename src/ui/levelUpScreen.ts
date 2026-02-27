import { Graphics, Text, TextStyle } from "pixi.js";
import type { Container } from "pixi.js";
import { RARITY_COLORS, type Upgrade } from "../data/upgrades";
import { COLORS, LEVEL_UP_SCREEN, HUD } from '../constants';

const CARD_W = LEVEL_UP_SCREEN.CARD_WIDTH;
const CARD_H = LEVEL_UP_SCREEN.CARD_HEIGHT;
const GAP = LEVEL_UP_SCREEN.CARD_GAP;

const RARITY_LABELS: Record<string, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export class LevelUpScreen {
  private elements: (Graphics | Text)[] = [];
  private container: Container;
  private currentUpgrades: Upgrade[] = [];
  private onPick?: (upgrade: Upgrade) => void;

  constructor(container: Container) {
    this.container = container;
  }

  public show(
    level: number,
    upgrades: Upgrade[],
    onPick: (upgrade: Upgrade) => void,
  ): void {
    this.hide();
    this.currentUpgrades = upgrades;
    this.onPick = onPick;

    // Backdrop
    const bg = new Graphics();
    bg.rect(0, 0, window.innerWidth, window.innerHeight).fill({
      color: COLORS.BACKDROP,
      alpha: LEVEL_UP_SCREEN.BACKDROP_ALPHA,
    });
    this.container.addChild(bg);
    this.elements.push(bg);

    // Title
    const title = new Text({
      text: `LEVEL ${level}!`,
      style: new TextStyle({
        fill: COLORS.TITLE_GOLD,
        fontSize: LEVEL_UP_SCREEN.TITLE_FONT_SIZE,
        fontFamily: HUD.FONT_FAMILY,
        fontWeight: "bold",
      }),
    });
    title.anchor.set(0.5);
    title.x = window.innerWidth / 2;
    title.y = LEVEL_UP_SCREEN.TITLE_Y;
    this.container.addChild(title);
    this.elements.push(title);

    const sub = new Text({
      text: "Choose an upgrade",
      style: new TextStyle({
        fill: COLORS.TEXT_LIGHT,
        fontSize: LEVEL_UP_SCREEN.SUBTITLE_FONT_SIZE,
        fontFamily: HUD.FONT_FAMILY,
      }),
    });
    sub.anchor.set(0.5);
    sub.x = window.innerWidth / 2;
    sub.y = LEVEL_UP_SCREEN.SUBTITLE_Y;
    this.container.addChild(sub);
    this.elements.push(sub);

    // Cards
    const totalW = CARD_W * upgrades.length + GAP * (upgrades.length - 1);
    const startX = (window.innerWidth - totalW) / 2;
    const cardY = LEVEL_UP_SCREEN.CARD_Y;

    upgrades.forEach((upgrade, i) => {
      const x = startX + i * (CARD_W + GAP);
      this.buildCard(upgrade, i + 1, x, cardY);
    });

    // Hint
    const hint = new Text({
      text: "Click or press [1] [2] [3]",
      style: new TextStyle({
        fill: COLORS.TEXT_SUBTLE,
        fontSize: LEVEL_UP_SCREEN.HINT_FONT_SIZE,
        fontFamily: HUD.FONT_FAMILY,
      }),
    });
    hint.anchor.set(0.5);
    hint.x = window.innerWidth / 2;
    hint.y = cardY + CARD_H + LEVEL_UP_SCREEN.HINT_OFFSET_Y;
    this.container.addChild(hint);
    this.elements.push(hint);
  }

  private buildCard(upgrade: Upgrade, num: number, x: number, y: number): void {
    const rarityColor = RARITY_COLORS[upgrade.rarity];
    const card = new Graphics();
    const drawCard = (hover: boolean) => {
      card.clear();
      card
        .roundRect(x, y, CARD_W, CARD_H, LEVEL_UP_SCREEN.CARD_CORNER_RADIUS)
        .fill({ color: hover ? COLORS.CARD_BG_HOVER : COLORS.CARD_BG });
      card
        .roundRect(x, y, CARD_W, CARD_H, LEVEL_UP_SCREEN.CARD_CORNER_RADIUS)
        .stroke({ color: hover ? COLORS.CARD_BORDER_HOVER : rarityColor, width: LEVEL_UP_SCREEN.CARD_BORDER_WIDTH });
    };

    drawCard(false);
    card.interactive = true;
    card.cursor = "pointer";
    card.on("pointerover", () => drawCard(true));
    card.on("pointerout", () => drawCard(false));
    card.on("pointerdown", () => this.onPick?.(upgrade));
    this.container.addChild(card);
    this.elements.push(card);

    // Number badge
    const badge = new Text({
      text: `[${num}]`,
      style: new TextStyle({
        fill: rarityColor,
        fontSize: 12,
        fontFamily: HUD.FONT_FAMILY,
      }),
    });
    badge.x = x + 10;
    badge.y = y + 8;
    this.container.addChild(badge);
    this.elements.push(badge);

    // Rarity label (top-right)
    const rarityLabel = new Text({
      text: RARITY_LABELS[upgrade.rarity] ?? upgrade.rarity,
      style: new TextStyle({
        fill: rarityColor,
        fontSize: 11,
        fontFamily: HUD.FONT_FAMILY,
        fontWeight: "bold",
      }),
    });
    rarityLabel.anchor.set(1, 0);
    rarityLabel.x = x + CARD_W - 10;
    rarityLabel.y = y + 8;
    this.container.addChild(rarityLabel);
    this.elements.push(rarityLabel);

    // Name
    const name = new Text({
      text: upgrade.name,
      style: new TextStyle({
        fill: rarityColor,
        fontSize: 20,
        fontFamily: HUD.FONT_FAMILY,
        fontWeight: "bold",
      }),
    });
    name.anchor.set(0.5, 0);
    name.x = x + CARD_W / 2;
    name.y = y + 28;
    this.container.addChild(name);
    this.elements.push(name);

    // Description
    const desc = new Text({
      text: upgrade.description,
      style: new TextStyle({
        fill: COLORS.TEXT_LIGHT,
        fontSize: 13,
        fontFamily: HUD.FONT_FAMILY,
        wordWrap: true,
        wordWrapWidth: CARD_W - 24,
      }),
    });
    desc.anchor.set(0.5, 0);
    desc.x = x + CARD_W / 2;
    desc.y = y + 62;
    this.container.addChild(desc);
    this.elements.push(desc);
  }

  /** Handle keyboard shortcut: key = 0-based index */
  public pickByIndex(index: number): void {
    if (index >= 0 && index < this.currentUpgrades.length) {
      this.onPick?.(this.currentUpgrades[index]);
    }
  }

  public hide(): void {
    for (const el of this.elements) el.destroy();
    this.elements = [];
    this.currentUpgrades = [];
    this.onPick = undefined;
  }
}
