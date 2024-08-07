import { Coordinate } from '../../types';

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
    this.phaserGameObject = this.scene.add.sprite(
      position.x,
      position.y,
      assetKey,
      assetFrame
    );
  }
}
