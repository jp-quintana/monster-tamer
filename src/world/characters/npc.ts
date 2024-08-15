import { CHARACTER_ASSET_KEYS } from '../../assets/asset-keys';
import { DIRECTION } from '../../common/direction';
import { Coordinate } from '../../types';
import { exhaustiveGuard } from '../../utils/guard';
import { Character, CharacterConfig } from './character';
export interface NPCPath {
  [key: number]: Coordinate;
}
interface NPCConfigProps {
  frame: number;
  messages: string[];
  npcPath: NPCPath;
  movementPattern: NPC_MOVEMENT_PATTERN;
}
interface NPCConfig
  extends Omit<CharacterConfig, 'assetKey' | 'idleFrameConfig'>,
    NPCConfigProps {}

export const enum NPC_MOVEMENT_PATTERN {
  IDLE = 'IDLE',
  CLOCKWISE = 'CLOCKWISE',
}

export class NPC extends Character {
  #messages: string[];
  private talkingToPlayer: boolean;
  private npcPath: NPCPath;
  private currentPathIndex: number;
  private movementPattern: NPC_MOVEMENT_PATTERN;

  constructor(config: NPCConfig) {
    super({
      ...config,
      assetKey: CHARACTER_ASSET_KEYS.NPC,
      origin: { x: 0, y: 0 },
      idleFrameConfig: {
        DOWN: config.frame,
        UP: config.frame + 1,
        NONE: config.frame,
        LEFT: config.frame + 2,
        RIGHT: config.frame + 2,
      },
    });

    this.#messages = config.messages;
    this.talkingToPlayer = false;
    this.phaserGameObject.setScale(4);
    this.npcPath = config.npcPath;
    this.currentPathIndex = 0;
    this.movementPattern = config.movementPattern;
  }

  get messages() {
    return [...this.#messages];
  }

  get isTalkingToPlayer() {
    return this.talkingToPlayer;
  }

  set isTalkingToPlayer(val: boolean) {
    this.talkingToPlayer = val;
  }

  facePlayer(playerDirection: DIRECTION) {
    switch (playerDirection) {
      case DIRECTION.UP:
        this.phaserGameObject
          .setFrame(this.idleFrameConfig.DOWN)
          .setFlipX(false);
        break;
      case DIRECTION.DOWN:
        this.phaserGameObject.setFrame(this.idleFrameConfig.UP).setFlipX(false);
        break;
      case DIRECTION.LEFT:
        this.phaserGameObject
          .setFrame(this.idleFrameConfig.RIGHT)
          .setFlipX(false);

        break;
      case DIRECTION.RIGHT:
        this.phaserGameObject
          .setFrame(this.idleFrameConfig.LEFT)
          .setFlipX(true);
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(playerDirection);
    }
  }

  update(time: DOMHighResTimeStamp) {
    if (this._isMoving) return;

    if (this.talkingToPlayer) return;

    super.update(time);

    if (this.movementPattern === NPC_MOVEMENT_PATTERN.IDLE) return;

    let characterDirection = DIRECTION.NONE;
    let nextPosition = this.npcPath[this.currentPathIndex + 1];

    if (!nextPosition) {
      nextPosition = this.npcPath[0];
      this.currentPathIndex = 0;
    } else {
      this.currentPathIndex = this.currentPathIndex + 1;
    }

    if (nextPosition.x > this.phaserGameObject.x) {
      characterDirection = DIRECTION.RIGHT;
    } else if (nextPosition.x < this.phaserGameObject.x) {
      characterDirection = DIRECTION.LEFT;
    } else if (nextPosition.y < this.phaserGameObject.y) {
      characterDirection = DIRECTION.UP;
    } else {
      characterDirection = DIRECTION.DOWN;
    }

    this.moveCharacter(characterDirection);
  }
}
