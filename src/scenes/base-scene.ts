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
    if (data) {
      this.log(
        `[${
          this.constructor.name
        }:init] invoked, data provided: ${JSON.stringify(data)}`
      );

      return;
    }
    this.log(`[${this.constructor.name}:init] invoked`);
  }

  preload() {
    this.log(`[${this.constructor.name}:preload] invoked`);
  }

  create() {
    this.log(`[${this.constructor.name}:create] invoked`);

    this.controls = new Controls(this);

    this.events.on(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.handleSceneCleanup,
      this
    );

    this.scene.bringToTop();
  }

  update(time: DOMHighResTimeStamp) {}

  protected log(message: string) {
    console.log(
      `%c${message}`,
      'color: orange; background: black; padding: 3px; font-weight: bold'
    );
  }

  handleSceneResume(sys: Phaser.Scenes.Systems, data: any) {
    this.controls.lockInput = false;
    if (data) {
      this.log(
        `[${
          this.constructor.name
        }:handleSceneResume] invoked, data provided: ${JSON.stringify(data)}`
      );
      return;
    }
    this.log(`[${this.constructor.name}:handleSceneResume] invoked`);
  }

  handleSceneCleanup() {
    this.log(`[${this.constructor.name}:handleSceneCleanup] invoked`);
    this.events.off(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
  }
}
