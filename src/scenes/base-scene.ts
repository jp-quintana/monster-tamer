import { Controls } from '../utils/controls';
import { SCENE_KEYS } from './scene-keys';

interface Config {
  key: SCENE_KEYS;
}

export abstract class BaseScene extends Phaser.Scene {
  protected controls: Controls;
  constructor(config: Config) {
    super({
      key: config.key,
    });
  }

  init(data?: any) {
    this.log(`[${this.constructor.name}:init] invoked`);
  }

  preload() {
    this.log(`[${this.constructor.name}:preload] invoked`);
  }

  create() {
    this.log(`[${this.constructor.name}:create] invoked`);

    this.controls = new Controls(this);
  }

  update(time: DOMHighResTimeStamp) {}

  protected log(message: string) {
    console.log(
      `%c${message}`,
      'color: orange; background: black; padding: 3px; font-weight: bold'
    );
  }
}
