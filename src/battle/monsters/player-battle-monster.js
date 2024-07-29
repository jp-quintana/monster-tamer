import { Phaser } from '../../lib/phaser.js';
import { BattleMonster } from './battle-monster.js';

/**
 * @type {import('../../types/typedef.js').Coordinate}
 */
const PLAYER_POSITION = Object.freeze({
  x: 256,
  y: 316,
});

export class PlayerBattleMonster extends BattleMonster {
  /** @type {Phaser.GameObjects.Text} */
  #healthBarTextGameObject;

  /**
   *
   * @param {import('../../types/typedef.js').BattleMonsterConfig} config
   */
  constructor(config) {
    super(config, PLAYER_POSITION);

    this._phaserGameObject.setFlipX(true);
    this._phaserHealthBarGameContainer.setPosition(556, 318);
    this.#addHealthBarComponents();
  }

  #setHealthBarText() {
    this.#healthBarTextGameObject.setText(
      `${this._currentHealth}/${this._maxHealth}`
    );
  }

  #addHealthBarComponents() {
    this.#healthBarTextGameObject = this._scene.add
      .text(443, 80, '', {
        color: '#7E3D4F',
        fontSize: '16px',
      })
      .setOrigin(1, 0); // align to the right always, numbers might go up as monster levels up, so you want text to grow towards left not right
    this.#setHealthBarText();

    this._phaserHealthBarGameContainer.add(this.#healthBarTextGameObject);
  }

  /**
   * @param {number} damage
   * @param {() => void} callback
   */
  takeDamage(damage, callback) {
    // como el método tiene el mismo nombre que la parent class (takeDamage), si llamas el método desde la sub class, corre este metodo y no el de la parent. Si necesitas que corra tambien el del parent, usas el super:
    super.takeDamage(damage, callback);
    this.#setHealthBarText();
  }
}
