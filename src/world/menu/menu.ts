import { UI_ASSET_KEYS } from '../../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../../assets/font-keys';
import { DIRECTION } from '../../common/direction';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../../utils/data-manager';
import { exhaustiveGuard } from '../../utils/guard';
import { MENU_COLOR } from './menu-config';

const MENU_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = Object.freeze({
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: '#FFFFFF',
  fontSize: '32px',
});

export const enum MENU_OPTIONS {
  MONSTERDEX = 'MONSTERDEX',
  MONSTERS = 'MONSTERS',
  BAG = 'BAG',
  SAVE = 'SAVE',
  OPTIONS = 'OPTIONS',
  EXIT = 'EXIT',
}

export class Menu {
  private padding: number;
  private width: number;
  private height: number;
  private graphics: Phaser.GameObjects.Graphics;
  private container: Phaser.GameObjects.Container;
  #isVisible: boolean;
  private availableMenuOptions: MENU_OPTIONS[];
  private menuOptionsTextGameObjects: Phaser.GameObjects.Text[];
  private selectedMenuOptionsIndex: number;
  #selectedMenuOption: MENU_OPTIONS;
  private userInputCursor: Phaser.GameObjects.Image;

  constructor(private scene: Phaser.Scene) {
    this.padding = 4;
    this.width = 300;

    this.availableMenuOptions = [MENU_OPTIONS.SAVE, MENU_OPTIONS.EXIT];
    this.menuOptionsTextGameObjects = [];
    this.selectedMenuOptionsIndex = 0;

    // TODO: calculate height based on currently available options
    this.height = 10 + this.padding * 2 + this.availableMenuOptions.length * 50;
    this.graphics = this.createGraphics();
    this.container = this.scene.add.container(0, 0, [this.graphics]);

    // update menu container with menu options
    for (let i = 0; i < this.availableMenuOptions.length; i++) {
      let y = 10 + 50 * i + this.padding;
      const textObj = this.scene.add.text(
        40 + this.padding,
        y,
        this.availableMenuOptions[i],
        MENU_TEXT_STYLE
      );
      this.menuOptionsTextGameObjects.push(textObj);
      this.container.add(textObj);
      this.height += textObj.height;
    }

    // add player input cursor
    this.userInputCursor = this.scene.add.image(
      20 + this.padding,
      28 + this.padding,
      UI_ASSET_KEYS.CURSOR_WHITE
    );
    this.userInputCursor.setScale(2.5);
    this.container.add(this.userInputCursor);

    this.hide();
  }

  get isVisible() {
    return this.#isVisible;
  }

  get selectedMenuOption() {
    return this.#selectedMenuOption;
  }

  show() {
    const { right, top } = this.scene.cameras.main.worldView;
    const startX = right - this.padding * 2 - this.width;
    const startY = top + this.padding * 2;

    this.container.setPosition(startX, startY);
    this.container.setAlpha(1);
    this.#isVisible = true;
  }

  hide() {
    this.container.setAlpha(0);
    this.selectedMenuOptionsIndex = 0;
    this.moveMenuCursor(DIRECTION.NONE);
    this.#isVisible = false;
  }

  handlePlayerInput(input: DIRECTION | 'OK' | 'CANCEL') {
    if (input === 'CANCEL') {
      this.hide();
      return;
    }

    if (input === 'OK') {
      this.handleSelectedMenuOption();
      return;
    }

    this.moveMenuCursor(input);
  }

  private moveMenuCursor(direction: DIRECTION) {
    switch (direction) {
      case DIRECTION.UP:
        if (this.selectedMenuOptionsIndex === 0) {
          this.selectedMenuOptionsIndex = this.availableMenuOptions.length - 1;
        } else {
          this.selectedMenuOptionsIndex--;
        }
        break;
      case DIRECTION.DOWN:
        if (
          this.selectedMenuOptionsIndex ===
          this.availableMenuOptions.length - 1
        ) {
          this.selectedMenuOptionsIndex = 0;
        } else {
          this.selectedMenuOptionsIndex++;
        }
        break;
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
        return;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(direction);
    }

    // const x = 20 + this.padding
    const y = 28 + this.padding + this.selectedMenuOptionsIndex * 50;
    this.userInputCursor.setY(y);
  }

  private handleSelectedMenuOption() {
    this.#selectedMenuOption =
      this.availableMenuOptions[this.selectedMenuOptionsIndex];
  }

  private createGraphics() {
    const g = this.scene.add.graphics();

    const menuColor = this.getMenuColorsFromDataManager();

    g.fillStyle(menuColor.main, 1);
    g.fillRect(1, 0, this.width - 1, this.height - 1);
    g.lineStyle(8, menuColor.border, 1);
    g.strokeRect(0, 0, this.width, this.height);
    g.setAlpha(0.9);
    return g;
  }

  private getMenuColorsFromDataManager() {
    const chosenMenuColor: number = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR
    );

    return MENU_COLOR[chosenMenuColor];
  }
}
