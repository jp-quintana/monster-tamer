import {
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
  UI_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { Phaser } from '../lib/phaser.js';
import { SCENE_KEYS } from './scene-keys.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
      // active: true, --> activa scene cuando se crea
    });
  }

  preload() {
    const monsterTamerAssetPath = 'assets/images/monster-tamer';
    const kenneysTamerAssetPath = 'assets/images/kenneys-assets';

    // battle backgrounds
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
      monsterTamerAssetPath + '/battle-backgrounds/forest-background.png'
    );

    // battle assets
    this.load.image(
      BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
      kenneysTamerAssetPath + '/ui-space-expansion/custom-ui.png'
    );

    // health bar assets
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
      kenneysTamerAssetPath +
        '/ui-space-expansion/barHorizontal_green_right.png'
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
      kenneysTamerAssetPath + '/ui-space-expansion/barHorizontal_green_left.png'
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE,
      kenneysTamerAssetPath + '/ui-space-expansion/barHorizontal_green_mid.png'
    );

    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
      kenneysTamerAssetPath +
        '/ui-space-expansion/barHorizontal_shadow_right.png'
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
      kenneysTamerAssetPath +
        '/ui-space-expansion/barHorizontal_shadow_left.png'
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
      kenneysTamerAssetPath + '/ui-space-expansion/barHorizontal_shadow_mid.png'
    );

    // monster assets
    this.load.image(
      MONSTER_ASSET_KEYS.CARNODUSK,
      monsterTamerAssetPath + '/monsters/carnodusk.png'
    );
    this.load.image(
      MONSTER_ASSET_KEYS.IGUANIGNITE,
      monsterTamerAssetPath + '/monsters/iguanignite.png'
    );

    // ui assets
    this.load.image(
      UI_ASSET_KEYS.CURSOR,
      monsterTamerAssetPath + '/ui/cursor.png'
    );
  }
  create() {
    this.scene.start(SCENE_KEYS.BATTLE_SCENE);
  }
}
