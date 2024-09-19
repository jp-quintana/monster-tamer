import { BATTLE_ASSET_KEYS, DATA_ASSET_KEYS } from '../../assets/asset-keys.ts';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../../assets/font-keys.ts';
import {
  Attack,
  BattleMonsterConfig,
  Coordinate,
  Monster,
} from '../../types/index.ts';
import { DataUtils } from '../../utils/data-utils.ts';
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
  protected skipBattleAnimations: boolean;

  constructor(config: BattleMonsterConfig, position: Coordinate) {
    this.scene = config.scene;
    this.monsterDetails = config.monsterDetails;
    this.currentHealth = this.monsterDetails.currentHp;
    this.maxHealth = this.monsterDetails.maxHp;
    this.monsterAttacks = [];
    this.skipBattleAnimations = config.skipBattleAnimations || false;

    this.phaserGameObject = this.scene.add
      .image(
        position.x,
        position.y,
        this.monsterDetails.assetKey,
        this.monsterDetails.assetFrame || 0
      )
      .setAlpha(0);

    this.createHealthbarComponents(config.scaleHealthBarBackgroundImageByY);
    this.healthBar.setMeterPercentageAnimated(
      this.currentHealth / this.maxHealth,
      { skipBattleAnimations: true }
    );
    this.monsterDetails.attackIds.forEach((attackId) => {
      const monsterAttack = DataUtils.getMonsterAttack(this.scene, attackId);

      if (monsterAttack !== undefined) this.monsterAttacks.push(monsterAttack);
    });
  }

  get currentHp(): number {
    return this.currentHealth;
  }
  get isFainted(): boolean {
    return this.currentHealth <= 0;
  }

  get name(): string {
    return this.monsterDetails.name;
  }

  get attacks(): Attack[] {
    return [...this.monsterAttacks];
  }

  get baseAttack(): number {
    return this.monsterDetails.baseAttack;
  }

  get level(): number {
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

  playMonsterAppearAnimation(callback: () => void) {
    throw new Error('playMonsterAppearAnimation is not implemented');
  }

  playHealthBarAppearAnimation(callback: () => void) {
    throw new Error('playHealthBarAppearAnimation is not implemented');
  }

  playTakeDamageAnimation(callback: () => void) {
    if (this.skipBattleAnimations) {
      this.phaserGameObject.setAlpha(1);
      callback();
      return;
    }

    this.scene.tweens.add({
      delay: 0,
      duration: 150,
      targets: this.phaserGameObject,
      alpha: {
        from: 1,
        start: 1,
        to: 0,
      },
      repeat: 10,
      onComplete: () => {
        this.phaserGameObject.setAlpha(1);
        callback();
      },
    });
  }

  playDeathAnimation(callback: () => void) {
    if (this.skipBattleAnimations) {
      callback();
      return;
    }

    const startYPos = this.phaserGameObject.y;
    const endYPos = startYPos + 400;

    this.scene.tweens.add({
      delay: 0,
      duration: 500,
      y: {
        from: startYPos,
        start: startYPos,
        to: endYPos,
      },
      alpha: {
        from: 1,
        start: 1,
        to: 0,
      },
      targets: this.phaserGameObject,
      onComplete: () => {
        callback();
      },
    });
  }

  private createHealthbarComponents(scaleHealthBarBackgroundImageByY = 1) {
    this.healthBar = new HealthBar(this.scene, 34, 34);

    // this.name viene del getter
    const monsterNameGameText = this.scene.add.text(30, 20, this.name, {
      fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
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
        fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
        color: '#ED474B',
        fontSize: '28px ',
      }
    );
    const monsterHpText = this.scene.add.text(30, 55, 'HP', {
      fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
      color: '#FF6505',
      fontSize: '24px',
      fontStyle: 'italic',
    });

    this.phaserHealthBarGameContainer = this.scene.add
      .container(0, 0, [
        healthbarBgImage,
        monsterNameGameText,
        this.healthBar.container,
        monsterHealthBarLevelText,
        monsterHpText,
      ])
      .setAlpha(0);
  }
}
