export class Menu {
  private padding: number;
  private width: number;
  private height: number;
  private graphics: Phaser.GameObjects.Graphics;
  private container: Phaser.GameObjects.Container;
  #isVisible: boolean;

  constructor(private scene: Phaser.Scene) {
    this.padding = 4;
    this.width = 300;
    // TODO: calculate height based on currently available options
    this.height = 10 + this.padding * 2 + 50;
    this.graphics = this.createGraphics();
    this.container = this.scene.add.container(0, 0, [this.graphics]);
    this.#isVisible = false;
  }

  get isVisible() {
    return this.#isVisible;
  }

  show() {
    const { right, top } = this.scene.cameras.main.worldView;
    const startX = right - this.padding * 2 - this.width;
    const startY = top + this.padding * 2;

    this.container.setPosition(startX, startY);
    this.container.setAlpha(1);
    this.#isVisible = true;
  }

  hide() {
    this.container.setAlpha(0);
    this.#isVisible = false;
  }

  private createGraphics() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x32454c, 1);
    g.fillRect(1, 0, this.width - 1, this.height - 1);
    g.lineStyle(8, 0x6d9aa8, 1);
    g.strokeRect(0, 0, this.width, this.height);
    g.setAlpha(0.9);
    return g;
  }
}
