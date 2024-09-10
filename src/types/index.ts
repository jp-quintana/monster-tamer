import { ATTACK_KEYS } from '../battle/attacks/attack-keys';

export interface BattleMonsterConfig {
  scene: Phaser.Scene;
  monsterDetails: Monster;
  scaleHealthBarBackgroundImageByY?: number; // 1
  skipBattleAnimations: boolean;
}

export interface Monster {
  id: number;
  monsterId: number;
  name: string;
  assetKey: string;
  assetFrame: number;
  currentLevel: number;
  maxHp: number;
  currentHp: number;
  baseAttack: number;
  attackIds: number[];
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Attack {
  id: number;
  name: string;
  animationName: ATTACK_KEYS;
}

export interface Animation {
  key: 'string';
  frames?: number[];
  frameRate: number;
  repeat: number;
  delay: number;
  yoyo: boolean;
  assetKey: string;
}
export const enum ITEM_EFFECT {
  HEAL_30 = 'HEAL_30',
}
export interface Item {
  id: number;
  name: string;
  effect: ITEM_EFFECT;
  description: string;
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export interface BaseInventoryItem {
  item: { [id: string]: number };
  quantity: number;
}

export type BaseInventory = BaseInventoryItem[];
