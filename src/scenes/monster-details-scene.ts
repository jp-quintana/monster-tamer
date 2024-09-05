import { MONSTER_PARTY_ASSET_KEYS } from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { Attack, Monster } from '../types';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager';
import { DataUtils } from '../utils/data-utils';
import { BaseScene } from './base-scene';
import { SCENE_KEYS } from './scene-keys';

const UI_TEXT_STYLE = Object.freeze({
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: '#FFFFFF',
  fontSize: '24px',
});

const MONSTER_MOVE_TEXT_STYLE = Object.freeze({
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: '#000000',
  fontSize: '40px',
});

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

    this.monsterDetails.attackIds.forEach((attackId) => {
      const monsterAttack = DataUtils.getMonsterAttack(this, attackId);
      if (monsterAttack !== undefined) {
        this.monsterAttacks.push(monsterAttack);
      }
    });
  }

  create() {
    super.create();

    // create main background and title
    this.add
      .image(0, 0, MONSTER_PARTY_ASSET_KEYS.MONSTER_DETAILS_BACKGROUND)
      .setOrigin(0);
    this.add.text(10, 0, 'Monster Details', {
      ...UI_TEXT_STYLE,
      fontSize: '48px',
    });

    // add monster details
    this.add.text(20, 60, `Lv. ${this.monsterDetails.currentLevel}`, {
      ...UI_TEXT_STYLE,
      fontSize: '40px',
    });

    this.add
      .image(160, 310, this.monsterDetails.assetKey)
      .setOrigin(0, 1)
      .setScale(0.7);

    if (this.monsterAttacks[0] !== undefined) {
      this.monsterAttacks.forEach((attack, i) => {
        this.add.text(560, 82 + 80 * i, attack.name, MONSTER_MOVE_TEXT_STYLE);
      });
    }
  }

  update(time: DOMHighResTimeStamp) {
    super.update(time);

    if (this.controls.isInputLocked) return;

    if (this.controls.wasEscKeyPressed()) {
      this.goBackToPreviousScene();
      return;
    }

    const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();

    if (wasSpaceKeyPressed) {
      this.goBackToPreviousScene();
      return;
    }
  }

  private goBackToPreviousScene() {
    this.controls.lockInput = true;
    this.scene.start(SCENE_KEYS.MONSTER_PARTY_SCENE);
  }
}
