import {
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { Background } from '../battle/background.js';
import { BattleMonster } from '../battle/monsters/battle-monster.js';
import { BattleMenu } from '../battle/ui/menu/battle-menu.js';
import { HealthBar } from '../battle/ui/menu/health-bar.js';
import { DIRECTION } from '../common/direction.js';
import { Phaser } from '../lib/phaser.js';
import { SCENE_KEYS } from './scene-keys.js';

export class BattleScene extends Phaser.Scene {
  /** @type {BattleMenu}  */
  #battleMenu;
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys & {esc: Phaser.Input.Keyboard.Key}}  */
  #cursorKeys;
  /** @type {BattleMonster}  */
  #activeEnemyMonster;

  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  create() {
    const background = new Background(this);
    background.showForest();

    // render out the player and enemy monsters
    this.#activeEnemyMonster = new BattleMonster(
      {
        scene: this,
        monsterDetails: {
          name: MONSTER_ASSET_KEYS.CARNODUSK,
          assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
          assetFrame: 0,
          currentHp: 25,
          maxHp: 25,
          attackIds: [],
          baseAttack: 5,
        },
      },
      { x: 768, y: 144 }
    );
    // this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0);
    this.add.image(256, 316, MONSTER_ASSET_KEYS.IGUANIGNITE, 0).setFlipX(true);

    // render out the player and health bar
    const playerHealthBar = new HealthBar(this, 34, 34);
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
      playerHealthBar.container,
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
    // TODO:
    const enemyHealthBar = this.#activeEnemyMonster._healthBar;
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
      enemyHealthBar.container,
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

    playerHealthBar.setMeterPercentageAnimated(0.5, {
      duration: 3000,
      callback: () => {
        console.log('callback works');
      },
    });
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
}
