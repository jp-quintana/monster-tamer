import { INVENTORY_ASSET_KEYS, UI_ASSET_KEYS } from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { DIRECTION } from '../common/direction';
import { InventoryItem, Item } from '../types';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager';
import { exhaustiveGuard } from '../utils/guard';
import { NineSlice } from '../utils/nine-slice';
import { BaseScene } from './base-scene';
import { SCENE_KEYS } from './scene-keys';

export interface InventoryItemWithGameObjects extends InventoryItem {
  gameObjects: {
    itemName?: Phaser.GameObjects.Text;
    quantity?: Phaser.GameObjects.Text;
    quantitySign?: Phaser.GameObjects.Text;
  };
}

export interface InventorySceneData {
  previousSceneName: SCENE_KEYS;
}
export interface SceneWasResumedData {
  itemUsed: boolean;
}
export interface InventorySceneItemUsedData {
  itemUsed: boolean;
  item?: Item;
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
  private sceneData: InventorySceneData;
  private sceneWasResumedData: SceneWasResumedData;
  private nineSliceMainContainer: NineSlice;
  private selectedInventoryDescriptionText: Phaser.GameObjects.Text;
  private userInputCursor: Phaser.GameObjects.Image;
  private inventory: InventoryItemWithGameObjects[];
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

    const inventory = dataManager.getInventory(this);

    this.inventory = inventory.map((inventoryItem) => {
      return {
        item: inventoryItem.item,
        quantity: inventoryItem.quantity,
        gameObjects: {},
      };
    });

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
    this.inventory.forEach((inventoryItem, i) => {
      const itemText = this.add.text(
        INVENTORY_ITEM_POSITION.x,
        INVENTORY_ITEM_POSITION.y + i * INVENTORY_ITEM_POSITION.space,
        inventoryItem.item.name,
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
        `${inventoryItem.quantity}`,
        INVENTORY_TEXT_STYLE
      );
      container.add([itemText, qty1Text, qty2Text]);
      inventoryItem.gameObjects = {
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

  update(time: DOMHighResTimeStamp) {
    super.update(time);

    if (this.controls.isInputLocked) return;

    if (this.controls.wasEscKeyPressed()) {
      this.goBackToPreviousScene(false);
      return;
    }

    const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();
    if (wasSpaceKeyPressed) {
      if (this.isCancelButtonSelected()) {
        this.goBackToPreviousScene(false);
        return;
      }

      // TODO: remove this
      if (this.inventory[this.selectedInventoryOptionIndex].quantity < 1) {
        return;
      }

      this.controls.lockInput = true;
      const sceneDataToPass = {
        previousSceneName: SCENE_KEYS.INVENTORY_SCENE,
        itemSelected: this.inventory[this.selectedInventoryOptionIndex].item,
      };

      this.scene.launch(SCENE_KEYS.MONSTER_PARTY_SCENE, sceneDataToPass);
      this.scene.pause(SCENE_KEYS.INVENTORY_SCENE);
      return;
    }

    const selectedDirection = this.controls.getDirectionKeyJustPressed();

    if (selectedDirection !== DIRECTION.NONE) {
      this.movePlayerInputCursor(selectedDirection);
      this.updateItemDescriptionText();
    }
  }

  private updateItemDescriptionText() {
    if (this.isCancelButtonSelected()) {
      this.selectedInventoryDescriptionText.setText(CANCEL_TEXT_DESCRIPTION);
      return;
    }

    this.selectedInventoryDescriptionText.setText(
      this.inventory[this.selectedInventoryOptionIndex].item.description
    );
  }

  private isCancelButtonSelected() {
    return this.selectedInventoryOptionIndex === this.inventory.length;
  }

  private goBackToPreviousScene(wasItemUsed: boolean, item?: Item) {
    this.controls.lockInput = true;

    const sceneDataToPass: InventorySceneItemUsedData = {
      itemUsed: wasItemUsed,
      item,
    };

    this.scene.stop(SCENE_KEYS.INVENTORY_SCENE);
    this.scene.resume(this.sceneData.previousSceneName, sceneDataToPass);
  }

  private movePlayerInputCursor(direction: DIRECTION) {
    switch (direction) {
      case DIRECTION.UP:
        this.selectedInventoryOptionIndex -= 1;
        if (this.selectedInventoryOptionIndex < 0) {
          this.selectedInventoryOptionIndex = this.inventory.length;
        }
        break;
      case DIRECTION.DOWN:
        this.selectedInventoryOptionIndex += 1;
        if (this.selectedInventoryOptionIndex > this.inventory.length) {
          this.selectedInventoryOptionIndex = 0;
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

    const y = 30 + this.selectedInventoryOptionIndex * 50;

    this.userInputCursor.setY(y);
  }

  handleSceneResume(sys: Phaser.Scenes.Systems, data: SceneWasResumedData) {
    super.handleSceneResume(sys, data);

    if (!data || !data.itemUsed) {
      return;
    }

    const selectedItem = this.inventory[this.selectedInventoryOptionIndex];

    selectedItem.quantity -= 1;
    selectedItem.gameObjects.quantity?.setText(`${selectedItem.quantity}`);
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.INVENTORY, this.inventory);

    // TODO: implement this
    // if (selectedItem.quantity === 0) {
    // }

    if (this.sceneData.previousSceneName === SCENE_KEYS.BATTLE_SCENE) {
      this.goBackToPreviousScene(true, selectedItem.item);
    }
  }
}
