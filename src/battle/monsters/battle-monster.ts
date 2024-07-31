import { BATTLE_ASSET_KEYS, DATA_ASSET_KEYS } from '../../assets/asset-keys.ts';
import {
  Attack,
  BattleMonsterConfig,
  Coordinate,
  Monster,
} from '../../types/index.ts';
import { HealthBar } from '../ui/menu/health-bar.ts';

export class BattleMonster {
  protected scene: Phaser.Scene;
  protected monsterDetails: Monster;
  protected healthBar: HealthBar;
  protected phaserGameObject: Phaser.GameObjects.Image;
  protected currentHealth: number;
  protected maxHealth: number;
  protected monsterAttacks: Attack[];
  protected phaserHealthBarGameContainer: Phaser.GameObjects.Container;

  constructor(config: BattleMonsterConfig, position: Coordinate) {
    this.scene = config.scene;
    this.monsterDetails = config.monsterDetails;
    this.currentHealth = this.monsterDetails.currentHp;
    this.maxHealth = this.monsterDetails.maxHp;
    this.monsterAttacks = [];

    this.phaserGameObject = this.scene.add.image(
      position.x,
      position.y,
      this.monsterDetails.assetKey,
      this.monsterDetails.assetFrame || 0
    );

    this.createHealthbarComponents(config.scaleHealthBarBackgroundImageByY);

    const data: Attack[] = this.scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS);

    this.monsterDetails.attackIds.forEach((attackId) => {
      const monsterAttack = data.find((attack) => attack.id === attackId);

      if (monsterAttack !== undefined) this.monsterAttacks.push(monsterAttack);
    });
  }

  /** @type {boolean} */
  get isFainted() {
    return this.currentHealth <= 0;
  }

  /** @type {string} */
  get name() {
    return this.monsterDetails.name;
  }

  /** @type {import('../../types/typedef.js').Attack[]} */
  get attacks() {
    return [...this.monsterAttacks];
  }

  /** @type {number} */
  get baseAttack() {
    return this.monsterDetails.baseAttack;
  }

  /** @type {number} */
  get level() {
    return this.monsterDetails.currentLevel;
  }

  takeDamage(damage: number, callback: () => void) {
    // update current monster health and animate healthbar
    this.currentHealth -= damage;
    if (this.currentHealth <= 0) {
      this.currentHealth = 0;
    }
    this.healthBar.setMeterPercentageAnimated(
      this.currentHealth / this.maxHealth,
      { callback }
    );
  }

  private createHealthbarComponents(scaleHealthBarBackgroundImageByY = 1) {
    this.healthBar = new HealthBar(this.scene, 34, 34);

    // this.name viene del getter
    const monsterNameGameText = this.scene.add.text(30, 20, this.name, {
      color: '#7E3D3F',
      fontSize: '32px ',
    });

    const healthbarBgImage = this.scene.add
      .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
      .setOrigin(0)
      .setScale(1, scaleHealthBarBackgroundImageByY);

    const monsterHealthBarLevelText = this.scene.add.text(
      monsterNameGameText.width + 35,
      23,
      `L${this.level}`,
      {
        color: '#ED474B',
        fontSize: '28px ',
      }
    );
    const monsterHpText = this.scene.add.text(30, 55, 'HP', {
      color: '#FF6505',
      fontSize: '24px',
      fontStyle: 'italic',
    });

    this.phaserHealthBarGameContainer = this.scene.add.container(0, 0, [
      healthbarBgImage,
      monsterNameGameText,
      this.healthBar.container,
      monsterHealthBarLevelText,
      monsterHpText,
    ]);
  }
}
