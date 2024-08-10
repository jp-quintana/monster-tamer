import { CHARACTER_ASSET_KEYS } from '../../assets/asset-keys';
import { DIRECTION } from '../../common/direction';
import { exhaustiveGuard } from '../../utils/guard';
import { Character, CharacterConfig } from './character';

interface PlayerConfig extends Omit<CharacterConfig, 'assetKey'> {}

export class Player extends Character {
  constructor(config: PlayerConfig) {
    super({
      ...config,
      assetKey: CHARACTER_ASSET_KEYS.PLAYER,
      origin: { x: 0, y: 0.2 },
    });
  }

  moveCharacter(direction: DIRECTION) {
    super.moveCharacter(direction);
    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        if (
          !this.phaserGameObject.anims.isPlaying ||
          this.phaserGameObject.anims.currentAnim?.key !==
            `PLAYER_${this._direction}`
        ) {
          this.phaserGameObject.play(`PLAYER_${this._direction}`);
        }
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(this._direction);
    }
  }
}
