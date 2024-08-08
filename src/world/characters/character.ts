import { DIRECTION } from '../../common/direction';
import { TILE_SIZE } from '../../config';
import { Coordinate } from '../../types';
import { exhaustiveGuard } from '../../utils/guard';

export interface CharacterConfig {
  scene: Phaser.Scene;
  assetKey: string;
  assetFrame?: number;
  position: Coordinate;
}

export class Character {
  protected scene: Phaser.Scene;
  protected phaserGameObject: Phaser.GameObjects.Sprite;

  constructor(config: CharacterConfig) {
    const { scene, assetKey, assetFrame = 0, position } = config;
    this.scene = scene;
    this.phaserGameObject = this.scene.add
      .sprite(position.x, position.y, assetKey, assetFrame)
      .setOrigin(0);
  }

  moveCharacter(selectedDirection: DIRECTION) {
    switch (selectedDirection) {
      case DIRECTION.DOWN:
        this.phaserGameObject.y += TILE_SIZE;
        break;
      case DIRECTION.UP:
        this.phaserGameObject.y -= TILE_SIZE;
        break;
      case DIRECTION.LEFT:
        this.phaserGameObject.x -= TILE_SIZE;
        break;
      case DIRECTION.RIGHT:
        this.phaserGameObject.x += TILE_SIZE;
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(selectedDirection);
    }
  }
}
