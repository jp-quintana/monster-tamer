import { WORLD_ASSET_KEYS } from '../assets/asset-keys';
import { DIRECTION } from '../common/direction';
import {
  TILE_SIZE,
  TILED_COLLISION_LAYER_ALPHA,
  TILED_ENCOUNTER_LAYER_ALPHA,
} from '../config';
import { Controls } from '../utils/controls';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager';
import { Player } from '../world/characters/player';
import { SCENE_KEYS } from './scene-keys';

export class WorldScene extends Phaser.Scene {
  private player: Player;
  private controls: Controls;
  private encounterLayer: Phaser.Tilemaps.TilemapLayer | null;
  private wildMonsterEncountered: boolean;

  constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
    });
  }

  init() {
    this.wildMonsterEncountered = false;
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

    const encounterTiles = map.addTilesetImage(
      'encounter',
      WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE
    );
    if (!encounterTiles) {
      console.log(
        `Encountered error while creating collision tileset using data from tiled`
      );
      return;
    }

    this.encounterLayer = map.createLayer('Encounter', encounterTiles, 0, 0);
    if (!this.encounterLayer) {
      console.log(
        `Encountered error while creating collision layer using data from tiled`
      );
      return;
    }

    this.encounterLayer.setAlpha(TILED_ENCOUNTER_LAYER_ALPHA).setDepth(2);

    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);

    this.player = new Player({
      scene: this,
      position: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION),
      direction: dataManager.store.get(
        DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION
      ),
      collisionLayer,
      spriteGridMovementFinishedCallback: () => {
        this.handlePlayerMovementUpdate();
      },
    });

    this.cameras.main.startFollow(this.player.sprite);

    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);

    this.controls = new Controls(this);

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update(time: DOMHighResTimeStamp) {
    if (this.wildMonsterEncountered) {
      this.player.update(time);
      return;
    }

    const selectedDirection = this.controls.getDirectionKeyPressedDown();

    if (selectedDirection !== DIRECTION.NONE) {
      this.player.moveCharacter(selectedDirection);
    }

    this.player.update(time);
  }

  private handlePlayerMovementUpdate() {
    const { x, y } = this.player.sprite;

    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
      x,
      y,
    });

    dataManager.store.set(
      DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,
      this.player.direction
    );

    if (!this.encounterLayer) return;

    const isInEncounterZone =
      this.encounterLayer.getTileAtWorldXY(x, y, true).index !== -1;

    if (!isInEncounterZone) return;

    console.log('Player is in a encounter zone');

    this.wildMonsterEncountered = Math.random() < 0.9;

    if (this.wildMonsterEncountered) {
      console.log('Player encountered a wild monster');
      this.cameras.main.fadeOut(1000);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          this.scene.start(SCENE_KEYS.BATTLE_SCENE);
        }
      );
    }
  }
}
