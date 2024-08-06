import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../../assets/font-keys.ts';
import { BattleMonsterConfig, Coordinate } from '../../types/index.ts';
import { BattleMonster } from './battle-monster.ts';

const PLAYER_POSITION: Coordinate = Object.freeze({
  x: 256,
  y: 316,
});

export class PlayerBattleMonster extends BattleMonster {
  private healthBarTextGameObject: Phaser.GameObjects.Text;

  constructor(config: BattleMonsterConfig) {
    super(config, PLAYER_POSITION);

    this.phaserGameObject.setFlipX(true);
    this.phaserHealthBarGameContainer.setPosition(556, 318);
    this.addHealthBarComponents();
  }

  playMonsterAppearAnimation(callback: () => void) {
    const startXPos = -30;
    const endXPos = PLAYER_POSITION.x;
    this.phaserGameObject.setPosition(startXPos, PLAYER_POSITION.y);
    this.phaserGameObject.setAlpha(1);

    if (this.skipBattleAnimations) {
      this.phaserGameObject.setX(endXPos);
      callback();
      return;
    }

    this.scene.tweens.add({
      delay: 0,
      duration: 800,
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
    const startXPos = 800;
    const endXPos = this.phaserHealthBarGameContainer.x;
    this.phaserHealthBarGameContainer.setPosition(
      startXPos,
      this.phaserHealthBarGameContainer.y
    );
    this.phaserHealthBarGameContainer.setAlpha(1);

    if (this.skipBattleAnimations) {
      this.phaserHealthBarGameContainer.setX(endXPos);
      callback();
      return;
    }

    this.scene.tweens.add({
      delay: 0,
      duration: 800,
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

  private setHealthBarText() {
    this.healthBarTextGameObject.setText(
      `${this.currentHealth}/${this.maxHealth}`
    );
  }

  private addHealthBarComponents() {
    this.healthBarTextGameObject = this.scene.add
      .text(443, 80, '', {
        fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
        color: '#7E3D4F',
        fontSize: '16px',
      })
      .setOrigin(1, 0); // align to the right always, numbers might go up as monster levels up, so you want text to grow towards left not right
    this.setHealthBarText();

    this.phaserHealthBarGameContainer.add(this.healthBarTextGameObject);
  }

  takeDamage(damage: number, callback: () => void) {
    // como el método tiene el mismo nombre que la parent class (takeDamage), si llamas el método desde la sub class, corre este metodo y no el de la parent. Si necesitas que corra tambien el del parent, usas el super:
    super.takeDamage(damage, callback);
    this.setHealthBarText();
  }
}
