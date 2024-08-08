import { CHARACTER_ASSET_KEYS } from '../../assets/asset-keys';
import { Character, CharacterConfig } from './character';

interface PlayerConfig extends Omit<CharacterConfig, 'assetKey'> {}

export class Player extends Character {
  constructor(config: PlayerConfig) {
    super({ ...config, assetKey: CHARACTER_ASSET_KEYS.PLAYER, assetFrame: 7 });
  }
}
