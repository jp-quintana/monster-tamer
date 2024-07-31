import { BattleMonsterConfig, Coordinate } from '../../types/index.ts';
import { BattleMonster } from './battle-monster.ts';

const ENEMY_POSITION: Coordinate = Object.freeze({
  x: 768,
  y: 144,
});

export class EnemyBattleMonster extends BattleMonster {
  constructor(config: BattleMonsterConfig) {
    super({ ...config, scaleHealthBarBackgroundImageByY: 0.8 }, ENEMY_POSITION);
  }
}
