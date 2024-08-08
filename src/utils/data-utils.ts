import { DATA_ASSET_KEYS } from '../assets/asset-keys';
import { Attack, Animation } from '../types';

export class DataUtils {
  static getMonsterAttack(scene: Phaser.Scene, attackId: number) {
    const data: Attack[] = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS);
    return data.find((attack) => attack.id === attackId);
  }

  static getAnimations(scene: Phaser.Scene) {
    const data: Animation[] = scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS);
    return data;
  }
}
