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

export class OptionsScene extends Phaser.Scene {
  private mainContainer: Phaser.GameObjects.Container;
  private nineSliceMainContainer: NineSlice;
  private textSpeedOptionTextGameObjects: Phaser.GameObjects.Group;
  private battleSceneOptionTextGameObjects: Phaser.GameObjects.Group;
  private battleStyleOptionTextGameObjects: Phaser.GameObjects.Group;
  private soundOptionTextGameObjects: Phaser.GameObjects.Group;

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
    // frame options
    // options
  }
}
