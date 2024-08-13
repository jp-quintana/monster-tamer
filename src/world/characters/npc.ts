import { CHARACTER_ASSET_KEYS } from '../../assets/asset-keys';
import { DIRECTION } from '../../common/direction';
import { exhaustiveGuard } from '../../utils/guard';
import { Character, CharacterConfig } from './character';

interface NPCConfig extends Omit<CharacterConfig, 'assetKey'> {
  frame: number;
}

export class NPC extends Character {
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

    this.phaserGameObject.setScale(4);
  }

  facePlayer(playerDirection: DIRECTION) {
    switch (playerDirection) {
      case DIRECTION.UP:
        this.phaserGameObject.setFrame(this.idleFrameConfig.DOWN);
        break;
      case DIRECTION.DOWN:
        this.phaserGameObject.setFrame(this.idleFrameConfig.UP);
        break;
      case DIRECTION.LEFT:
        this.phaserGameObject.setFrame(this.idleFrameConfig.RIGHT);
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
