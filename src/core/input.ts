export class Input {
  private keys: Record<string, boolean> = {};
  private justPressed: Record<string, boolean> = {};

  constructor() {
    window.addEventListener("keydown", (e) => {
      if (!this.justPressed[e.code]) {
        this.justPressed[e.code] = true;
      }
      this.keys[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  public isDown(key: string): boolean {
    return !!this.keys[key];
  }

  public wasPressed(key: string): boolean {
    if (this.justPressed[key]) {
      this.justPressed[key] = false;
      return true;
    }
    return false;
  }
}
