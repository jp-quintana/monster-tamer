import {
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { BattleMenu } from '../battle/ui/menu/battle-menu.js';
import { DIRECTION } from '../common/direction.js';
import { Phaser } from '../lib/phaser.js';
import { SCENE_KEYS } from './scene-keys.js';

export class BattleScene extends Phaser.Scene {
  /** @type {BattleMenu}  */
  #battleMenu;
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys & {esc: Phaser.Input.Keyboard.Key}}  */
  #cursorKeys;

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
          fontSize: '16px',
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

    this.#battleMenu = new BattleMenu(this);
    this.#battleMenu.showMainBattleMenu();

    this.#cursorKeys = {
      esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      ...this.input.keyboard.createCursorKeys(),
    };
  }
  update() {
    // true only once and then goes back to false
    const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(
      this.#cursorKeys.space
    );
    // true while held down
    // console.log(this.#cursorKeys.space.isDown);

    if (wasSpaceKeyPressed) {
      this.#battleMenu.handlePlayerInput('OK');

      // check if player selected an attack, and update display text
      if (this.#battleMenu.selectedAttack === undefined) return;

      this.#battleMenu.hideMonsterAttackSubMenu();
      this.#battleMenu.updateInfoPanelMessagesAndWaitForInput(
        [`Player selected move ${this.#battleMenu.selectedAttack}`],
        () => {
          this.#battleMenu.showMainBattleMenu();
        }
      );
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.esc)) {
      this.#battleMenu.handlePlayerInput('CANCEL');
      return;
    }
    /** @type {import('../common/direction.js').Direction}  */
    let selectedDirection = DIRECTION.NONE;
    if (this.#cursorKeys.left.isDown) {
      selectedDirection = DIRECTION.LEFT;
    } else if (this.#cursorKeys.right.isDown) {
      selectedDirection = DIRECTION.RIGHT;
    } else if (this.#cursorKeys.up.isDown) {
      selectedDirection = DIRECTION.UP;
    } else if (this.#cursorKeys.down.isDown) {
      selectedDirection = DIRECTION.DOWN;
    }

    if (selectedDirection !== DIRECTION.NONE)
      this.#battleMenu.handlePlayerInput(selectedDirection);
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @returns {Phaser.GameObjects.Container}
   */

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
}
