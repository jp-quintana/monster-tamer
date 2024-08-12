import { WORLD_ASSET_KEYS } from '../assets/asset-keys';
import { DIRECTION } from '../common/direction';
import {
  TILE_SIZE,
  TILED_COLLISION_LAYER_ALPHA,
  TILED_ENCOUNTER_LAYER_ALPHA,
} from '../config';
import { Coordinate } from '../types';
import { Controls } from '../utils/controls';
import { Player } from '../world/characters/player';
import { SCENE_KEYS } from './scene-keys';

const PLAYER_POSITION: Coordinate = Object.freeze({
  x: 6 * TILE_SIZE,
  y: 21 * TILE_SIZE,
});

export class WorldScene extends Phaser.Scene {
  private player: Player;
  private controls: Controls;

  constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
    });
  }

  create() {
    this.cameras.main.setBounds(0, 0, 1280, 2176);
    this.cameras.main.setZoom(0.8);

    const x = 6 * TILE_SIZE;
    const y = 22 * TILE_SIZE;
    this.cameras.main.centerOn(x, y);

    const map = this.make.tilemap({ key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL });
    const collisionTiles = map.addTilesetImage(
      'collision',
      WORLD_ASSET_KEYS.WORLD_COLLISION
    );
    if (!collisionTiles) {
      console.log(
        `Encountered error while creating collision tileset using data from tiled`
      );
      return;
    }

    const collisionLayer = map.createLayer('Collision', collisionTiles, 0, 0);
    if (!collisionLayer) {
      console.log(
        `Encountered error while creating collision layer using data from tiled`
      );
      return;
    }

    collisionLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);

    const encounterLayer = map.createLayer('Encounter', collisionTiles, 0, 0);
    if (!encounterLayer) {
      console.log(
        `Encountered error while creating collision layer using data from tiled`
      );
      return;
    }

    encounterLayer.setAlpha(TILED_ENCOUNTER_LAYER_ALPHA).setDepth(2);

    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);

    this.player = new Player({
      scene: this,
      position: PLAYER_POSITION,
      direction: DIRECTION.DOWN,
      collisionLayer,
    });

    this.cameras.main.startFollow(this.player.sprite);

    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);

    this.controls = new Controls(this);

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update(time: DOMHighResTimeStamp) {
    const selectedDirection = this.controls.getDirectionKeyPressedDown();

    if (selectedDirection !== DIRECTION.NONE) {
      this.player.moveCharacter(selectedDirection);
    }

    this.player.update(time);
  }
}
