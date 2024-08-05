import {
  MONSTER_ASSET_KEYS,
  UI_ASSET_KEYS,
} from '../../../assets/asset-keys.js';
import { DIRECTION } from '../../../common/direction.ts';
import { exhaustiveGuard } from '../../../utils/guard.ts';
import { BATTLE_UI_TEXT_STYLE } from './battle-menu-config.js';
import {
  ACTIVE_BATTLE_MENU,
  ATTACK_MOVE_OPTIONS,
  BATTLE_MENU_OPTIONS,
} from './battle-menu-options.ts';
import { BattleMonster } from '../../monsters/battle-monster.js';
import { animateText } from '../../../utils/text-utils.ts';
import { SKIP_BATTLE_ANIMATIONS } from '../../../config.ts';

const BATTLE_MENU_CURSOR_POS = Object.freeze({
  x: 42,
  y: 38,
});

const ATTACK_MOVE_CURSOR_POS = Object.freeze({
  x: 42,
  y: 38,
});

const PLAYER_INPUT_CURSOR_POSITION = Object.freeze({
  y: 488,
});

export class BattleMenu {
  private scene: Phaser.Scene;
  private mainBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
  private moveSelectionSubBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
  private battleTextGameObjectLine1: Phaser.GameObjects.Text;
  private battleTextGameObjectLine2: Phaser.GameObjects.Text;
  private mainBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
  private attackBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
  private selectedBattleMenuOption: BATTLE_MENU_OPTIONS;
  private selectedAttackMenuOption: ATTACK_MOVE_OPTIONS;
  private activeBattleMenu: ACTIVE_BATTLE_MENU;
  private queuedInfoPanelMessages: string[];
  private queuedInfoPanelCallback: undefined | (() => void);
  private waitingForPlayerInput: boolean;
  private selectedAttackIndex: number | undefined;
  private activePlayerMonster: BattleMonster;
  private userInputCursorPhaserImageGameObject: Phaser.GameObjects.Image;
  private userInputCursorPhaserTween: Phaser.Tweens.Tween;
  private queuedMessagesSkipAnimation: boolean;
  private queuedAnimationPlaying: boolean;

  constructor(scene: Phaser.Scene, activePlayerMonster: BattleMonster) {
    this.scene = scene;
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.activePlayerMonster = activePlayerMonster;
    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
    this.queuedInfoPanelCallback = undefined;
    this.queuedInfoPanelMessages = [];
    this.waitingForPlayerInput = false;
    this.selectedAttackIndex = undefined;
    this.queuedMessagesSkipAnimation = false;
    this.queuedAnimationPlaying = false;
    this.createMainInfoPane();
    this.createMainBattleMenu();
    this.createMonsterAttackSubMenu();
    this.createPlayerInputCursor();
  }

  get selectedAttack(): number | undefined {
    if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return this.selectedAttackIndex;
    }

    return undefined;
  }

  showMainBattleMenu() {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.battleTextGameObjectLine1.setText('what should');
    this.mainBattleMenuPhaserContainerGameObject.setAlpha(1);
    this.battleTextGameObjectLine1.setAlpha(1);
    this.battleTextGameObjectLine2.setAlpha(1);

    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
      BATTLE_MENU_CURSOR_POS.x,
      BATTLE_MENU_CURSOR_POS.y
    );
    this.selectedAttackIndex = undefined;
  }

  hideMainBattleMenu() {
    this.mainBattleMenuPhaserContainerGameObject.setAlpha(0);
    this.battleTextGameObjectLine1.setAlpha(0);
    this.battleTextGameObjectLine2.setAlpha(0);
  }

  showMonsterAttackSubMenu() {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
    this.moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(1);
  }

  hideMonsterAttackSubMenu() {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(0);
  }

  playInputCursorAnimation() {
    this.userInputCursorPhaserImageGameObject.setPosition(
      this.battleTextGameObjectLine1.displayWidth +
        this.userInputCursorPhaserImageGameObject.displayWidth * 2.7,
      this.userInputCursorPhaserImageGameObject.y
    );
    this.userInputCursorPhaserImageGameObject.setAlpha(1);
    this.userInputCursorPhaserTween.restart();
  }

  hideInputCursor() {
    this.userInputCursorPhaserImageGameObject.setAlpha(0);
    this.userInputCursorPhaserTween.pause();
  }

  handlePlayerInput(input: DIRECTION | 'OK' | 'CANCEL') {
    if (this.queuedAnimationPlaying && input === 'OK') return;
    if (this.waitingForPlayerInput) {
      if (input === 'OK' || input === 'CANCEL') {
        this.updateInfoPaneWithMessage();
        return;
      }
    } else {
      if (input === 'CANCEL') {
        this.switchToMainBattleMenu();
        return;
      }

      if (input === 'OK') {
        if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
          this.handlePlayerChooseMainBattleOption();

          return;
        }
        if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
          this.handlePlayerChooseAttack();
          return;
        }
        return;
      }

      if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
        this.updatSelectedBattleMenuOptionFromInput(input);
        this.moveMainBattleCursor();
        return;
      }

      if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
        this.updateSelectedMoveMenuOptionFromInput(input);
        this.moveMoveSelectBattleMenuCursor();
        return;
      }
    }
  }

  private createMainBattleMenu() {
    this.battleTextGameObjectLine1 = this.scene.add.text(
      20,
      468,
      'what should',
      BATTLE_UI_TEXT_STYLE
    );

    // TODO: update to use monster data that is passed into this class instance
    this.battleTextGameObjectLine2 = this.scene.add.text(
      20,
      512,
      `${this.activePlayerMonster.name} do next?`,
      BATTLE_UI_TEXT_STYLE
    );

    this.mainBattleMenuCursorPhaserImageGameObject = this.scene.add
      .image(
        BATTLE_MENU_CURSOR_POS.x,
        BATTLE_MENU_CURSOR_POS.y,
        UI_ASSET_KEYS.CURSOR,
        0
      )
      .setOrigin(0.5)
      .setScale(2.5);

    this.mainBattleMenuPhaserContainerGameObject = this.scene.add.container(
      520,
      448,
      [
        this.createMainInfoSubPane(),
        this.scene.add.text(
          55,
          22,
          BATTLE_MENU_OPTIONS.FIGHT,
          BATTLE_UI_TEXT_STYLE
        ),
        this.scene.add.text(
          240,
          22,
          BATTLE_MENU_OPTIONS.SWITCH,
          BATTLE_UI_TEXT_STYLE
        ),
        this.scene.add.text(
          55,
          70,
          BATTLE_MENU_OPTIONS.ITEM,
          BATTLE_UI_TEXT_STYLE
        ),
        this.scene.add.text(
          240,
          70,
          BATTLE_MENU_OPTIONS.FLEE,
          BATTLE_UI_TEXT_STYLE
        ),
        this.mainBattleMenuCursorPhaserImageGameObject,
      ]
    );

    this.hideMainBattleMenu();
  }

  updateInfoPanelMessagesNoInputRequired(
    message: string,
    callback?: () => void,
    skipAnimation = false
  ) {
    this.battleTextGameObjectLine1.setText('').setAlpha(1);

    if (skipAnimation) {
      this.battleTextGameObjectLine1.setText(message);
      this.waitingForPlayerInput = false;

      if (callback) callback();
      return;
    }

    animateText(this.scene, this.battleTextGameObjectLine1, message, {
      delay: 50,
      callback: () => {
        this.waitingForPlayerInput = false;
        if (callback) callback();
      },
    });
  }

  updateInfoPanelMessagesAndWaitForInput(
    messages: string[],
    callback?: () => void,
    skipAnimation = false
  ) {
    this.queuedInfoPanelMessages = messages;
    this.queuedInfoPanelCallback = callback;
    this.queuedMessagesSkipAnimation = skipAnimation;

    this.updateInfoPaneWithMessage();
  }

  private updateInfoPaneWithMessage() {
    this.waitingForPlayerInput = false;
    this.battleTextGameObjectLine1.setText('').setAlpha(1);

    this.hideInputCursor();

    // check if all messages have been displayed from the queue and call the callback
    if (this.queuedInfoPanelMessages.length === 0) {
      if (this.queuedInfoPanelCallback) {
        this.queuedInfoPanelCallback();
        this.queuedInfoPanelCallback = undefined;
      }
      return;
    }

    const messageToDisplay = this.queuedInfoPanelMessages.shift();

    if (this.queuedMessagesSkipAnimation) {
      this.battleTextGameObjectLine1.setText(messageToDisplay as string);
      this.queuedAnimationPlaying = false;
      this.waitingForPlayerInput = true;
      this.playInputCursorAnimation();
      return;
    }

    this.queuedAnimationPlaying = true;
    animateText(
      this.scene,
      this.battleTextGameObjectLine1,
      messageToDisplay as string,
      {
        delay: 50,
        callback: () => {
          this.playInputCursorAnimation();
          this.waitingForPlayerInput = true;
          this.queuedAnimationPlaying = false;
        },
      }
    );
  }

  private createMonsterAttackSubMenu() {
    this.attackBattleMenuCursorPhaserImageGameObject = this.scene.add
      .image(
        ATTACK_MOVE_CURSOR_POS.x,
        ATTACK_MOVE_CURSOR_POS.y,
        UI_ASSET_KEYS.CURSOR,
        0
      )
      .setOrigin(0.5)
      .setScale(2.5);

    const attackNames: string[] = [];
    for (let i = 0; i < 4; i++) {
      attackNames.push(this.activePlayerMonster.attacks[i]?.name || '-');
    }

    this.moveSelectionSubBattleMenuPhaserContainerGameObject =
      this.scene.add.container(0, 448, [
        this.scene.add.text(55, 22, attackNames[0], BATTLE_UI_TEXT_STYLE),
        this.scene.add.text(240, 22, attackNames[1], BATTLE_UI_TEXT_STYLE),
        this.scene.add.text(55, 70, attackNames[2], BATTLE_UI_TEXT_STYLE),
        this.scene.add.text(240, 70, attackNames[3], BATTLE_UI_TEXT_STYLE),
        this.attackBattleMenuCursorPhaserImageGameObject,
      ]);

    this.hideMonsterAttackSubMenu();
  }

  private createMainInfoPane() {
    const padding = 4;
    const rectHeight = 124;
    this.scene.add
      .rectangle(
        padding,
        this.scene.scale.height - rectHeight - padding,
        this.scene.scale.width - padding * 2,
        rectHeight,
        0xede4f3,
        1
      )
      .setOrigin(0)
      .setStrokeStyle(8, 0xe4434a, 1);
  }

  private createMainInfoSubPane() {
    const rectWidth = 500;
    const rectHeight = 124;
    return this.scene.add
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

  private updatSelectedBattleMenuOptionFromInput(direction: DIRECTION) {
    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
          return;
        case DIRECTION.DOWN:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
          return;
        case DIRECTION.DOWN:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
      switch (direction) {
        case DIRECTION.UP:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
          return;
        case DIRECTION.RIGHT:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
      switch (direction) {
        case DIRECTION.UP:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
          return;
        case DIRECTION.LEFT:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    exhaustiveGuard(this.selectedBattleMenuOption);
  }

  private moveMainBattleCursor() {
    switch (this.selectedBattleMenuOption) {
      case BATTLE_MENU_OPTIONS.FIGHT:
        this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
          BATTLE_MENU_CURSOR_POS.x,
          BATTLE_MENU_CURSOR_POS.y
        );
        return;
      case BATTLE_MENU_OPTIONS.SWITCH:
        this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
          228,
          BATTLE_MENU_CURSOR_POS.y
        );
        return;
      case BATTLE_MENU_OPTIONS.ITEM:
        this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
          BATTLE_MENU_CURSOR_POS.x,
          86
        );
        return;
      case BATTLE_MENU_OPTIONS.FLEE:
        this.mainBattleMenuCursorPhaserImageGameObject.setPosition(228, 86);
        return;
      default:
        exhaustiveGuard(this.selectedBattleMenuOption);
    }
  }

  private updateSelectedMoveMenuOptionFromInput(direction: DIRECTION) {
    if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_1) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
          return;
        case DIRECTION.DOWN:
          this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_2) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
          return;
        case DIRECTION.DOWN:
          this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_3) {
      switch (direction) {
        case DIRECTION.UP:
          this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
          return;
        case DIRECTION.RIGHT:
          this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
          return;
        case DIRECTION.DOWN:
        case DIRECTION.LEFT:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_4) {
      switch (direction) {
        case DIRECTION.UP:
          this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
          return;
        case DIRECTION.LEFT:
          this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
          return;
        case DIRECTION.DOWN:
        case DIRECTION.RIGHT:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    exhaustiveGuard(this.selectedAttackMenuOption);
  }

  private moveMoveSelectBattleMenuCursor() {
    switch (this.selectedAttackMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
          ATTACK_MOVE_CURSOR_POS.x,
          ATTACK_MOVE_CURSOR_POS.y
        );
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
          228,
          ATTACK_MOVE_CURSOR_POS.y
        );
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_3:
        this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
          ATTACK_MOVE_CURSOR_POS.x,
          86
        );
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        this.attackBattleMenuCursorPhaserImageGameObject.setPosition(228, 86);
        return;
      default:
        exhaustiveGuard(this.selectedAttackMenuOption);
    }
  }

  private switchToMainBattleMenu() {
    this.waitingForPlayerInput = false;
    this.hideInputCursor();
    this.hideMonsterAttackSubMenu();
    this.showMainBattleMenu();
  }

  private handlePlayerChooseMainBattleOption() {
    this.hideMainBattleMenu();

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
      this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
      this.showMonsterAttackSubMenu();
      return;
    }

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
      this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_ITEM;
      this.updateInfoPanelMessagesAndWaitForInput(
        ['Your bag is empty...'],
        () => {
          this.switchToMainBattleMenu();
        },
        SKIP_BATTLE_ANIMATIONS
      );
      return;
    }

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
      this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_SWITCH;
      this.updateInfoPanelMessagesAndWaitForInput(
        ['Your have no other monsters in your party...'],
        () => {
          this.switchToMainBattleMenu();
        },
        SKIP_BATTLE_ANIMATIONS
      );
      return;
    }

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
      this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_FLEE;
      this.updateInfoPanelMessagesAndWaitForInput(
        ['Your fail to run away...'],
        () => {
          this.switchToMainBattleMenu();
        },
        SKIP_BATTLE_ANIMATIONS
      );
      return;
    }

    exhaustiveGuard(this.selectedBattleMenuOption);
  }

  private handlePlayerChooseAttack() {
    // this.hideMonsterAttackSubMenu();
    let selectedMoveIndex = 0;
    switch (this.selectedAttackMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        selectedMoveIndex = 0;
        break;
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        selectedMoveIndex = 1;
        break;
      case ATTACK_MOVE_OPTIONS.MOVE_3:
        selectedMoveIndex = 2;
        break;
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        selectedMoveIndex = 3;
        break;
      default:
        exhaustiveGuard(this.selectedAttackMenuOption);
    }

    this.selectedAttackIndex = selectedMoveIndex;
  }

  private createPlayerInputCursor() {
    this.userInputCursorPhaserImageGameObject = this.scene.add.image(
      0,
      0,
      UI_ASSET_KEYS.CURSOR
    );
    this.userInputCursorPhaserImageGameObject.setAngle(90).setScale(2.5, 1.25);
    this.userInputCursorPhaserImageGameObject.setAlpha(0);

    this.userInputCursorPhaserTween = this.scene.add.tween({
      delay: 0,
      duration: 500,
      repeat: -1,
      y: {
        from: PLAYER_INPUT_CURSOR_POSITION.y,
        start: PLAYER_INPUT_CURSOR_POSITION.y,
        to: PLAYER_INPUT_CURSOR_POSITION.y + 6,
      },
      targets: this.userInputCursorPhaserImageGameObject,
    });
    this.userInputCursorPhaserTween.pause();
  }
}
