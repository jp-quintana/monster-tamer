import { DATA_ASSET_KEYS } from '../assets/asset-keys';
import { Attack, Animation, Item, BaseInventoryItem } from '../types';

export class DataUtils {
  static getMonsterAttack(scene: Phaser.Scene, attackId: number) {
    const data: Attack[] = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS);
  }

  static getAnimations(scene: Phaser.Scene) {
    const data: Animation[] = scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS);
    return data;
  }

  static getItem(scene: Phaser.Scene, itemId: number): Item {
    const data: Item[] = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS);
    return data.find((item) => item.id === itemId)!;
  }

  static getItems(scene: Phaser.Scene, itemIds: number[]) {
    const data: Item[] = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS);
    return data.filter((item) => {
      return itemIds.some((id) => id === item.id);
    });
  }

  static getMonsterById(scene: Phaser.Scene, monsterId: number) {
    const data: Item[] = scene.cache.json.get(DATA_ASSET_KEYS.MONSTERS);
    return data.find((monster) => monster.id === monsterId);
  }
}
