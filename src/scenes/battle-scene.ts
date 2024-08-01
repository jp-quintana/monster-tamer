import { MONSTER_ASSET_KEYS } from '../assets/asset-keys.ts';
import { Background } from '../battle/background.ts';
import { EnemyBattleMonster } from '../battle/monsters/enemy-battle-monster.ts';
import { PlayerBattleMonster } from '../battle/monsters/player-battle-monster.ts';
import { BattleMenu } from '../battle/ui/menu/battle-menu.ts';
import { DIRECTION } from '../common/direction.ts';
import { StateMachine } from '../utils/state-machine.ts';
import { SCENE_KEYS } from './scene-keys.ts';

const enum BATTLE_STATES {
  INTRO = 'INTRO',
  PRE_BATTLE_INFO = 'PRE_BATTLE_INFO',
  BRING_OUT_MONSTER = 'BRING_OUT_MONSTER',
  PLAYER_INPUT = 'PLAYER_INPUT',
  ENEMY_INPUT = 'ENEMY_INPUT',
  BATTLE = 'BATTLE',
  POST_ATTACK_CHECK = 'POST_ATTACK_CHECK',
  FINISHED = 'FINISHED',
  FLEE_ATEMPT = 'FLEE_ATEMPT',
}

export class BattleScene extends Phaser.Scene {
  private battleMenu: BattleMenu;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys & {
    esc: Phaser.Input.Keyboard.Key;
  };
  private activeEnemyMonster: EnemyBattleMonster;
  private activePlayerMonster: PlayerBattleMonster;
  private activePlayerAttackIndex: number;
  private battleStateMachine: StateMachine;

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
        baseAttack: 25,
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

    this.createBattleStateMachine();

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
    this.battleStateMachine.update();
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
      this.battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.esc)) {
      this.battleMenu.handlePlayerInput('CANCEL');
      return;
    }
    let selectedDirection: DIRECTION = DIRECTION.NONE;
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
    if (this.activePlayerMonster.isFainted) {
      this.postBattleSequenceCheck();
      return;
    }
    this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
      [
        `${this.activePlayerMonster.name} used ${
          this.activePlayerMonster.attacks[this.activePlayerAttackIndex].name
        }`,
      ],
      () => {
        this.time.delayedCall(500, () => {
          this.activeEnemyMonster.takeDamage(
            this.activePlayerMonster.baseAttack,
            () => {
              this.enemyAttack();
            }
          );
        });
      }
    );
  }

  private enemyAttack() {
    if (this.activeEnemyMonster.isFainted) {
      this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
      return;
    }

    this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
      [
        `foe ${this.activeEnemyMonster.name} used ${this.activeEnemyMonster.attacks[0].name}`,
      ],
      () => {
        this.time.delayedCall(500, () => {
          this.activePlayerMonster.takeDamage(
            this.activeEnemyMonster.baseAttack,
            () => {
              this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
            }
          );
        });
      }
    );
  }

  private postBattleSequenceCheck() {
    if (this.activeEnemyMonster.isFainted) {
      this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
        [
          `Wild ${this.activeEnemyMonster.name} fainted`,
          'You have gained some experience',
        ],
        () => {
          this.battleStateMachine.setState(BATTLE_STATES.FINISHED);
        }
      );
      return;
    }

    if (this.activePlayerMonster.isFainted) {
      this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
        [
          `${this.activePlayerMonster.name} fainted`,
          'You have no more monsters, escaping to safety...',
        ],
        () => {
          this.battleStateMachine.setState(BATTLE_STATES.FINISHED);
        }
      );
      return;
    }

    this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
  }

  private transitionToNextScene() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start(SCENE_KEYS.BATTLE_SCENE);
      }
    );
  }

  private createBattleStateMachine() {
    this.battleStateMachine = new StateMachine('battle');
    this.battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        // wait for any scene setup and transitions to complete
        this.time.delayedCall(500, () => {
          this.battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO);
        });
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE_INFO,
      onEnter: () => {
        // wait for enemy monster to appear on screen and notify player about the wild monster
        this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
          [`wild ${this.activeEnemyMonster.name} appeared`],
          () => {
            // wait for text animation to complete and move to next state
            this.time.delayedCall(500, () => {
              this.battleStateMachine.setState(BATTLE_STATES.BRING_OUT_MONSTER);
            });
          }
        );
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.BRING_OUT_MONSTER,
      onEnter: () => {
        // wait for player monster to appear on screen and notify the player about the monster
        this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
          [`go ${this.activePlayerMonster.name}!`],
          () => {
            // wait for text animation to complete and move to next state
            this.time.delayedCall(500, () => {
              this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
            });
          }
        );
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.PLAYER_INPUT,
      onEnter: () => {
        this.battleMenu.showMainBattleMenu();
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.ENEMY_INPUT,
      onEnter: () => {
        // TODO: add feature in a future update
        // pick random move for enemy monster and in the future implement some type of AI behavior
        this.battleStateMachine.setState(BATTLE_STATES.BATTLE);
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.BATTLE,
      onEnter: () => {
        // general battle flow
        // show attack used, brief pause
        // then play attack animation, brief pause
        // then play damage animation, brief pause
        // then play health bar animation, brief pause
        // then repeat the steps above for the other monster

        this.playerAttack();
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.POST_ATTACK_CHECK,
      onEnter: () => {
        this.postBattleSequenceCheck();
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.FINISHED,
      onEnter: () => {
        this.transitionToNextScene();
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.FLEE_ATEMPT,
      onEnter: () => {
        this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
          ['You got away safely!'],
          () => {
            this.battleStateMachine.setState(BATTLE_STATES.FINISHED);
          }
        );
      },
    });

    this.battleStateMachine.setState(BATTLE_STATES.INTRO);
  }
}
