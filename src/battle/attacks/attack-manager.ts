import { exhaustiveGuard } from '../../utils/guard';
import { ATTACK_KEYS } from './attack-keys';
import { IceShard } from './ice-shard';
import { Slash } from './slash';

export const enum ATTACK_TARGET {
  PLAYER = 'PLAYER',
  ENEMY = 'ENEMY',
}

export class AttackManager {
  private scene: Phaser.Scene;
  private skipBattleAnimations: boolean;
  private iceShardAttack: IceShard;
  private slashAttack: Slash;

  constructor(scene: Phaser.Scene, skipBattleAnimations: boolean) {
    this.scene = scene;
    this.skipBattleAnimations = skipBattleAnimations;
  }

  playAttackAnimation(
    attack: ATTACK_KEYS,
    target: ATTACK_TARGET,
    callback: () => void
  ) {
    if (this.skipBattleAnimations) {
      callback();
      return;
    }

    // if attack target is enemy
    let x = 745;
    let y = 140;

    if (target === ATTACK_TARGET.PLAYER) {
      x = 256;
      y = 344;
    }

    switch (attack) {
      case ATTACK_KEYS.ICE_SHARD:
        this.iceShardAttack = this.iceShardAttack
          ? this.iceShardAttack
          : new IceShard(this.scene, { x, y });

        // por si los dos pokes tienen el mismo ataque
        this.iceShardAttack.gameObject?.setPosition(x, y);
        this.iceShardAttack.playAnimation(callback);

        break;
      case ATTACK_KEYS.SLASH:
        this.slashAttack = this.slashAttack
          ? this.slashAttack
          : new Slash(this.scene, { x, y });

        // por si los dos pokes tienen el mismo ataque
        this.slashAttack.gameObject?.setPosition(x, y);
        this.slashAttack.playAnimation(callback);

        break;
      default:
        exhaustiveGuard(attack);
    }
  }
}
