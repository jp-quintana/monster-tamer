import { TITLE_ASSET_KEYS, UI_ASSET_KEYS } from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { SCENE_KEYS } from './scene-keys';

const MENU_BACKGROUND_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle =
  Object.freeze({
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: '#4D4A49',
    fontSize: '30px',
  });

const PLAYER_INPUT_CURSOR_POSITION = Object.freeze({
  x: 150,
});
export class TitleScene extends Phaser.Scene {
  private mainMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;

  constructor() {
    super({
      key: SCENE_KEYS.TITLE_SCENE,
    });
  }

  create() {
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
    const menuBg = this.add
      // .image(130, 0, UI_ASSET_KEYS.MENU_BACKGROUND)
      .image(125, 0, UI_ASSET_KEYS.MENU_BACKGROUND)
      .setOrigin(0)
      .setScale(2.4);

    const menuBgContainer = this.add.container(0, 0, [menuBg]);

    const newGameText = this.add
      .text(menuBgWidth / 2, 40, 'New Game', MENU_BACKGROUND_TEXT_STYLE)
      .setOrigin(0.5);

    const continueText = this.add
      .text(menuBgWidth / 2, 90, 'Continue', MENU_BACKGROUND_TEXT_STYLE)
      .setOrigin(0.5);

    const optionsText = this.add
      .text(menuBgWidth / 2, 140, 'Options', MENU_BACKGROUND_TEXT_STYLE)
      .setOrigin(0.5);
    const menuContainer = this.add.container(0, 0, [
      menuBgContainer,
      newGameText,
      continueText,
      optionsText,
    ]);
    menuContainer.setPosition(this.scale.width / 2 - menuBgWidth / 2, 300);

    // create cursor
    this.mainMenuCursorPhaserImageGameObject = this.add
      .image(PLAYER_INPUT_CURSOR_POSITION.x, 41, UI_ASSET_KEYS.CURSOR)
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
  }
}
