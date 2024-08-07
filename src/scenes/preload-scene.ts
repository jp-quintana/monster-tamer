import {
  ATTACK_ASSET_KEYS,
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  DATA_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
  UI_ASSET_KEYS,
  WORLD_ASSET_KEYS,
} from '../assets/asset-keys.ts';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys.ts';
import { WebFontFileLoader } from '../assets/web-font-file-loader.ts';
import { SCENE_KEYS } from './scene-keys.ts';

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
    const pimenAssetPath = 'assets/images/pimen';

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

    // load json data
    this.load.json(DATA_ASSET_KEYS.ATTACKS, 'assets/data/attacks.json');

    // load custom fonts
    this.load.addFile(
      new WebFontFileLoader(this.load, [KENNEY_FUTURE_NARROW_FONT_NAME])
    );

    // load attack assets
    this.load.spritesheet(
      ATTACK_ASSET_KEYS.ICE_SHARD,
      `${pimenAssetPath}/ice-attack/active.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      ATTACK_ASSET_KEYS.ICE_SHARD_START,
      `${pimenAssetPath}/ice-attack/start.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      ATTACK_ASSET_KEYS.SLASH,
      `${pimenAssetPath}/slash.png`,
      {
        frameWidth: 48,
        frameHeight: 48,
      }
    );

    // load world assets
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_BACKGROUND,
      `${monsterTamerAssetPath}/map/level_background.png`
    );
  }

  create() {
    this.scene.start(SCENE_KEYS.WORLD_SCENE);
  }
}
