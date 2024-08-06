import { ATTACK_ASSET_KEYS } from '../../assets/asset-keys';
import { Coordinate } from '../../types';
import { Attack } from './attack';

export class IceShard extends Attack {
  protected attackGameObject: Phaser.GameObjects.Sprite;
  constructor(scene: Phaser.Scene, position: Coordinate) {
    super(scene, position);

    this.attackGameObject = this.scene.add
      .sprite(this.position.x, this.position.y, ATTACK_ASSET_KEYS.ICE_SHARD, 5)
      .setOrigin(0.5)
      .setScale(4)
      .setAlpha(1);
  }
}
