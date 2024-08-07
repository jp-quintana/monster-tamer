import { WORLD_ASSET_KEYS } from '../assets/asset-keys';
import { SCENE_KEYS } from './scene-keys';

export class WorldScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
    });
  }

  create() {
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);
  }
}
