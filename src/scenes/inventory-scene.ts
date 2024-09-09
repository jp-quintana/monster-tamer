import { INVENTORY_ASSET_KEYS, UI_ASSET_KEYS } from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { NineSlice } from '../utils/nine-slice';
import { BaseScene } from './base-scene';
import { SCENE_KEYS } from './scene-keys';

export interface InventoryItem {
  name: string;
  description: string;
  quantity: number;
  gameObjects: {
    itemName?: Phaser.GameObjects.Text;
    quantity?: Phaser.GameObjects.Text;
    quantitySign?: Phaser.GameObjects.Text;
  };
}

const CANCEL_TEXT_DESCRIPTION = 'Close your bag, and go back to adventuring!';

const INVENTORY_ITEM_POSITION = Object.freeze({
  x: 50,
  y: 14,
  space: 50,
});

const INVENTORY_TEXT_STYLE = Object.freeze({
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: '#000000',
  fontSize: '30px',
});

export class InventoryScene extends BaseScene {
  private sceneData: { previousSceneName: SCENE_KEYS };
  private nineSliceMainContainer: NineSlice;
  private selectedInventoryDescriptionText: Phaser.GameObjects.Text;
  private userInputCursor: Phaser.GameObjects.Image;
  private inventory: InventoryItem[];
  private selectedInventoryOptionIndex: number;

  constructor() {
    super({ key: SCENE_KEYS.INVENTORY_SCENE });
  }

  init(data: any) {
    super.init(data);

    this.sceneData = data;
    this.nineSliceMainContainer = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND],
    });

    this.inventory = [
      {
        name: 'potion',
        description:
          'A basic healing item that will heal 30 HP from a single monster',
        quantity: 10,
        gameObjects: {},
      },
    ];

    this.selectedInventoryOptionIndex = 0;
  }

  create() {
    super.create();

    this.add
      .image(0, 0, INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND)
      .setOrigin(0);
    this.add
      .image(40, 120, INVENTORY_ASSET_KEYS.INVENTORY_BAG)
      .setOrigin(0)
      .setScale(0.5);

    const container = this.nineSliceMainContainer
      .createNineSliceContainer(this, 700, 360, UI_ASSET_KEYS.MENU_BACKGROUND)
      .setPosition(300, 20);
    const titleContainer = this.nineSliceMainContainer
      .createNineSliceContainer(this, 240, 64, UI_ASSET_KEYS.MENU_BACKGROUND)
      .setPosition(64, 20);

    const containerBackground = this.add
      .rectangle(4, 4, 692, 352, 0xffff88)
      .setOrigin(0)
      .setAlpha(0.6);
    container.add(containerBackground);

    const titleContainerBackground = this.add
      .rectangle(4, 4, 232, 56, 0xffff88)
      .setOrigin(0)
      .setAlpha(0.6);
    titleContainer.add(titleContainerBackground);

    const textTitle = this.add
      .text(116, 28, 'Items', INVENTORY_TEXT_STYLE)
      .setOrigin(0.5);
    titleContainer.add(textTitle);

    // create inventory text from available items
    this.inventory.forEach((item, i) => {
      const itemText = this.add.text(
        INVENTORY_ITEM_POSITION.x,
        INVENTORY_ITEM_POSITION.y + i * INVENTORY_ITEM_POSITION.space,
        item.name,
        INVENTORY_TEXT_STYLE
      );
      titleContainer.add(textTitle);
      const qty1Text = this.add.text(
        620,
        INVENTORY_ITEM_POSITION.y + i * INVENTORY_ITEM_POSITION.space + 2,
        'x',
        {
          color: '#000000',
          fontSize: '30px',
          fontStyle: 'bold',
        }
      );
      titleContainer.add(textTitle);
      const qty2Text = this.add.text(
        650,
        INVENTORY_ITEM_POSITION.y + i * INVENTORY_ITEM_POSITION.space,
        `${item.quantity}`,
        INVENTORY_TEXT_STYLE
      );
      container.add([itemText, qty1Text, qty2Text]);
      item.gameObjects = {
        itemName: itemText,
        quantity: qty2Text,
        quantitySign: qty1Text,
      };
    });

    // create cancel text
    const cancelText = this.add.text(
      INVENTORY_ITEM_POSITION.x,
      INVENTORY_ITEM_POSITION.y +
        this.inventory.length * INVENTORY_ITEM_POSITION.space,
      'Cancel',
      INVENTORY_TEXT_STYLE
    );
    container.add(cancelText);

    // create player input cursor
    this.userInputCursor = this.add
      .image(30, 30, UI_ASSET_KEYS.CURSOR)
      .setScale(3);

    container.add(this.userInputCursor);

    // create inventory description text
    this.selectedInventoryDescriptionText = this.add.text(25, 420, '', {
      ...INVENTORY_TEXT_STYLE,
      ...{
        wordWrap: {
          width: this.scale.width - 18,
        },
      },
      color: '#ffffff',
    });

    this.updateItemDescriptionText();
  }

  private updateItemDescriptionText() {
    if (this.isCancelButtonSelected()) {
      this.selectedInventoryDescriptionText.setText(CANCEL_TEXT_DESCRIPTION);
      return;
    }

    this.selectedInventoryDescriptionText.setText(
      this.inventory[this.selectedInventoryOptionIndex].description
    );
  }

  private isCancelButtonSelected() {
    return this.selectedInventoryOptionIndex === this.inventory.length;
  }
}
