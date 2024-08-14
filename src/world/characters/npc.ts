import { CHARACTER_ASSET_KEYS } from '../../assets/asset-keys';
import { DIRECTION } from '../../common/direction';
import { exhaustiveGuard } from '../../utils/guard';
import { Character, CharacterConfig } from './character';

interface NPCConfigProps {
  frame: number;
  messages: string[];
}
interface NPCConfig
  extends Omit<CharacterConfig, 'assetKey' | 'idleFrameConfig'>,
    NPCConfigProps {}

export class NPC extends Character {
  #messages: string[];
  private talkingToPlayer: boolean;
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
}
