import { MONSTER_ASSET_KEYS } from '../assets/asset-keys.ts';
import { Background } from '../battle/background.ts';
import { EnemyBattleMonster } from '../battle/monsters/enemy-battle-monster.ts';
import { PlayerBattleMonster } from '../battle/monsters/player-battle-monster.ts';
import { BattleMenu } from '../battle/ui/menu/battle-menu.ts';
import { DIRECTION } from '../common/direction.ts';
import { SCENE_KEYS } from './scene-keys.ts';

export class BattleScene extends Phaser.Scene {
  private battleMenu: BattleMenu;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys & {
    esc: Phaser.Input.Keyboard.Key;
  };
  private activeEnemyMonster: EnemyBattleMonster;
  private activePlayerMonster: PlayerBattleMonster;
  private activePlayerAttackIndex: number;

  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  init() {
    this.activePlayerAttackIndex = -1;
  }

  create() {
    const background = new Background(this);
    background.showForest();

    // render out the player and enemy monsters
    this.activeEnemyMonster = new EnemyBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.CARNODUSK,
        assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
        assetFrame: 0,
        currentLevel: 5,
        currentHp: 25,
        maxHp: 25,
        attackIds: [1],
        baseAttack: 5,
      },
      scaleHealthBarBackgroundImageByY: 0.8,
    });

    this.activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetFrame: 0,
        currentLevel: 5,
        currentHp: 25,
        maxHp: 25,
        attackIds: [2],
        baseAttack: 5,
      },
    });

    this.battleMenu = new BattleMenu(this, this.activePlayerMonster);
    this.battleMenu.showMainBattleMenu();

    if (this.input.keyboard) {
      this.cursorKeys = {
        esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
        ...this.input.keyboard.createCursorKeys(),
      };
    }

    // this.activeEnemyMonster.takeDamage(15, () => {
    //   this.activePlayerMonster.takeDamage(15, () => {
    //     console.log(this.activeEnemyMonster.isFainted);
    //   });
    // });
  }

  update() {
    // true only once and then goes back to false
    const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(
      this.cursorKeys.space
    );
    // true while held down
    // console.log(this.cursorKeys.space.isDown);

    if (wasSpaceKeyPressed) {
      this.battleMenu.handlePlayerInput('OK');

      // check if player selected an attack, and update display text
      if (this.battleMenu.selectedAttack === undefined) return;

      this.activePlayerAttackIndex = this.battleMenu.selectedAttack;

      if (!this.activePlayerMonster.attacks[this.activePlayerAttackIndex]) {
        return;
      }

      this.battleMenu.hideMonsterAttackSubMenu();
      this.handleBattleSequence();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.esc)) {
      this.battleMenu.handlePlayerInput('CANCEL');
      return;
    }
    /** @type {import('../common/direction.js').Direction}  */
    let selectedDirection = DIRECTION.NONE;
    if (this.cursorKeys.left.isDown) {
      selectedDirection = DIRECTION.LEFT;
    } else if (this.cursorKeys.right.isDown) {
      selectedDirection = DIRECTION.RIGHT;
    } else if (this.cursorKeys.up.isDown) {
      selectedDirection = DIRECTION.UP;
    } else if (this.cursorKeys.down.isDown) {
      selectedDirection = DIRECTION.DOWN;
    }

    if (selectedDirection !== DIRECTION.NONE)
      this.battleMenu.handlePlayerInput(selectedDirection);
  }

  private handleBattleSequence() {
    // general battle flow
    // show attack used, brief pause
    // then play attack animation, brief pause
    // then play damage animation, brief pause
    // then play health bar animation, brief pause
    // then repeat the steps above for the other monster

    this.playerAttack();
  }

  private playerAttack() {
    this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
      [
        `${this.activePlayerMonster.name} used ${
          this.activePlayerMonster.attacks[this.activePlayerAttackIndex].name
        }`,
      ],
      () => {
        this.time.delayedCall(500, () => {
          this.activeEnemyMonster.takeDamage(20, () => {
            this.enemyAttack();
          });
        });
      }
    );
  }

  private enemyAttack() {
    this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
      [
        `foe ${this.activeEnemyMonster.name} used ${this.activeEnemyMonster.attacks[0].name}`,
      ],
      () => {
        this.time.delayedCall(500, () => {
          this.activePlayerMonster.takeDamage(20, () => {
            this.battleMenu.showMainBattleMenu();
          });
        });
      }
    );
  }
}
