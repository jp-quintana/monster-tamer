import { WORLD_ASSET_KEYS } from '../assets/asset-keys';
import { DIRECTION } from '../common/direction';
import {
  TILE_SIZE,
  TILED_COLLISION_LAYER_ALPHA,
  TILED_ENCOUNTER_LAYER_ALPHA,
} from '../config';
import { Controls } from '../utils/controls';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager';
import { getTargetPositionFromGameObjectPositionAndDirection } from '../utils/grid-utils';
import { CANNOT_READ_SIGN_TEXT, SAMPLE_TEXT } from '../utils/text-utils';
import { NPC, NPC_MOVEMENT_PATTERN, NPCPath } from '../world/characters/npc';
import { Player } from '../world/characters/player';
import { DialogUi } from '../world/dialog-ui';
import { Menu, MENU_OPTIONS } from '../world/menu/menu';
import { SCENE_KEYS } from './scene-keys';

interface TiledObjectProperty {
  name: string;
  type: string;
  value: any;
}

const enum CUSTOM_TILED_TYPES {
  NPC = 'npc',
  NPC_PATH = 'npc_path',
}

const enum TILED_NPC_PROPERTY {
  IS_SPAWN_POINT = 'is_spawn_point',
  MOVEMENT_PATTERN = 'movement_pattern',
  MESSAGES = 'messages',
  FRAME = 'frame',
}

export class WorldScene extends Phaser.Scene {
  private player: Player;
  private controls: Controls;
  private signLayer: Phaser.Tilemaps.ObjectLayer | null;
  private encounterLayer: Phaser.Tilemaps.TilemapLayer | null;
  private wildMonsterEncountered: boolean;
  private dialogUi: DialogUi;
  private npcs: NPC[];
  private npcPlayerIsInteractingWith: NPC | undefined;
  private menu: Menu;

  constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
    });
  }

  init() {
    this.wildMonsterEncountered = false;
    this.npcPlayerIsInteractingWith = undefined;
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

    // create interactive layer
    this.signLayer = map.getObjectLayer('Sign');
    if (!this.signLayer) {
      console.log(
        `Encountered error while creating sign layer using data from tiled`
      );
      return;
    }

    // create encounter layer
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

    // create npcs
    this.createNPCs(map);

    // create player
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
      spriteChangedDirectionCallback: () => {
        this.handlePlayerDirectionUpdate();
      },
      otherCharactersToCheckForCollisionsWith: this.npcs,
    });

    this.cameras.main.startFollow(this.player.sprite);

    // update our collision with npcs
    this.npcs.forEach((npc) => {
      npc.addCharacterToCheckForCollisionsWith(this.player);
    });

    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);

    this.controls = new Controls(this);

    this.dialogUi = new DialogUi(this, 1280);

    this.menu = new Menu(this);

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update(time: DOMHighResTimeStamp) {
    if (this.wildMonsterEncountered) {
      this.player.update(time);
      return;
    }

    const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();

    const selectedDirectionHeldDown =
      this.controls.getDirectionKeyPressedDown();
    const selectedDirectionJustPressed =
      this.controls.getDirectionKeyJustPressed();

    if (
      selectedDirectionHeldDown !== DIRECTION.NONE &&
      !this.isPlayerInputLocked()
    ) {
      this.player.moveCharacter(selectedDirectionHeldDown);
    }

    if (wasSpaceKeyPressed && !this.player.isMoving && !this.menu.isVisible) {
      this.handlePlayerInteraction();
    }

    if (this.controls.wasEscKeyPressed()) {
      if (this.dialogUi.isVisible) return;
      if (this.menu.isVisible) {
        this.menu.hide();
        return;
      }
      this.menu.show();
      return;
    }

    if (this.menu.isVisible) {
      if (selectedDirectionJustPressed !== DIRECTION.NONE) {
        this.menu.handlePlayerInput(selectedDirectionJustPressed);
        return;
      }

      if (wasSpaceKeyPressed) {
        this.menu.handlePlayerInput('OK');

        switch (this.menu.selectedMenuOption) {
          case MENU_OPTIONS.SAVE:
            dataManager.saveData();
            this.dialogUi.showDialogModal(['Game progress has been saved']);
            this.menu.hide();
            break;
          case MENU_OPTIONS.EXIT:
            this.menu.hide();
            break;
        }
        return;
      }

      if (this.controls.wasEscKeyPressed()) {
        this.menu.hide();
        return;
      }
    }

    this.player.update(time);

    this.npcs.forEach((npc) => {
      npc.update(time);
    });
  }

  private handlePlayerInteraction() {
    if (this.dialogUi.isAnimationPlaying) return;

    if (this.dialogUi.moreMessagesToShow) {
      this.dialogUi.showNextMessage();
      return;
    }

    if (this.dialogUi.isVisible) {
      this.dialogUi.hideDialogModal();
      if (this.npcPlayerIsInteractingWith) {
        this.npcPlayerIsInteractingWith.isTalkingToPlayer = false;
        this.npcPlayerIsInteractingWith = undefined;
      }
      return;
    }

    const { x, y } = this.player.sprite;
    const targetPosition = getTargetPositionFromGameObjectPositionAndDirection(
      { x, y },
      this.player.direction
    );

    const nearbySign = this.signLayer?.objects.find((object) => {
      if (object.x === undefined || object.y === undefined) return;

      return (
        object.x === targetPosition.x &&
        object.y - TILE_SIZE === targetPosition.y
      );
    });

    if (nearbySign) {
      const { properties: props } = nearbySign as {
        properties: TiledObjectProperty[];
      };

      const usePlaceHolderText = this.player.direction !== DIRECTION.UP;

      let textToShow = CANNOT_READ_SIGN_TEXT;
      if (!usePlaceHolderText) {
        textToShow =
          props.find((prop) => prop.name === 'message')?.value || SAMPLE_TEXT;
      }

      this.dialogUi.showDialogModal([textToShow]);
      return;
    }

    const nearbyNpc = this.npcs.find((npc) => {
      return (
        npc.sprite.x === targetPosition.x && npc.sprite.y === targetPosition.y
      );
    });

    if (nearbyNpc) {
      nearbyNpc.facePlayer(this.player.direction);
      this.dialogUi.showDialogModal(nearbyNpc.messages);
      nearbyNpc.isTalkingToPlayer = true;
      this.npcPlayerIsInteractingWith = nearbyNpc;
    }
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

  private isPlayerInputLocked() {
    return (
      this.dialogUi.isVisible ||
      this.menu.isVisible ||
      this.controls.isInputLocked
    );
  }

  private createNPCs(map: Phaser.Tilemaps.Tilemap) {
    this.npcs = [];

    const npcLayers = map
      .getObjectLayerNames()
      .filter((layerName) => layerName.includes('NPC'));

    npcLayers.forEach((layerName) => {
      const layer = map.getObjectLayer(layerName);

      // get npc objects
      const npcObject = layer?.objects.find(
        (obj) => obj.type === CUSTOM_TILED_TYPES.NPC
      );

      if (
        !npcObject ||
        npcObject.x === undefined ||
        npcObject.y === undefined
      ) {
        return;
      }

      const {
        properties: props,
        x,
        y,
      } = npcObject as {
        properties: TiledObjectProperty[];
        x: number;
        y: number;
      };

      // get npc path objects
      const pathObjects = layer?.objects.filter(
        (obj) => obj.type === CUSTOM_TILED_TYPES.NPC_PATH
      );

      const npcPath: NPCPath = {
        0: { x, y: y - TILE_SIZE },
      };

      if (pathObjects) {
        pathObjects.forEach((obj) => {
          if (obj.x === undefined || obj.y === undefined) {
            return;
          }
          npcPath[parseInt(obj.name, 10)] = { x: obj.x, y: obj.y - TILE_SIZE };
        });
      }

      // get npc frame
      const npcFrame =
        props.find((property) => property.name === TILED_NPC_PROPERTY.FRAME)
          ?.value || '0';

      // get npc messages
      const npcMessagesString =
        props.find((property) => property.name === TILED_NPC_PROPERTY.MESSAGES)
          ?.value || '';

      const npcMessages = npcMessagesString.split('::');

      const npcMovement: NPC_MOVEMENT_PATTERN =
        props.find(
          (property) => property.name === TILED_NPC_PROPERTY.MOVEMENT_PATTERN
        )?.value || 'IDLE';

      const npc = new NPC({
        scene: this,
        position: { x, y: y - TILE_SIZE },
        direction: DIRECTION.DOWN,
        frame: parseInt(npcFrame, 10),
        messages: npcMessages,
        npcPath,
        movementPattern: npcMovement,
      });

      this.npcs.push(npc);
    });
  }

  handlePlayerDirectionUpdate() {
    console.log('run');
    dataManager.store.set(
      DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,
      this.player.direction
    );
  }
}
