import { TITLE_ASSET_KEYS, UI_ASSET_KEYS } from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { DIRECTION } from '../common/direction';
import { Controls } from '../utils/controls';
import { exhaustiveGuard } from '../utils/guard';
import { NineSlice } from '../utils/nine-slice';
import { SCENE_KEYS } from './scene-keys';

const MENU_BACKGROUND_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle =
  Object.freeze({
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: '#4D4A49',
    fontSize: '30px',
  });

const PLAYER_INPUT_CURSOR_POSITION = Object.freeze({
  x: 150,
  // y: 41,
});

const enum MAIN_MENU_OPTIONS {
  NEW_GAME = 'NEW_GAME',
  CONTINUE = 'CONTINUE',
  OPTIONS = 'OPTIONS',
}
export class TitleScene extends Phaser.Scene {
  private mainMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
  private controls: Controls;
  private selectedMenuOption: MAIN_MENU_OPTIONS;
  private newGameText: Phaser.GameObjects.Text;
  private continueText: Phaser.GameObjects.Text;
  private optionsText: Phaser.GameObjects.Text;
  private isContinueButtonEnabled: boolean;
  private nineSliceMenu: NineSlice;

  constructor() {
    super({
      key: SCENE_KEYS.TITLE_SCENE,
    });
  }

  init() {
    this.nineSliceMenu = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKey: UI_ASSET_KEYS.MENU_BACKGROUND,
    });
  }

  create() {
    this.selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
    this.isContinueButtonEnabled = false;
    // create title scene background
    this.add
      .image(0, 0, TITLE_ASSET_KEYS.BACKGROUND)
      .setOrigin(0)
      .setScale(0.58);
    this.add
      .image(this.scale.width / 2, 150, TITLE_ASSET_KEYS.PANEL)
      .setScale(0.25, 0.25)
      .setAlpha(0.5);
    this.add
      .image(this.scale.width / 2, 150, TITLE_ASSET_KEYS.TITLE)
      .setScale(0.55)
      .setAlpha(0.5);

    // create menu
    const menuBgWidth = 500;
    // TODO: replace with a nineslice image

    const menuBgContainer = this.nineSliceMenu.createNineSliceContainer(
      this,
      menuBgWidth,
      200
    );

    this.newGameText = this.add
      .text(menuBgWidth / 2, 40, 'New Game', MENU_BACKGROUND_TEXT_STYLE)
      .setOrigin(0.5);

    this.continueText = this.add
      .text(menuBgWidth / 2, 90, 'Continue', MENU_BACKGROUND_TEXT_STYLE)
      .setOrigin(0.5);

    if (!this.isContinueButtonEnabled) {
      this.continueText.setAlpha(0.5);
    }
    this.optionsText = this.add
      .text(menuBgWidth / 2, 140, 'Options', MENU_BACKGROUND_TEXT_STYLE)
      .setOrigin(0.5);
    const menuContainer = this.add.container(0, 0, [
      menuBgContainer,
      this.newGameText,
      this.continueText,
      this.optionsText,
    ]);
    menuContainer.setPosition(this.scale.width / 2 - menuBgWidth / 2, 300);

    // create cursor

    this.mainMenuCursorPhaserImageGameObject = this.add
      .image(
        PLAYER_INPUT_CURSOR_POSITION.x,
        // PLAYER_INPUT_CURSOR_POSITION.y,
        this.newGameText.y,
        UI_ASSET_KEYS.CURSOR
      )
      .setOrigin(0.5)
      .setScale(2.5);

    menuBgContainer.add(this.mainMenuCursorPhaserImageGameObject);

    this.tweens.add({
      delay: 0,
      duration: 500,
      repeat: -1,
      x: {
        from: PLAYER_INPUT_CURSOR_POSITION.x,
        start: PLAYER_INPUT_CURSOR_POSITION.x,
        to: PLAYER_INPUT_CURSOR_POSITION.x + 3,
      },
      targets: this.mainMenuCursorPhaserImageGameObject,
    });

    // add in fade effects
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        if (this.selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME) {
          this.scene.start(SCENE_KEYS.WORLD_SCENE);
          return;
        }
      }
    );

    this.controls = new Controls(this);
  }

  update() {
    if (this.controls.isInputLocked) return;

    const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();
    if (wasSpaceKeyPressed) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.controls.lockInput = true;
      return;
    }

    const selectedDirection = this.controls.getDirectionKeyJustPressed();
    if (selectedDirection !== DIRECTION.NONE) {
      this.moveMenuSelectCursor(selectedDirection);
    }
  }

  private moveMenuSelectCursor(direction: DIRECTION) {
    this.updateSelectedMenuOptionFromInput(direction);
    switch (this.selectedMenuOption) {
      case MAIN_MENU_OPTIONS.NEW_GAME:
        this.mainMenuCursorPhaserImageGameObject.setY(this.newGameText.y);
        break;
      case MAIN_MENU_OPTIONS.CONTINUE:
        this.mainMenuCursorPhaserImageGameObject.setY(this.continueText.y);
        break;
      case MAIN_MENU_OPTIONS.OPTIONS:
        this.mainMenuCursorPhaserImageGameObject.setY(this.optionsText.y);

        break;
      default:
        exhaustiveGuard(this.selectedMenuOption);
    }
  }

  private updateSelectedMenuOptionFromInput(direction: DIRECTION) {
    switch (direction) {
      case DIRECTION.UP:
        if (this.selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME) return;
        if (this.selectedMenuOption === MAIN_MENU_OPTIONS.CONTINUE) {
          this.selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
          return;
        }
        if (this.isContinueButtonEnabled) {
          this.selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE;
        } else {
          this.selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
        }
        return;
      case DIRECTION.DOWN:
        if (this.selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS) return;
        if (this.selectedMenuOption === MAIN_MENU_OPTIONS.CONTINUE) {
          this.selectedMenuOption = MAIN_MENU_OPTIONS.OPTIONS;
          return;
        }
        if (this.isContinueButtonEnabled) {
          this.selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE;
        } else {
          this.selectedMenuOption = MAIN_MENU_OPTIONS.OPTIONS;
        }
        return;
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(direction);
    }
  }
}
