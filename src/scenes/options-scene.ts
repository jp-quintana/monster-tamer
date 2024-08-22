import { UI_ASSET_KEYS } from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { NineSlice } from '../utils/nine-slice';
import { SCENE_KEYS } from './scene-keys';

const OPTIONS_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle =
  Object.freeze({
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: '#FFFFFF',
    fontSize: '30px',
  });

const OPTION_MENU_OPTION_INFO_MESSAGE = Object.freeze({
  TEXT_SPEED: 'Choose one of three text display speeds.',
  BATTLE_SCENE: 'Choose to display battle animations',
  BATTLE_STYLE: 'Choose to allow your monster to be recalled between rounds.',
  SOUND: 'Choose to enable or disable the sound.',
  VOLUME: 'Choose the volume for the music and sound effects for the game.',
  MENU_COLOR: 'Choose one of the three menu color options.',
  CONFIRM: 'Save your changes and go back to the main menu.',
});

export class OptionsScene extends Phaser.Scene {
  private mainContainer: Phaser.GameObjects.Container;
  private nineSliceMainContainer: NineSlice;
  private textSpeedOptionTextGameObjects: Phaser.GameObjects.Group;
  private battleSceneOptionTextGameObjects: Phaser.GameObjects.Group;
  private battleStyleOptionTextGameObjects: Phaser.GameObjects.Group;
  private soundOptionTextGameObjects: Phaser.GameObjects.Group;
  private volumeOptionsMenuCursor: Phaser.GameObjects.Rectangle;
  private volumeOptionsValueText: Phaser.GameObjects.Text;
  private selectedMenuColor: Phaser.GameObjects.Text;
  private infoContainer: Phaser.GameObjects.Container;
  private selectedOptionInfoMessageTextGameObject: Phaser.GameObjects.Text;
  private optionsMenuCursor: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: SCENE_KEYS.OPTIONS_SCENE });
  }

  init() {
    this.nineSliceMainContainer = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKey: UI_ASSET_KEYS.MENU_BACKGROUND,
    });
  }

  create() {
    const { width, height } = this.scale;

    // main options container
    const optionMenuWidth = width - 200;
    this.mainContainer = this.nineSliceMainContainer.createNineSliceContainer(
      this,
      optionMenuWidth,
      432
    );

    this.mainContainer.setX(100).setY(20);

    // create main option sections
    this.add.text(width / 2, 40, 'Options', OPTIONS_TEXT_STYLE).setOrigin(0.5);
    const menuOptionsPosition = { x: 25, yStart: 55, yIncrement: 55 };
    const menuOptions = [
      'Text Speed',
      'Battle Scene',
      'Battle Style',
      'Sound',
      'Volume',
      'Menu Color',
      'Close',
    ];

    menuOptions.forEach((option, index) => {
      const x = menuOptionsPosition.x;
      const y =
        menuOptionsPosition.yStart + menuOptionsPosition.yIncrement * index;

      const textGameObject = this.add.text(x, y, option, OPTIONS_TEXT_STYLE);
      this.mainContainer.add(textGameObject);
    });

    // create text speed options
    this.textSpeedOptionTextGameObjects = this.add.group([
      this.add.text(420, 75, 'Slow', OPTIONS_TEXT_STYLE),
      this.add.text(590, 75, 'Mid', OPTIONS_TEXT_STYLE),
      this.add.text(760, 75, 'Fast', OPTIONS_TEXT_STYLE),
    ]);

    // create battle scene options
    this.battleSceneOptionTextGameObjects = this.add.group([
      this.add.text(420, 130, 'On', OPTIONS_TEXT_STYLE),
      this.add.text(590, 130, 'Off', OPTIONS_TEXT_STYLE),
    ]);

    // create battle style options
    this.battleSceneOptionTextGameObjects = this.add.group([
      this.add.text(420, 185, 'Set', OPTIONS_TEXT_STYLE),
      this.add.text(590, 185, 'Shift', OPTIONS_TEXT_STYLE),
    ]);

    // create sound options
    this.soundOptionTextGameObjects = this.add.group([
      this.add.text(420, 240, 'On', OPTIONS_TEXT_STYLE),
      this.add.text(590, 240, 'Off', OPTIONS_TEXT_STYLE),
    ]);

    // volume options
    this.add.rectangle(420, 312, 300, 4, 0xffffff, 1).setOrigin(0, 0.5);
    this.volumeOptionsMenuCursor = this.add
      .rectangle(710, 312, 10, 25, 0xff2222, 1)
      .setOrigin(0, 0.5);
    this.volumeOptionsValueText = this.add.text(
      760,
      295,
      '100%',
      OPTIONS_TEXT_STYLE
    );

    // frame options
    this.selectedMenuColor = this.add.text(590, 350, '', OPTIONS_TEXT_STYLE);

    this.add
      .image(530, 352, UI_ASSET_KEYS.CURSOR_WHITE)
      .setOrigin(1, 0)
      .setScale(2.5)
      .setFlipX(true);

    this.add
      .image(660, 352, UI_ASSET_KEYS.CURSOR_WHITE)
      .setOrigin(0, 0)
      .setScale(2.5);

    // option details container
    this.infoContainer = this.nineSliceMainContainer.createNineSliceContainer(
      this,
      optionMenuWidth,
      100
    );
    this.infoContainer.setX(100).setY(height - 110);
    this.selectedOptionInfoMessageTextGameObject = this.add.text(
      125,
      480,
      OPTION_MENU_OPTION_INFO_MESSAGE.TEXT_SPEED,
      {
        ...OPTIONS_TEXT_STYLE,
        wordWrap: { width: width - 250 },
      }
    );

    this.optionsMenuCursor = this.add
      .rectangle(110, 70, optionMenuWidth - 20, 40, 0xfffff, 0)
      .setOrigin(0)
      .setStrokeStyle(4, 0xe4434a, 1);
  }
}
