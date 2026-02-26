import { Ticker, type Application } from "pixi.js";

/**
 * Create principal loop for the game
 * @param app - Pixi Application
 * @param update - Update function return frame delta
 */
export function createLoop(app: Application, update: (delta: number) => void) {
  const ticker = new Ticker();

  ticker.add((ticker) => {
    const delta = ticker.deltaTime;
    update(delta);
  });

  ticker.start();
}
