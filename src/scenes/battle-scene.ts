import { MONSTER_ASSET_KEYS, WORLD_ASSET_KEYS } from '../assets/asset-keys.ts';
import {
  ATTACK_TARGET,
  AttackManager,
} from '../battle/attacks/attack-manager.ts';
import { Background } from '../battle/background.ts';
import { EnemyBattleMonster } from '../battle/monsters/enemy-battle-monster.ts';
import { PlayerBattleMonster } from '../battle/monsters/player-battle-monster.ts';
import { BattleMenu } from '../battle/ui/menu/battle-menu.ts';
import { DIRECTION } from '../common/direction.ts';
import { SKIP_BATTLE_ANIMATIONS } from '../config.ts';
import { Controls } from '../utils/controls.ts';
import { createSceneTransition } from '../utils/scene-transition.ts';
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
  private controls: Controls;
  private activeEnemyMonster: EnemyBattleMonster;
  private activePlayerMonster: PlayerBattleMonster;
  private activePlayerAttackIndex: number;
  private battleStateMachine: StateMachine;
  private attackManager: AttackManager;

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
      skipBattleAnimations: SKIP_BATTLE_ANIMATIONS,
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
        baseAttack: 10,
      },
      skipBattleAnimations: SKIP_BATTLE_ANIMATIONS,
    });

    this.battleMenu = new BattleMenu(this, this.activePlayerMonster);

    this.createBattleStateMachine();

    this.attackManager = new AttackManager(this, SKIP_BATTLE_ANIMATIONS);

    this.controls = new Controls(this);
  }

  update() {
    this.battleStateMachine.update();

    // true only once and then goes back to false
    const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();
    // true while held down
    // console.log(this.cursorKeys.space.isDown);

    if (
      wasSpaceKeyPressed &&
      (this.battleStateMachine.currentStateName ===
        BATTLE_STATES.PRE_BATTLE_INFO ||
        this.battleStateMachine.currentStateName ===
          BATTLE_STATES.POST_ATTACK_CHECK ||
        this.battleStateMachine.currentStateName === BATTLE_STATES.FLEE_ATEMPT)
    ) {
      this.battleMenu.handlePlayerInput('OK');
      return;
    }

    if (this.battleStateMachine.currentStateName !== BATTLE_STATES.PLAYER_INPUT)
      return;

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

    if (this.controls.wasEscKeyPressed()) {
      this.battleMenu.handlePlayerInput('CANCEL');
      return;
    }

    const selectedDirection = this.controls.getDirectionKeyPressedDown();

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
    this.battleMenu.updateInfoPanelMessagesNoInputRequired(
      `${this.activePlayerMonster.name} used ${
        this.activePlayerMonster.attacks[this.activePlayerAttackIndex].name
      }`,
      () => {
        this.time.delayedCall(500, () => {
          this.attackManager.playAttackAnimation(
            this.activePlayerMonster.attacks[this.activePlayerAttackIndex]
              .animationName,
            ATTACK_TARGET.ENEMY,
            () => {
              this.activeEnemyMonster.playTakeDamageAnimation(() =>
                this.activeEnemyMonster.takeDamage(
                  this.activePlayerMonster.baseAttack,
                  () => {
                    this.enemyAttack();
                  }
                )
              );
            }
          );
        });
      },
      SKIP_BATTLE_ANIMATIONS
    );
  }

  private enemyAttack() {
    if (this.activeEnemyMonster.isFainted) {
      this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
      return;
    }

    this.battleMenu.updateInfoPanelMessagesNoInputRequired(
      `foe ${this.activeEnemyMonster.name} used ${this.activeEnemyMonster.attacks[0].name}`,
      () => {
        this.time.delayedCall(500, () => {
          this.attackManager.playAttackAnimation(
            this.activeEnemyMonster.attacks[0].animationName,
            ATTACK_TARGET.PLAYER,
            () => {
              this.activePlayerMonster.playTakeDamageAnimation(() => {
                this.activePlayerMonster.takeDamage(
                  this.activeEnemyMonster.baseAttack,
                  () => {
                    this.battleStateMachine.setState(
                      BATTLE_STATES.POST_ATTACK_CHECK
                    );
                  }
                );
              });
            }
          );
        });
      }
    );
  }

  private postBattleSequenceCheck() {
    if (this.activeEnemyMonster.isFainted) {
      this.activeEnemyMonster.playDeathAnimation(() => {
        this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
          [
            `Wild ${this.activeEnemyMonster.name} fainted`,
            'You have gained some experience',
          ],
          () => {
            this.battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMATIONS
        );
      });
      return;
    }

    if (this.activePlayerMonster.isFainted) {
      this.activePlayerMonster.playDeathAnimation(() => {
        this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
          [
            `${this.activePlayerMonster.name} fainted`,
            'You have no more monsters, escaping to safety...',
          ],
          () => {
            this.battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMATIONS
        );
      });
      return;
    }

    this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
  }

  private transitionToNextScene() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start(SCENE_KEYS.WORLD_SCENE);
      }
    );
  }

  private createBattleStateMachine() {
    this.battleStateMachine = new StateMachine('battle');
    this.battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        // wait for any scene setup and transitions to complete
        createSceneTransition(this, {
          callback: () =>
            this.battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO),
          skipSceneTransition: SKIP_BATTLE_ANIMATIONS,
        });
      },
    });

    // TODO: fix bug when space bar is pressed rapidly
    this.battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE_INFO,
      onEnter: () => {
        // wait for enemy monster to appear on screen and notify player about the wild monster
        this.activeEnemyMonster.playMonsterAppearAnimation(() => {
          this.activeEnemyMonster.playHealthBarAppearAnimation(() => undefined);
          this.battleMenu.updateInfoPanelMessagesAndWaitForInput(
            [`wild ${this.activeEnemyMonster.name} appeared!`],
            () => {
              // wait for text animation to complete and move to next state
              this.time.delayedCall(500, () => {
                this.battleStateMachine.setState(
                  BATTLE_STATES.BRING_OUT_MONSTER
                );
              });
            },
            SKIP_BATTLE_ANIMATIONS
          );
        });
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.BRING_OUT_MONSTER,
      onEnter: () => {
        // wait for player monster to appear on screen and notify the player about the monster
        this.activePlayerMonster.playMonsterAppearAnimation(() => {
          this.activePlayerMonster.playHealthBarAppearAnimation(
            () => undefined
          );
          this.battleMenu.updateInfoPanelMessagesNoInputRequired(
            `go ${this.activePlayerMonster.name}!`,
            () => {
              // wait for text animation to complete and move to next state
              this.time.delayedCall(1200, () => {
                this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
              });
            },
            SKIP_BATTLE_ANIMATIONS
          );
        });
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
          },
          SKIP_BATTLE_ANIMATIONS
        );
      },
    });

    this.battleStateMachine.setState(BATTLE_STATES.INTRO);
  }
}
