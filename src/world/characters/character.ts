import { DIRECTION } from '../../common/direction';
import { Coordinate } from '../../types';
import { getTargetPositionFromGameObjectPositionAndDirection } from '../../utils/grid-utils';
import { exhaustiveGuard } from '../../utils/guard';

export const idleFrame = { DOWN: 7, UP: 1, NONE: 7, LEFT: 10, RIGHT: 4 };

export interface CharacterConfig {
  scene: Phaser.Scene;
  assetKey: string;
  origin?: Coordinate;
  position: Coordinate;
  direction: DIRECTION;
  spriteGridMovementFinishedCallback?: () => void;
}

export class Character {
  protected scene: Phaser.Scene;
  protected phaserGameObject: Phaser.GameObjects.Sprite;
  protected _direction: DIRECTION;
  protected _isMoving: boolean;
  protected _origin: Coordinate;
  protected targetPosition: Coordinate;
  protected previousTargetPosition: Coordinate;
  protected spriteGridMovementFinishedCallback: (() => void) | undefined;

  constructor(config: CharacterConfig) {
    const {
      scene,
      assetKey,
      origin,
      position,
      direction,
      spriteGridMovementFinishedCallback,
    } = config;
    this.scene = scene;
    this._direction = direction;
    this._isMoving = false;
    this.targetPosition = { ...position };
    this.previousTargetPosition = { ...position };
    this._origin = origin ? { ...origin } : { x: 0, y: 0 };
    this.phaserGameObject = this.scene.add
      .sprite(position.x, position.y, assetKey, this.getIdleFrame())
      .setOrigin(this._origin.x, this._origin.y);
    this.spriteGridMovementFinishedCallback =
      spriteGridMovementFinishedCallback;
  }

  get isMoving() {
    return this._isMoving;
  }

  get direction() {
    return this._direction;
  }

  moveCharacter(direction: DIRECTION) {
    if (this._isMoving) return;

    this.moveSprite(direction);
  }

  protected getIdleFrame() {
    return idleFrame[this.direction];
  }

  update(time: DOMHighResTimeStamp) {
    if (this._isMoving) return;

    const idleFrame =
      this.phaserGameObject.anims.currentAnim?.frames[1].frame.name;

    this.phaserGameObject.anims.stop();

    if (!idleFrame) {
      return;
    }

    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        this.phaserGameObject.setFrame(idleFrame);
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(this._direction);
    }
  }

  protected moveSprite(direction: DIRECTION) {
    this._direction = direction;
    if (this.isBlockingTile()) return;

    this._isMoving = true;
    this.handleSpriteMovement();
  }

  protected isBlockingTile() {
    if (this._direction === DIRECTION.NONE) {
      this._isMoving = false;
      return;
    }
    // TODO: add in collision logic
    return false;
  }

  private handleSpriteMovement() {
    if (this._direction === DIRECTION.NONE) {
      this._isMoving = false;
      return;
    }

    const updatedPosition = getTargetPositionFromGameObjectPositionAndDirection(
      this.targetPosition,
      this.direction
    );
    this.previousTargetPosition = { ...this.targetPosition };
    this.targetPosition.x = updatedPosition.x;
    this.targetPosition.y = updatedPosition.y;

    this.scene.add.tween({
      delay: 0,
      duration: 300,
      y: {
        from: this.previousTargetPosition.y,
        start: this.previousTargetPosition.y,
        to: this.targetPosition.y,
      },
      x: {
        from: this.previousTargetPosition.x,
        start: this.previousTargetPosition.x,
        to: this.targetPosition.x,
      },
      targets: this.phaserGameObject,
      onComplete: () => {
        this._isMoving = false;
        this.previousTargetPosition = { ...this.targetPosition };
        if (this.spriteGridMovementFinishedCallback)
          this.spriteGridMovementFinishedCallback();
      },
    });
  }
}
