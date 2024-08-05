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

  playMonsterAppearAnimation(callback: () => void) {
    const startXPos = -30;
    const endXPos = ENEMY_POSITION.x;
    this.phaserGameObject.setPosition(startXPos, ENEMY_POSITION.y);
    this.phaserGameObject.setAlpha(1);

    this.scene.tweens.add({
      delay: 0,
      duration: 1600,
      x: {
        from: startXPos,
        start: startXPos,
        to: endXPos,
      },
      targets: this.phaserGameObject,
      onComplete: () => {
        callback();
      },
    });
  }

  playHealthBarAppearAnimation(callback: () => void) {
    const startXPos = -600;
    const endXPos = 0;
    this.phaserHealthBarGameContainer.setPosition(
      startXPos,
      this.phaserHealthBarGameContainer.y
    );
    this.phaserHealthBarGameContainer.setAlpha(1);

    this.scene.tweens.add({
      delay: 0,
      duration: 1500,
      x: {
        from: startXPos,
        start: startXPos,
        to: endXPos,
      },
      targets: this.phaserHealthBarGameContainer,
      onComplete: () => {
        callback();
      },
    });
  }
}
