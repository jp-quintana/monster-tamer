import { DIRECTION } from '../common/direction';
import {
  BATTLE_SCENE_OPTIONS,
  BATTLE_STYLE_OPTIONS,
  COLOR_OPTIONS,
  SOUND_OPTIONS,
  TEXT_SPEED_OPTIONS,
  VOLUME_OPTIONS,
} from '../common/options';
import { TILE_SIZE } from '../config';

const LOCAL_STORAGE_KEY = 'MONSTER_TAMER_DATA';

interface GlobalState {
  player: {
    position: {
      x: number;
      y: number;
    };
    direction: DIRECTION;
  };
  options: {
    textSpeed: TEXT_SPEED_OPTIONS;
    battleSceneAnimations: BATTLE_SCENE_OPTIONS;
    battleStyle: BATTLE_STYLE_OPTIONS;
    sound: SOUND_OPTIONS;
    volume: VOLUME_OPTIONS;
    menuColor: COLOR_OPTIONS;
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
  options: {
    textSpeed: TEXT_SPEED_OPTIONS.MID,
    battleSceneAnimations: BATTLE_SCENE_OPTIONS.ON,
    battleStyle: BATTLE_STYLE_OPTIONS.SHIFT,
    sound: SOUND_OPTIONS.ON,
    volume: 4,
    menuColor: 0,
  },
};

export const enum DATA_MANAGER_STORE_KEYS {
  PLAYER_POSITION = 'PLAYER_POSITION',
  PLAYER_DIRECTION = 'PLAYER_DIRECTION',
  OPTIONS_TEXT_SPEED = 'OPTIONS_TEXT_SPEED',
  OPTIONS_BATTLE_SCENE_ANIMATIONS = 'OPTIONS_BATTLE_SCENE_ANIMATIONS',
  OPTIONS_BATTLE_STYLE = 'OPTIONS_BATTLE_STYLE',
  OPTIONS_SOUND = 'OPTIONS_SOUND',
  OPTIONS_VOLUME = 'OPTIONS_VOLUME',
  OPTIONS_MENU_COLOR = 'OPTIONS_MENU_COLOR',
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

  loadData() {
    if (typeof Storage === 'undefined') {
      console.warn(
        `[${DataManager.name}:loadData] localStorage is not supported, will not be able to save and load data.`
      );
      return;
    }

    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData === null) return;

    try {
      const parsedData = JSON.parse(savedData);
      this.updateDataManager(parsedData);
    } catch (err: any) {
      console.warn(
        `[${DataManager.name}:loadData] encountered an error while attempting to load and parse saved data.`
      );
    }
  }

  saveData() {
    if (typeof Storage === 'undefined') {
      console.warn(
        `[${DataManager.name}:saveData] localStorage is not supported, will not be able to save and load data.`
      );
      return;
    }

    const dataToSave = this.dataManagerDataToGlobalStateObject();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }

  private updateDataManager(data: GlobalState) {
    this.store.set({
      [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position,
      [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]: data.player.direction,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]: data.options.textSpeed,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]:
        data.options.battleSceneAnimations,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE]: data.options.battleStyle,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND]: data.options.sound,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME]: data.options.volume,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR]: data.options.menuColor,
    });
  }

  private dataManagerDataToGlobalStateObject() {
    return {
      player: {
        position: {
          x: this.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION).x,
          y: this.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION).y,
        },
        direction: this.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION),
      },
      options: {
        textSpeed: this.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED),
        battleSceneAnimations: this.store.get(
          DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS
        ),
        battleStyle: this.store.get(
          DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE
        ),
        sound: this.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND),
        volume: this.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME),
        menuColor: this.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR),
      },
    };
  }
}

export const dataManager = new DataManager();
