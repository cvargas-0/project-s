import { Graphics, Text, TextStyle } from "pixi.js";
import type { Container } from "pixi.js";
import { RARITY_COLORS, type Upgrade } from "../data/upgrades";

const CARD_W = 240;
const CARD_H = 170;
const GAP = 32;

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
      color: 0x000000,
      alpha: 0.75,
    });
    this.container.addChild(bg);
    this.elements.push(bg);

    // Title
    const title = new Text({
      text: `LEVEL ${level}!`,
      style: new TextStyle({
        fill: 0xfbbf24,
        fontSize: 40,
        fontFamily: "monospace",
        fontWeight: "bold",
      }),
    });
    title.anchor.set(0.5);
    title.x = window.innerWidth / 2;
    title.y = 190;
    this.container.addChild(title);
    this.elements.push(title);

    const sub = new Text({
      text: "Choose an upgrade",
      style: new TextStyle({
        fill: 0xdde1e7,
        fontSize: 18,
        fontFamily: "monospace",
      }),
    });
    sub.anchor.set(0.5);
    sub.x = window.innerWidth / 2;
    sub.y = 245;
    this.container.addChild(sub);
    this.elements.push(sub);

    // Cards
    const totalW = CARD_W * upgrades.length + GAP * (upgrades.length - 1);
    const startX = (window.innerWidth - totalW) / 2;
    const cardY = 300;

    upgrades.forEach((upgrade, i) => {
      const x = startX + i * (CARD_W + GAP);
      this.buildCard(upgrade, i + 1, x, cardY);
    });

    // Hint
    const hint = new Text({
      text: "Click or press [1] [2] [3]",
      style: new TextStyle({
        fill: 0x475569,
        fontSize: 13,
        fontFamily: "monospace",
      }),
    });
    hint.anchor.set(0.5);
    hint.x = window.innerWidth / 2;
    hint.y = cardY + CARD_H + 30;
    this.container.addChild(hint);
    this.elements.push(hint);
  }

  private buildCard(upgrade: Upgrade, num: number, x: number, y: number): void {
    const rarityColor = RARITY_COLORS[upgrade.rarity];
    const card = new Graphics();
    const drawCard = (hover: boolean) => {
      card.clear();
      card
        .roundRect(x, y, CARD_W, CARD_H, 12)
        .fill({ color: hover ? 0x2d3f5e : 0x1e293b });
      card
        .roundRect(x, y, CARD_W, CARD_H, 12)
        .stroke({ color: hover ? 0xffffff : rarityColor, width: 2 });
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
        fontFamily: "monospace",
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
        fontFamily: "monospace",
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
        fontFamily: "monospace",
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
        fill: 0xdde1e7,
        fontSize: 13,
        fontFamily: "monospace",
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
