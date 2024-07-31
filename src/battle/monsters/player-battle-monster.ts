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

  private setHealthBarText() {
    this.healthBarTextGameObject.setText(
      `${this.currentHealth}/${this.maxHealth}`
    );
  }

  private addHealthBarComponents() {
    this.healthBarTextGameObject = this.scene.add
      .text(443, 80, '', {
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
