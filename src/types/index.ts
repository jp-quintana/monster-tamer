export interface BattleMonsterConfig {
  scene: Phaser.Scene;
  monsterDetails: Monster;
  scaleHealthBarBackgroundImageByY?: number; // 1
}

export interface Monster {
  name: string;
  assetKey: string;
  assetFrame: number; // 0
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
  animationName: string;
}
