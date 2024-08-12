import { DIRECTION } from '../common/direction';
import { TILE_SIZE } from '../config';

interface GlobalState {
  player: {
    position: {
      x: number;
      y: number;
    };
    direction: DIRECTION;
  };
}

const initialState: GlobalState = {
  player: {
    position: {
      x: 6 * TILE_SIZE,
      y: 21 * TILE_SIZE,
    },
    direction: DIRECTION.DOWN,
  },
};

export const enum DATA_MANAGER_STORE_KEYS {
  PLAYER_POSITION = 'PLAYER_POSITION',
  PLAYER_DIRECTION = 'PLAYER_DIRECTION',
}

class DataManager extends Phaser.Events.EventEmitter {
  #store: Phaser.Data.DataManager;
  constructor() {
    super();
    this.#store = new Phaser.Data.DataManager(this);
    this.updateDataManager(initialState);
  }

  get store() {
    return this.#store;
  }

  private updateDataManager(data: GlobalState) {
    this.store.set({
      [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position,
      [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]: data.player.direction,
    });
  }
}

export const dataManager = new DataManager();
