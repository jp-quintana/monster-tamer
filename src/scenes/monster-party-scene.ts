import {
  BATTLE_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_PARTY_ASSET_KEYS,
  UI_ASSET_KEYS,
} from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { HealthBar } from '../battle/ui/menu/health-bar';
import { DIRECTION } from '../common/direction';
import { Item, ITEM_EFFECT, Monster } from '../types';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager';
import { exhaustiveGuard } from '../utils/guard';
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
  private sceneData: { previousSceneName: SCENE_KEYS; itemSelected?: Item };
  private waitingForInput: boolean;

  constructor() {
    super({ key: SCENE_KEYS.MONSTER_PARTY_SCENE });
  }

  init(data: any) {
    super.init(data);

    this.sceneData = data;

    this.monsterPartyBackgrounds = [];
    this.healthBars = [];
    this.healthBarTextGameObjects = [];
    this.selectedPartyMonsterIndex = 0;
    this.monsters = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
    );
    this.waitingForInput = false;
  }

  create() {
    super.create();

    // create custom background
    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1)
      .setOrigin(0);
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
    this.movePlayerInputCursor(DIRECTION.NONE);
  }

  update(time: DOMHighResTimeStamp) {
    super.update(time);

    if (this.controls.isInputLocked) return;

    if (this.controls.wasEscKeyPressed()) {
      if (this.waitingForInput) {
        this.updateInfoContainerText();
        this.waitingForInput = false;
        return;
      }

      this.goBackToPreviousScene(false);
      return;
    }

    const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();

    if (wasSpaceKeyPressed) {
      if (this.waitingForInput) {
        this.updateInfoContainerText();
        this.waitingForInput = false;
        return;
      }

      if (this.selectedPartyMonsterIndex === -1) {
        this.goBackToPreviousScene(false);
        return;
      }

      if (
        this.sceneData.previousSceneName === SCENE_KEYS.INVENTORY_SCENE &&
        this.sceneData.itemSelected
      ) {
        this.handleItemUsed();
        return;
      }

      this.controls.lockInput = true;
      const sceneDataToPass = {
        monster: this.monsters[this.selectedPartyMonsterIndex],
      };
      this.scene.launch(SCENE_KEYS.MONSTER_DETAILS_SCENE, sceneDataToPass);
      this.scene.pause(SCENE_KEYS.MONSTER_PARTY_SCENE);
      return;
    }

    if (this.waitingForInput) return;

    const selectedDirection = this.controls.getDirectionKeyJustPressed();

    if (selectedDirection !== DIRECTION.NONE) {
      this.movePlayerInputCursor(selectedDirection);
      this.updateInfoContainerText();
    }
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

    this.monsterPartyBackgrounds.push(background);
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

  private goBackToPreviousScene(itemUsed: boolean) {
    this.controls.lockInput = true;

    this.scene.stop(SCENE_KEYS.MONSTER_PARTY_SCENE);
    this.scene.resume(this.sceneData.previousSceneName, { itemUsed });
  }

  private movePlayerInputCursor(selectedDirection: DIRECTION) {
    switch (selectedDirection) {
      case DIRECTION.UP:
      case DIRECTION.LEFT:
        if (this.selectedPartyMonsterIndex === -1) {
          this.selectedPartyMonsterIndex = this.monsters.length - 1;
        } else {
          this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex].setAlpha(
            0.7
          );
          this.selectedPartyMonsterIndex--;
        }

        break;
      case DIRECTION.DOWN:
      case DIRECTION.RIGHT:
        if (this.selectedPartyMonsterIndex === this.monsters.length - 1) {
          // deselect current monster
          this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex].setAlpha(
            0.7
          );
          this.selectedPartyMonsterIndex = -1;
        } else {
          // if monster is selected, deselect
          if (this.selectedPartyMonsterIndex >= 0) {
            this.monsterPartyBackgrounds[
              this.selectedPartyMonsterIndex
            ].setAlpha(0.7);
          }

          this.selectedPartyMonsterIndex++;
        }
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(selectedDirection);
        break;
    }

    if (this.selectedPartyMonsterIndex === -1) {
      this.cancelButton
        .setTexture(UI_ASSET_KEYS.BLUE_BUTTON_SELECTED, 0)
        .setAlpha(1);
    } else {
      this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex].setAlpha(1);
      this.cancelButton.setTexture(UI_ASSET_KEYS.BLUE_BUTTON, 0).setAlpha(0.7);
    }
  }

  private handleItemUsed() {
    switch (this.sceneData.itemSelected!.effect) {
      case ITEM_EFFECT.HEAL_30:
        this.handleHealItemUsed(30);
        break;
      default:
        exhaustiveGuard(this.sceneData.itemSelected!.effect);
    }
  }

  private handleHealItemUsed(amount: number) {
    this.controls.lockInput = true;

    // validate that the monster is not fainted
    if (this.monsters[this.selectedPartyMonsterIndex].currentHp === 0) {
      this.infoTextGameObject.setText(`Cannot heal fainted monster`);
      this.waitingForInput = true;
      this.controls.lockInput = false;
      return;
    }

    // validate that the monster is not already fully healed
    if (
      this.monsters[this.selectedPartyMonsterIndex].currentHp ===
      this.monsters[this.selectedPartyMonsterIndex].maxHp
    ) {
      this.infoTextGameObject.setText(`Monster is already healed`);
      this.waitingForInput = true;
      this.controls.lockInput = false;
      return;
    }

    // otherwise, heal monster by the amount
    this.monsters[this.selectedPartyMonsterIndex].currentHp += amount;

    if (
      this.monsters[this.selectedPartyMonsterIndex].currentHp >
      this.monsters[this.selectedPartyMonsterIndex].maxHp
    ) {
      this.monsters[this.selectedPartyMonsterIndex].currentHp =
        this.monsters[this.selectedPartyMonsterIndex].maxHp;
    }

    this.infoTextGameObject.setText(`Healed monster by ${amount} HP`);
    this.healthBars[this.selectedPartyMonsterIndex].setMeterPercentageAnimated(
      this.monsters[this.selectedPartyMonsterIndex].currentHp /
        this.monsters[this.selectedPartyMonsterIndex].maxHp,
      {
        callback: () => {
          this.healthBarTextGameObjects[this.selectedPartyMonsterIndex].setText(
            `${this.monsters[this.selectedPartyMonsterIndex].currentHp} / ${
              this.monsters[this.selectedPartyMonsterIndex].maxHp
            }`
          );

          dataManager.store.set(
            DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY,
            this.monsters
          );

          this.time.delayedCall(300, () => {
            this.goBackToPreviousScene(true);
          });
        },
      }
    );
  }
}
