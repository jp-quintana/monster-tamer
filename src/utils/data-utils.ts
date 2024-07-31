import { DATA_ASSET_KEYS } from '../assets/asset-keys';
import { Attack } from '../types';

export class DataUtils {
  static getMonsterAttack(scene: Phaser.Scene, attackId: number) {
    const data: Attack[] = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS);
    return data.find((attack) => attack.id === attackId);
  }
}
