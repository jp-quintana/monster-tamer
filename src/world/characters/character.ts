import { DIRECTION } from '../../common/direction';
import { Coordinate } from '../../types';
import { getTargetPositionFromGameObjectPositionAndDirection } from '../../utils/grid-utils';
import { exhaustiveGuard } from '../../utils/guard';

export const idleFrame = { DOWN: 7, UP: 1, NONE: 7, LEFT: 10, RIGHT: 4 };

export interface IdleFrameConfig {
  DOWN: number;
  UP: number;
  NONE: number;
  LEFT: number;
  RIGHT: number;
}

export interface CharacterConfig {
  scene: Phaser.Scene;
  assetKey: string;
  origin?: Coordinate;
  position: Coordinate;
  direction: DIRECTION;
  collisionLayer?: Phaser.Tilemaps.TilemapLayer | undefined;
  idleFrameConfig: IdleFrameConfig;
  otherCharactersToCheckForCollisionsWith?: Character[];
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
  protected _collisionLayer: Phaser.Tilemaps.TilemapLayer | undefined;
  protected spriteGridMovementFinishedCallback: (() => void) | undefined;
  protected idleFrameConfig: IdleFrameConfig;
  protected otherCharactersToCheckForCollisionsWith: Character[];

  constructor(config: CharacterConfig) {
    const {
      scene,
      assetKey,
      origin,
      position,
      direction,
      spriteGridMovementFinishedCallback,
      collisionLayer,
      idleFrameConfig,
      otherCharactersToCheckForCollisionsWith = [],
    } = config;
    this.scene = scene;
    this._direction = direction;
    this._isMoving = false;
    this.targetPosition = { ...position };
    this.previousTargetPosition = { ...position };
    this.idleFrameConfig = idleFrameConfig;
    this._origin = origin ? { ...origin } : { x: 0, y: 0 };
    this._collisionLayer = collisionLayer;
    this.otherCharactersToCheckForCollisionsWith =
      otherCharactersToCheckForCollisionsWith;
    this.phaserGameObject = this.scene.add
      .sprite(position.x, position.y, assetKey, this.idleFrame)
      .setOrigin(this._origin.x, this._origin.y);
    this.spriteGridMovementFinishedCallback =
      spriteGridMovementFinishedCallback;
  }

  get sprite() {
    return this.phaserGameObject;
  }

  get isMoving() {
    return this._isMoving;
  }

  get direction() {
    return this._direction;
  }

  protected get idleFrame() {
    return this.idleFrameConfig[this.direction];
  }

  moveCharacter(direction: DIRECTION) {
    if (this._isMoving) return;

    this.moveSprite(direction);
  }

  addCharacterToCheckForCollisionsWith(character: Character) {
    this.otherCharactersToCheckForCollisionsWith.push(character);
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

    const targetPosition = { ...this.targetPosition };
    const updatedPosition = getTargetPositionFromGameObjectPositionAndDirection(
      targetPosition,
      this.direction
    );

    return (
      this.doesThisPositionCollideWithCollisionLayer(updatedPosition) ||
      this.doesThisPositionCollideWithOtherCharacter(updatedPosition)
    );
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

  private doesThisPositionCollideWithCollisionLayer(position: Coordinate) {
    if (!this._collisionLayer) return false;

    const { x, y } = position;

    const tile = this._collisionLayer.getTileAtWorldXY(x, y, true);

    return tile.index !== -1;
  }

  private doesThisPositionCollideWithOtherCharacter(position: Coordinate) {
    if (this.otherCharactersToCheckForCollisionsWith.length === 0) return false;
    const { x, y } = position;

    const collidesWithACharacter =
      this.otherCharactersToCheckForCollisionsWith.some((character) => {
        return (
          (character.targetPosition.x === x &&
            character.targetPosition.y === y) ||
          (character.previousTargetPosition.x === x &&
            character.previousTargetPosition.y === y)
        );
      });

    return collidesWithACharacter;
  }
}
