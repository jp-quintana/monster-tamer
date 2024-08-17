import { SCENE_KEYS } from './scene-keys';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.TITLE_SCENE,
    });
  }
}
