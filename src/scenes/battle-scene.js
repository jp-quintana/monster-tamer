import {
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { Phaser } from '../lib/phaser.js';
import { SCENE_KEYS } from './scene-keys.js';

const BATTLE_MENU_OPTIONS = Object.freeze({
  FIGHT: 'FIGHT',
  SWITCH: 'SWITCH',
  ITEM: 'ITEM',
  FLEE: 'FLEE',
});

const battleUiTextStyle = {
  color: 'black',
  fontSize: '30px',
};

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  create() {
    // create main background
    this.add.image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setOrigin(0);

    // render out the player and enemy monsters
    this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0);
    this.add.image(256, 316, MONSTER_ASSET_KEYS.IGUANIGNITE, 0).setFlipX(true);

    // render out the player and health bar
    const playerMonsterName = this.add.text(
      30,
      20,
      MONSTER_ASSET_KEYS.IGUANIGNITE,
      {
        color: '#7E3D3F',
        fontSize: '32px ',
      }
    );
    this.add.container(556, 318, [
      this.add
        .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
        .setOrigin(0),
      playerMonsterName,
      this.#createHealthBar(34, 34),
      this.add.text(playerMonsterName.width + 35, 23, 'L5', {
        color: '#ED474B',
        fontSize: '28px ',
      }),
      this.add.text(30, 55, 'HP', {
        color: '#FF6505',
        fontSize: '24px',
        fontStyle: 'italic',
      }),
      this.add
        .text(443, 80, '25/25', {
          color: '#7E3D4F',
          fontSize: '16',
        })
        .setOrigin(1, 0), // align to the right always, numbers might go up as monster levels up, so you want text to grow towards left not right
    ]);

    // render out the enemy and health bar
    const enemyMonsterName = this.add.text(
      30,
      20,
      MONSTER_ASSET_KEYS.CARNODUSK,
      {
        color: '#7E3D3F',
        fontSize: '32px ',
      }
    );
    this.add.container(0, 0, [
      this.add
        .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
        .setOrigin(0)
        .setScale(1, 0.8),
      enemyMonsterName,
      this.#createHealthBar(34, 34),
      this.add.text(enemyMonsterName.width + 35, 23, 'L5', {
        color: '#ED474B',
        fontSize: '28px ',
      }),
      this.add.text(30, 55, 'HP', {
        color: '#FF6505',
        fontSize: '24px',
        fontStyle: 'italic',
      }),
    ]);

    //render panes
    this.#createMainInfoPane();
    this.add.container(520, 448, [
      this.#createMainInfoSubPane(),
      this.add.text(55, 22, BATTLE_MENU_OPTIONS.FIGHT, battleUiTextStyle),
      this.add.text(240, 22, BATTLE_MENU_OPTIONS.SWITCH, battleUiTextStyle),
      this.add.text(55, 70, BATTLE_MENU_OPTIONS.ITEM, battleUiTextStyle),
      this.add.text(240, 70, BATTLE_MENU_OPTIONS.FLEE, battleUiTextStyle),
    ]);

    this.add.container(0, 448, [
      this.add.text(55, 22, 'slash', battleUiTextStyle),
      this.add.text(240, 22, 'growl', battleUiTextStyle),
      this.add.text(55, 70, '-', battleUiTextStyle),
      this.add.text(240, 70, '-', battleUiTextStyle),
    ]);
  }

  #createHealthBar(x, y) {
    const scale = [1, 0.7];
    const leftCap = this.add
      .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
      .setOrigin(0, 0.5)
      .setScale(...scale);
    const middle = this.add
      .image(leftCap.x + leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE)
      .setOrigin(0, 0.5)
      .setScale(...scale);
    middle.displayWidth = 360;
    const rightCap = this.add
      .image(middle.x + middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
      .setOrigin(0, 0.5)
      .setScale(...scale);
    return this.add.container(x, y, [leftCap, middle, rightCap]);
  }

  #createMainInfoPane() {
    const padding = 4;
    const rectHeight = 124;
    this.add
      .rectangle(
        padding,
        this.scale.height - rectHeight - padding,
        this.scale.width - padding * 2,
        rectHeight,
        0xede4f3,
        1
      )
      .setOrigin(0)
      .setStrokeStyle(8, 0xe4434a, 1);
  }

  #createMainInfoSubPane() {
    const rectWidth = 500;
    const rectHeight = 124;
    return this.add
      .rectangle(
        0,
        0,
        rectWidth,
        rectHeight,

        0xede4f3,
        1
      )
      .setOrigin(0)
      .setStrokeStyle(8, 0x905ac2, 1);
  }
}
