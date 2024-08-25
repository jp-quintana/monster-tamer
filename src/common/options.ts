export const enum OPTION_MENU_OPTIONS {
  TEXT_SPEED = 'TEXT_SPEED',
  BATTLE_SCENE = 'BATTLE_SCENE',
  BATTLE_STYLE = 'BATTLE_STYLE',
  SOUND = 'SOUND',
  VOLUME = 'VOLUME',
  MENU_COLOR = 'MENU_COLOR',
  CONFIRM = 'CONFIRM',
}

export const enum TEXT_SPEED_OPTIONS {
  SLOW = 'SLOW',
  MID = 'MID',
  FAST = 'FAST',
}

export const enum BATTLE_SCENE_OPTIONS {
  ON = 'ON',
  OFF = 'OFF',
}

export const enum BATTLE_STYLE_OPTIONS {
  SET = 'SET',
  SHIFT = 'SHIFT',
}

export const enum SOUND_OPTIONS {
  ON = 'ON',
  OFF = 'OFF',
}

export type VOLUME_OPTIONS = 0 | 1 | 2 | 3 | 4;
export type COLOR_OPTIONS = 0 | 1 | 2;
