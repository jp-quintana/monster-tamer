import { Attack, Monster } from '../types';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager';
import { BaseScene } from './base-scene';
import { SCENE_KEYS } from './scene-keys';

export class MonsterDetailsScene extends BaseScene {
  private monsterDetails: Monster;
  private monsterAttacks: Attack[];
  constructor() {
    super({
      key: SCENE_KEYS.MONSTER_DETAILS_SCENE,
    });
  }

  init() {
    super.init();

    this.monsterDetails = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
    )[0];
    this.monsterAttacks = [];

    this.monsterDetails.attackIds.forEach((attackId) => {});
  }

  create() {
    super.create();
  }

  update(time: DOMHighResTimeStamp) {
    super.update(time);
  }
}
