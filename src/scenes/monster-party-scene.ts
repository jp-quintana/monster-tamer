import {
  BATTLE_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_PARTY_ASSET_KEYS,
  UI_ASSET_KEYS,
} from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { HealthBar } from '../battle/ui/menu/health-bar';
import { Monster } from '../types';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager';
import { BaseScene } from './base-scene';
import { SCENE_KEYS } from './scene-keys';

const UI_TEXT_STYLE = Object.freeze({
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: '#FFFFFF',
  fontSize: '24px',
});

const MONSTER_PARTY_POSITIONS = Object.freeze({
  EVEN: {
    x: 0,
    y: 10,
  },
  ODD: {
    x: 510,
    y: 40,
  },
  increment: 150,
});

export class MonsterPartyScene extends BaseScene {
  private monsterPartyBackgrounds: Phaser.GameObjects.Image[];
  private cancelButton: Phaser.GameObjects.Image;
  private infoTextGameObject: Phaser.GameObjects.Text;
  private healthBars: HealthBar[];
  private healthBarTextGameObjects: Phaser.GameObjects.Text[];
  private selectedPartyMonsterIndex: number;
  private monsters: Monster[];

  constructor() {
    super({ key: SCENE_KEYS.MONSTER_PARTY_SCENE });
  }

  init() {
    super.init();

    this.monsterPartyBackgrounds = [];
    this.healthBars = [];
    this.healthBarTextGameObjects = [];
    this.selectedPartyMonsterIndex = 0;
    this.monsters = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
    );
  }

  create() {
    super.create();

    // create custom background
    this.add
      .tileSprite(
        0,
        0,
        this.scale.width,
        this.scale.height,
        MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND,
        0
      )
      .setOrigin(0)
      .setAlpha(0.7);
    // create button
    const buttonContainer = this.add.container(883, 519, []);

    this.cancelButton = this.add
      .image(0, 0, UI_ASSET_KEYS.BLUE_BUTTON, 0)
      .setOrigin(0)
      .setScale(0.7, 1)
      .setAlpha(0.7);

    const cancelText = this.add
      .text(66.5, 20.5, 'cancel', UI_TEXT_STYLE)
      .setOrigin(0.5);

    buttonContainer.add([this.cancelButton, cancelText]);

    // create info container
    const infoContainer = this.add.container(4, this.scale.height - 69, []);
    const infoDisplay = this.add
      .rectangle(0, 0, 867, 65, 0xede4f3, 1)
      .setOrigin(0)
      .setStrokeStyle(8, 0x905ac2, 1);

    this.infoTextGameObject = this.add.text(15, 14, '', {
      ...UI_TEXT_STYLE,
      color: '#000000',
      fontSize: '23px',
    });

    infoContainer.add([infoDisplay, this.infoTextGameObject]);
    this.updateInfoContainerText();

    // create monsters in party

    this.monsters.forEach((monster, i) => {
      const isEven = i % 2 === 0;
      let x = isEven
        ? MONSTER_PARTY_POSITIONS.EVEN.x
        : MONSTER_PARTY_POSITIONS.ODD.x;
      let y =
        (isEven
          ? MONSTER_PARTY_POSITIONS.EVEN.y
          : MONSTER_PARTY_POSITIONS.ODD.y) +
        MONSTER_PARTY_POSITIONS.increment * Math.floor(i / 2);

      this.createMonster(x, y, monster);
    });

    // this.createMonster(
    //   0,
    //   10,
    //   dataManager.store.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY)[0]
    // );
    // this.add
    //   .image(510, 40, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
    //   .setOrigin(0)
    //   .setScale(1.1, 1.2)
    //   .setAlpha(0.7);
    // this.add
    //   .image(0, 160, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
    //   .setOrigin(0)
    //   .setScale(1.1, 1.2)
    //   .setAlpha(0.7);
    // this.add
    //   .image(510, 190, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
    //   .setOrigin(0)
    //   .setScale(1.1, 1.2)
    //   .setAlpha(0.7);
    // this.add
    //   .image(0, 310, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
    //   .setOrigin(0)
    //   .setScale(1.1, 1.2)
    //   .setAlpha(0.7);
    // this.add
    //   .image(510, 340, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
    //   .setOrigin(0)
    //   .setScale(1.1, 1.2)
    //   .setAlpha(0.35);
  }

  private updateInfoContainerText() {
    if (this.selectedPartyMonsterIndex === -1) {
      this.infoTextGameObject.setText('Go back to previous menu');
      return;
    }

    this.infoTextGameObject.setText('Choose a monster');
  }

  private createMonster(x: number, y: number, monsterDetails: Monster) {
    const container = this.add.container(x, y, []);
    const background = this.add
      .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
      .setOrigin(0)
      .setScale(1.1, 1.2)
      .setAlpha(0.7);

    const leftShadowCap = this.add
      .image(160, 67, HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW)
      .setOrigin(0)
      .setAlpha(0.5);

    const middleShadow = this.add
      .image(
        leftShadowCap.x + leftShadowCap.width,
        67,
        HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW
      )
      .setOrigin(0)
      .setAlpha(0.5);

    middleShadow.displayWidth = 285;

    const rightShadowCap = this.add
      .image(
        middleShadow.x + middleShadow.displayWidth,
        y,
        HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW
      )
      .setOrigin(0)
      .setAlpha(0.5);

    const healthBar = new HealthBar(this, 100, 40, 240);
    healthBar.setMeterPercentageAnimated(
      monsterDetails.currentHp / monsterDetails.maxHp,
      {
        duration: 0,
        skipBattleAnimations: true,
      }
    );

    this.healthBars.push(healthBar);

    const monsterNameGameText = this.add.text(162, 36, monsterDetails.name, {
      ...UI_TEXT_STYLE,
      color: '#ffffff',
      fontSize: '30px',
    });

    const monsterHealthBarLevelText = this.add.text(
      26,
      116,
      `Lv. ${monsterDetails.currentLevel}`,
      {
        ...UI_TEXT_STYLE,
        color: '#ffffff',
        fontSize: '22px',
      }
    );

    const monsterHpText = this.add.text(164, 66, 'HP', {
      ...UI_TEXT_STYLE,
      color: '#FF6505',
      fontSize: '24px',
      fontStyle: 'italic',
    });

    const healthBarTextGameObject = this.add
      .text(458, 95, `${monsterDetails.currentHp}/${monsterDetails.maxHp}`, {
        ...UI_TEXT_STYLE,
        color: '#ffffff',
        fontSize: '38px',
      })
      .setOrigin(1, 0);

    this.healthBarTextGameObjects.push(healthBarTextGameObject);

    const monsterImage = this.add
      .image(35, 20, monsterDetails.assetKey)
      .setOrigin(0)
      .setScale(0.35);

    container.add([
      background,
      leftShadowCap,
      middleShadow,
      rightShadowCap,
      healthBar.container,
      monsterImage,
      monsterNameGameText,
      monsterHealthBarLevelText,
      monsterHpText,
      healthBarTextGameObject,
    ]);

    return container;
  }
}
