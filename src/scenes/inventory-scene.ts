import { INVENTORY_ASSET_KEYS, UI_ASSET_KEYS } from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { NineSlice } from '../utils/nine-slice';
import { BaseScene } from './base-scene';
import { SCENE_KEYS } from './scene-keys';

const INVENTORY_TEXT_STYLE = Object.freeze({
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: '#000000',
  fontSize: '30px',
});

export class InventoryScene extends BaseScene {
  private sceneData: { previousSceneName: SCENE_KEYS };
  private nineSliceMainContainer: NineSlice;

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
  }
}
