import { Background } from '../battle/background.ts';
import { ATTACK_KEYS } from '../battle/attacks/attack-keys.ts';
import { IceShard } from '../battle/attacks/ice-shard.ts';
import { Slash } from '../battle/attacks/slash.ts';
import { MONSTER_ASSET_KEYS } from '../assets/asset-keys.ts';
import { SCENE_KEYS } from '../scenes/scene-keys.ts';
import { makeDraggable } from '../utils/draggable.ts';
// import { makeDraggable } from '../utils/draggable.ts';

export class TestScene extends Phaser.Scene {
  private selectedAttack: ATTACK_KEYS;
  private iceShardAttack: IceShard;
  private slashAttack: Slash;
  private playerMonster: Phaser.GameObjects.Image;
  private enemyMonster: Phaser.GameObjects.Image;

  constructor() {
    super({ key: SCENE_KEYS.TEST_SCENE });
  }

  init() {
    this.selectedAttack = ATTACK_KEYS.SLASH;
  }

  create() {
    const background = new Background(this);
    background.showForest();

    this.playerMonster = this.add
      .image(256, 316, MONSTER_ASSET_KEYS.IGUANIGNITE, 0)
      .setFlipX(true);
    this.enemyMonster = this.add
      .image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0)
      .setFlipX(false);
    makeDraggable(this.enemyMonster);

    this.iceShardAttack = new IceShard(this, { x: 256, y: 344 });
    this.slashAttack = new Slash(this, { x: 745, y: 140 });

    this.addDataGui();
  }

  private addDataGui() {}

  // private updateAttackGameObjectPosition(param: 'x' | 'y', value: number) {
  //   if (param === 'x') {
  //     if (this.selectedAttack === ATTACK_KEYS.SLASH) {
  //       this.slashAttack.gameObject.setX(value);
  //       return;
  //     }
  //     if (this.selectedAttack === ATTACK_KEYS.ICE_SHARD) {
  //       this.iceShardAttack.gameObject.setX(value);
  //       return;
  //     }
  //   }
  //   if (this.selectedAttack === ATTACK_KEYS.SLASH) {
  //     this.slashAttack.gameObject.setY(value);
  //     return;
  //   }
  //   if (this.selectedAttack === ATTACK_KEYS.ICE_SHARD) {
  //     this.iceShardAttack.gameObject.setY(value);
  //     return;
  //   }
  // }
}
