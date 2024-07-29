import { BATTLE_ASSET_KEYS, MONSTER_ASSET_KEYS } from '../assets/asset-keys.js';
import { Background } from '../battle/background.js';
import { EnemyBattleMonster } from '../battle/monsters/enemy-battle-monster.js';
import { PlayerBattleMonster } from '../battle/monsters/player-battle-monster.js';
import { BattleMenu } from '../battle/ui/menu/battle-menu.js';
import { DIRECTION } from '../common/direction.js';
import { Phaser } from '../lib/phaser.js';
import { SCENE_KEYS } from './scene-keys.js';

export class BattleScene extends Phaser.Scene {
  /** @type {BattleMenu}  */
  #battleMenu;
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys & {esc: Phaser.Input.Keyboard.Key}}  */
  #cursorKeys;
  /** @type {EnemyBattleMonster}  */
  #activeEnemyMonster;
  /** @type {PlayerBattleMonster}  */
  #activePlayerMonster;

  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  create() {
    const background = new Background(this);
    background.showForest();

    // render out the player and enemy monsters
    this.#activeEnemyMonster = new EnemyBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.CARNODUSK,
        assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
        assetFrame: 0,
        currentLevel: 5,
        currentHp: 25,
        maxHp: 25,
        attackIds: [],
        baseAttack: 5,
      },
      scaleHealthBarBackgroundImageByY: 0.8,
    });

    this.#activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetFrame: 0,
        currentLevel: 5,
        currentHp: 25,
        maxHp: 25,
        attackIds: [],
        baseAttack: 5,
      },
    });

    this.#battleMenu = new BattleMenu(this);
    this.#battleMenu.showMainBattleMenu();

    this.#cursorKeys = {
      esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      ...this.input.keyboard.createCursorKeys(),
    };

    this.#activeEnemyMonster.takeDamage(15, () => {
      this.#activePlayerMonster.takeDamage(15, () => {
        console.log(this.#activeEnemyMonster.isFainted);
      });
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
