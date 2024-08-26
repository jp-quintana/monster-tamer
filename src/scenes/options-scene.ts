import { UI_ASSET_KEYS } from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { DIRECTION } from '../common/direction';
import {
  BATTLE_SCENE_OPTIONS,
  BATTLE_STYLE_OPTIONS,
  COLOR_OPTIONS,
  OPTION_MENU_OPTIONS,
  SOUND_OPTIONS,
  TEXT_SPEED_OPTIONS,
  VOLUME_OPTIONS,
} from '../common/options';
import { Controls } from '../utils/controls';
import { exhaustiveGuard } from '../utils/guard';
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

const enum TEXT_FONT_COLORS {
  NOT_SELECTED = '#FFFFFF',
  SELECTED = '#FF2222',
}

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
  private leftMenuColorWhiteCursor: Phaser.GameObjects.Image;
  private rightMenuColorWhiteCursor: Phaser.GameObjects.Image;
  private infoContainer: Phaser.GameObjects.Container;
  private selectedOptionInfoMessageTextGameObject: Phaser.GameObjects.Text;
  private optionsMenuCursor: Phaser.GameObjects.Rectangle;
  private controls: Controls;
  private selectedOptionMenu: OPTION_MENU_OPTIONS;
  private selectedTextSpeedOption: TEXT_SPEED_OPTIONS;
  private selectedBattleSceneOption: BATTLE_SCENE_OPTIONS;
  private selectedBattleStyleOption: BATTLE_STYLE_OPTIONS;
  private selectedSoundMenuOption: SOUND_OPTIONS;
  private selectedVolumeOption: VOLUME_OPTIONS;
  private selectedMenuColorOption: COLOR_OPTIONS;

  constructor() {
    super({ key: SCENE_KEYS.OPTIONS_SCENE });
  }

  init() {
    this.nineSliceMainContainer = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKey: UI_ASSET_KEYS.MENU_BACKGROUND,
    });

    this.selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;

    this.selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID;
    this.selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.ON;
    this.selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SHIFT;
    this.selectedSoundMenuOption = SOUND_OPTIONS.ON;
    this.selectedVolumeOption = 4;
    this.selectedMenuColorOption = 0;
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
      this.add.text(420, 75, TEXT_SPEED_OPTIONS.SLOW, OPTIONS_TEXT_STYLE),
      this.add.text(590, 75, TEXT_SPEED_OPTIONS.MID, OPTIONS_TEXT_STYLE),
      this.add.text(760, 75, TEXT_SPEED_OPTIONS.FAST, OPTIONS_TEXT_STYLE),
    ]);

    // create battle scene options
    this.battleSceneOptionTextGameObjects = this.add.group([
      this.add.text(420, 130, BATTLE_SCENE_OPTIONS.ON, OPTIONS_TEXT_STYLE),
      this.add.text(590, 130, BATTLE_SCENE_OPTIONS.OFF, OPTIONS_TEXT_STYLE),
    ]);

    // create battle style options
    this.battleStyleOptionTextGameObjects = this.add.group([
      this.add.text(420, 185, BATTLE_STYLE_OPTIONS.SET, OPTIONS_TEXT_STYLE),
      this.add.text(590, 185, BATTLE_STYLE_OPTIONS.SHIFT, OPTIONS_TEXT_STYLE),
    ]);

    // create sound options
    this.soundOptionTextGameObjects = this.add.group([
      this.add.text(420, 240, SOUND_OPTIONS.ON, OPTIONS_TEXT_STYLE),
      this.add.text(590, 240, SOUND_OPTIONS.OFF, OPTIONS_TEXT_STYLE),
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

    this.leftMenuColorWhiteCursor = this.add
      .image(530, 352, UI_ASSET_KEYS.CURSOR_WHITE)
      .setOrigin(1, 0)
      .setScale(2.5)
      .setFlipX(true);

    this.rightMenuColorWhiteCursor = this.add
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

    this.updateTextSpeedOptionGameObjects();
    this.updateBattleSceneOptionGameObjects();
    this.updateBattleStyleOptionGameObjects();
    this.updateSoundOptionGameObjects();
    this.updateVolumeOptionSlider();
    this.updateMenuColorDisplayText();
    this.controls = new Controls(this);

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start(SCENE_KEYS.TITLE_SCENE);
      }
    );
  }

  update() {
    if (this.controls.isInputLocked) return;

    if (this.controls.wasEscKeyPressed()) {
      this.controls.lockInput = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      return;
    }

    if (
      this.controls.wasSpaceKeyPressed() &&
      this.selectedOptionMenu === OPTION_MENU_OPTIONS.CONFIRM
    ) {
      this.controls.lockInput = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      return;
    }

    const selectedDirection = this.controls.getDirectionKeyJustPressed();

    if (selectedDirection !== DIRECTION.NONE) {
      this.moveOptionMenuCursor(selectedDirection);
    }
  }

  private moveOptionMenuCursor(direction: DIRECTION) {
    if (direction === DIRECTION.NONE) return;

    this.updateSelectedOptionMenuFromInput(direction);

    switch (this.selectedOptionMenu) {
      case OPTION_MENU_OPTIONS.TEXT_SPEED:
        this.optionsMenuCursor.setY(70);
        break;
      case OPTION_MENU_OPTIONS.BATTLE_SCENE:
        this.optionsMenuCursor.setY(125);
        break;
      case OPTION_MENU_OPTIONS.BATTLE_STYLE:
        this.optionsMenuCursor.setY(180);
        break;
      case OPTION_MENU_OPTIONS.SOUND:
        this.optionsMenuCursor.setY(235);
        break;
      case OPTION_MENU_OPTIONS.VOLUME:
        this.optionsMenuCursor.setY(290);
        break;
      case OPTION_MENU_OPTIONS.MENU_COLOR:
        this.optionsMenuCursor.setY(345);
        break;
      case OPTION_MENU_OPTIONS.CONFIRM:
        this.optionsMenuCursor.setY(400);
        break;
      default:
        exhaustiveGuard(this.selectedOptionMenu);
    }

    this.selectedOptionInfoMessageTextGameObject.setText(
      OPTION_MENU_OPTION_INFO_MESSAGE[this.selectedOptionMenu]
    );
  }

  private updateSelectedOptionMenuFromInput(direction: DIRECTION) {
    if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.TEXT_SPEED) {
      switch (direction) {
        case DIRECTION.UP:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.CONFIRM;
          break;
        case DIRECTION.DOWN:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE;
          break;
        case DIRECTION.RIGHT:
        case DIRECTION.LEFT:
          this.updateTextSpeedOption(direction);
          this.updateTextSpeedOptionGameObjects();
          break;
        case DIRECTION.NONE:
          break;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.BATTLE_SCENE) {
      switch (direction) {
        case DIRECTION.UP:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;
          break;
        case DIRECTION.DOWN:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_STYLE;
          break;
        case DIRECTION.RIGHT:
        case DIRECTION.LEFT:
          this.updateBattleSceneOption(direction);
          this.updateBattleSceneOptionGameObjects();
          break;
        case DIRECTION.NONE:
          break;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.BATTLE_STYLE) {
      switch (direction) {
        case DIRECTION.UP:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE;
          break;
        case DIRECTION.DOWN:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.SOUND;
          break;
        case DIRECTION.RIGHT:
        case DIRECTION.LEFT:
          this.updateBattleStyleOption(direction);
          this.updateBattleStyleOptionGameObjects();
          break;
        case DIRECTION.NONE:
          break;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.SOUND) {
      switch (direction) {
        case DIRECTION.UP:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_STYLE;
          break;
        case DIRECTION.DOWN:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.VOLUME;
          break;
        case DIRECTION.RIGHT:
        case DIRECTION.LEFT:
          this.updateSoundOption(direction);
          this.updateSoundOptionGameObjects();
          break;
        case DIRECTION.NONE:
          break;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.VOLUME) {
      switch (direction) {
        case DIRECTION.UP:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.SOUND;
          break;
        case DIRECTION.DOWN:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.MENU_COLOR;
          break;
        case DIRECTION.RIGHT:
        case DIRECTION.LEFT:
          this.updateVolumeOption(direction);
          console.log(this.selectedVolumeOption);
          this.updateVolumeOptionSlider();
          break;
        case DIRECTION.NONE:
          break;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.MENU_COLOR) {
      switch (direction) {
        case DIRECTION.UP:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.VOLUME;
          break;
        case DIRECTION.DOWN:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.CONFIRM;
          break;
        case DIRECTION.RIGHT:
        case DIRECTION.LEFT:
          this.updateMenuColorOption(direction);
          this.updateMenuColorDisplayText();
          break;
        case DIRECTION.NONE:
          break;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.CONFIRM) {
      switch (direction) {
        case DIRECTION.UP:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.MENU_COLOR;
          break;
        case DIRECTION.DOWN:
          this.selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;
          break;
        case DIRECTION.RIGHT:
        case DIRECTION.LEFT:
        case DIRECTION.NONE:
          break;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    exhaustiveGuard(this.selectedOptionMenu);
  }

  private updateTextSpeedOption(direction: DIRECTION.LEFT | DIRECTION.RIGHT) {
    if (direction === DIRECTION.LEFT) {
      switch (this.selectedTextSpeedOption) {
        case TEXT_SPEED_OPTIONS.SLOW:
          break;
        case TEXT_SPEED_OPTIONS.MID:
          this.selectedTextSpeedOption = TEXT_SPEED_OPTIONS.SLOW;
          break;
        case TEXT_SPEED_OPTIONS.FAST:
          this.selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID;
          break;
        default:
          exhaustiveGuard(this.selectedTextSpeedOption);
      }
      return;
    }

    if (direction === DIRECTION.RIGHT) {
      switch (this.selectedTextSpeedOption) {
        case TEXT_SPEED_OPTIONS.SLOW:
          this.selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID;
          break;
        case TEXT_SPEED_OPTIONS.MID:
          this.selectedTextSpeedOption = TEXT_SPEED_OPTIONS.FAST;
          break;
        case TEXT_SPEED_OPTIONS.FAST:
          break;
        default:
          exhaustiveGuard(this.selectedTextSpeedOption);
      }
      return;
    }

    exhaustiveGuard(direction);
  }

  private updateTextSpeedOptionGameObjects() {
    (
      this.textSpeedOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[]
    ).forEach((obj) => {
      obj.setColor(
        obj.text === this.selectedTextSpeedOption
          ? TEXT_FONT_COLORS.SELECTED
          : TEXT_FONT_COLORS.NOT_SELECTED
      );
    });
  }

  private updateBattleSceneOption(direction: DIRECTION.LEFT | DIRECTION.RIGHT) {
    if (direction === DIRECTION.LEFT) {
      switch (this.selectedBattleSceneOption) {
        case BATTLE_SCENE_OPTIONS.OFF:
          this.selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.ON;
          break;
        case BATTLE_SCENE_OPTIONS.ON:
          break;
        default:
          exhaustiveGuard(this.selectedBattleSceneOption);
      }
      return;
    }

    if (direction === DIRECTION.RIGHT) {
      switch (this.selectedBattleSceneOption) {
        case BATTLE_SCENE_OPTIONS.OFF:
          break;
        case BATTLE_SCENE_OPTIONS.ON:
          this.selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.OFF;
          break;
        default:
          exhaustiveGuard(this.selectedBattleSceneOption);
      }
      return;
    }

    exhaustiveGuard(direction);
  }

  private updateBattleSceneOptionGameObjects() {
    (
      this.battleSceneOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[]
    ).forEach((obj) => {
      obj.setColor(
        obj.text === this.selectedBattleSceneOption
          ? TEXT_FONT_COLORS.SELECTED
          : TEXT_FONT_COLORS.NOT_SELECTED
      );
    });
  }

  private updateBattleStyleOption(direction: DIRECTION.LEFT | DIRECTION.RIGHT) {
    if (direction === DIRECTION.LEFT) {
      switch (this.selectedBattleStyleOption) {
        case BATTLE_STYLE_OPTIONS.SET:
          break;
        case BATTLE_STYLE_OPTIONS.SHIFT:
          this.selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SET;
          break;
        default:
          exhaustiveGuard(this.selectedBattleStyleOption);
      }
      return;
    }

    if (direction === DIRECTION.RIGHT) {
      switch (this.selectedBattleStyleOption) {
        case BATTLE_STYLE_OPTIONS.SET:
          this.selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SHIFT;
          break;
        case BATTLE_STYLE_OPTIONS.SHIFT:
          break;
        default:
          exhaustiveGuard(this.selectedBattleStyleOption);
      }
      return;
    }

    exhaustiveGuard(direction);
  }

  private updateBattleStyleOptionGameObjects() {
    (
      this.battleStyleOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[]
    ).forEach((obj) => {
      obj.setColor(
        obj.text === this.selectedBattleStyleOption
          ? TEXT_FONT_COLORS.SELECTED
          : TEXT_FONT_COLORS.NOT_SELECTED
      );
    });
  }

  private updateSoundOption(direction: DIRECTION.LEFT | DIRECTION.RIGHT) {
    if (direction === DIRECTION.LEFT) {
      switch (this.selectedSoundMenuOption) {
        case SOUND_OPTIONS.ON:
          break;
        case SOUND_OPTIONS.OFF:
          this.selectedSoundMenuOption = SOUND_OPTIONS.ON;
          break;
        default:
          exhaustiveGuard(this.selectedSoundMenuOption);
      }
      return;
    }

    if (direction === DIRECTION.RIGHT) {
      switch (this.selectedSoundMenuOption) {
        case SOUND_OPTIONS.ON:
          this.selectedSoundMenuOption = SOUND_OPTIONS.OFF;
          break;
        case SOUND_OPTIONS.OFF:
          break;
        default:
          exhaustiveGuard(this.selectedSoundMenuOption);
      }
      return;
    }

    exhaustiveGuard(direction);
  }
  private updateSoundOptionGameObjects() {
    (
      this.soundOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[]
    ).forEach((obj) => {
      obj.setColor(
        obj.text === this.selectedSoundMenuOption
          ? TEXT_FONT_COLORS.SELECTED
          : TEXT_FONT_COLORS.NOT_SELECTED
      );
    });
  }

  private updateVolumeOption(direction: DIRECTION.LEFT | DIRECTION.RIGHT) {
    if (direction === DIRECTION.LEFT) {
      if (this.selectedVolumeOption === 0) return;

      this.selectedVolumeOption--;

      return;
    }

    if (direction === DIRECTION.RIGHT) {
      if (this.selectedVolumeOption === 4) return;

      this.selectedVolumeOption++;

      return;
    }

    exhaustiveGuard(direction);
  }

  private updateVolumeOptionSlider() {
    this.volumeOptionsMenuCursor.setX(420 + this.selectedVolumeOption * 72.5);
    this.volumeOptionsValueText.setText(`${this.selectedVolumeOption * 25}%`);
  }

  private updateMenuColorOption(direction: DIRECTION.LEFT | DIRECTION.RIGHT) {
    if (direction === DIRECTION.LEFT) {
      if (this.selectedMenuColorOption === 0) return;

      this.selectedMenuColorOption--;

      return;
    }

    if (direction === DIRECTION.RIGHT) {
      if (this.selectedMenuColorOption === 2) return;

      this.selectedMenuColorOption++;

      return;
    }

    exhaustiveGuard(direction);
  }
  private updateMenuColorDisplayText() {
    switch (this.selectedMenuColorOption) {
      case 0:
        this.leftMenuColorWhiteCursor.setAlpha(0);
        this.selectedMenuColor.setText('1');
        break;
      case 1:
        this.leftMenuColorWhiteCursor.setAlpha(1);
        this.rightMenuColorWhiteCursor.setAlpha(1);
        this.selectedMenuColor.setText('2');
        break;
      case 2:
        this.rightMenuColorWhiteCursor.setAlpha(0);
        this.selectedMenuColor.setText('3');
        break;
      default:
        exhaustiveGuard(this.selectedMenuColorOption);
        break;
    }
    return;
  }
}
