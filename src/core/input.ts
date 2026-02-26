export class Input {
  private keys: Record<string, boolean> = {};

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  public isDown(key: string): boolean {
    return !!this.keys[key];
  }
}
