import { Character, CharacterConfig } from './character';

interface PlayerConfig extends Omit<CharacterConfig, 'assetKey'> {}

export class Player extends Character {
  constructor(config: PlayerConfig) {
    super({ ...config, assetKey: '', assetFrame: 7 });
  }
}
