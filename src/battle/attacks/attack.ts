import { Coordinate } from '../../types';

export class Attack {
  protected scene: Phaser.Scene;
  protected position: Coordinate;
  protected isAnimationPlaying: boolean;
  protected attackGameObject:
    | Phaser.GameObjects.Sprite
    | Phaser.GameObjects.Container
    | undefined;

  constructor(scene: Phaser.Scene, position: Coordinate) {
    this.scene = scene;
    this.position = position;
    this.isAnimationPlaying = false;
    this.attackGameObject = undefined;
  }

  get gameObject(): typeof this.attackGameObject {
    return this.attackGameObject;
  }

  playAnimation(callback?: () => void) {
    throw new Error('play animation is not implemented');
  }
}
