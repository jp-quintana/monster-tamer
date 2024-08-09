import { WORLD_ASSET_KEYS } from '../assets/asset-keys';
import { DIRECTION } from '../common/direction';
import { TILE_SIZE } from '../config';
import { Coordinate } from '../types';
import { Controls } from '../utils/controls';
import { Player } from '../world/characters/player';
import { SCENE_KEYS } from './scene-keys';

const PLAYER_POSITION: Coordinate = Object.freeze({
  x: 1 * TILE_SIZE,
  y: 0 * TILE_SIZE,
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
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);

    this.player = new Player({
      scene: this,
      position: PLAYER_POSITION,
      direction: DIRECTION.DOWN,
    });

    this.controls = new Controls(this);
  }

  update(time: DOMHighResTimeStamp) {
    const selectedDirection = this.controls.getDirectionKeyPressedDown();

    if (selectedDirection !== DIRECTION.NONE) {
      this.player.moveCharacter(selectedDirection);
    }

    this.player.update(time);
  }
}
