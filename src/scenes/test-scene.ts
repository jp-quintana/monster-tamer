import { Background } from '../battle/background.ts';
import { ATTACK_KEYS } from '../battle/attacks/attack-keys.ts';
import { IceShard } from '../battle/attacks/ice-shard.ts';
import { Slash } from '../battle/attacks/slash.ts';
import { MONSTER_ASSET_KEYS } from '../assets/asset-keys.ts';
import { SCENE_KEYS } from '../scenes/scene-keys.ts';
import { makeDraggable } from '../utils/draggable.ts';
import * as TweakPane from 'tweakpane';

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

  private addDataGui() {
    const pane = new TweakPane.Pane();

    const f1 = pane.addFolder({
      title: 'Monsters',
      expanded: true,
    });

    const playerMonsterFolder = f1.addFolder({
      title: 'Player',
      expanded: true,
    });

    playerMonsterFolder.addBinding(this.playerMonster, 'x', {
      min: 0,
      max: 1024,
      step: 1,
    });
    playerMonsterFolder.addBinding(this.playerMonster, 'y', {
      min: 0,
      max: 576,
      step: 1,
    });

    const enemyMonsterFolder = f1.addFolder({
      title: 'Enemy',
      expanded: true,
    });

    enemyMonsterFolder.addBinding(this.enemyMonster, 'x', {
      readonly: true,
    });

    enemyMonsterFolder.addBinding(this.enemyMonster, 'y', {
      readonly: true,
    });

    const f2Params = {
      attack: this.selectedAttack,
      x: this.slashAttack.gameObject!.x,
      y: this.slashAttack.gameObject!.y,
    };
    const f2 = pane.addFolder({
      title: 'Attacks',
      expanded: true,
    });

    f2.addBinding(f2Params, 'attack', {
      options: {
        [ATTACK_KEYS.SLASH]: ATTACK_KEYS.SLASH,
        [ATTACK_KEYS.ICE_SHARD]: ATTACK_KEYS.ICE_SHARD,
      },
    }).on('change', (event) => {
      console.log(event.value);
      if (event.value === ATTACK_KEYS.ICE_SHARD) {
        this.selectedAttack = ATTACK_KEYS.ICE_SHARD;
        f2Params.x = this.iceShardAttack.gameObject!.x;
        f2Params.y = this.iceShardAttack.gameObject!.y;
        f2.refresh();
        return;
      }
      if (event.value === ATTACK_KEYS.SLASH) {
        this.selectedAttack = ATTACK_KEYS.SLASH;
        f2Params.x = this.slashAttack.gameObject!.x;
        f2Params.y = this.slashAttack.gameObject!.y;
        f2.refresh();
        return;
      }
    });

    const playAttackButton = f2
      .addButton({
        title: 'Play',
      })
      .on('click', () => {
        if (this.selectedAttack === ATTACK_KEYS.ICE_SHARD) {
          this.iceShardAttack.playAnimation();
          return;
        }
        if (this.selectedAttack === ATTACK_KEYS.SLASH) {
          this.slashAttack.playAnimation();
          return;
        }
      });

    f2.addBinding(f2Params, 'x', {
      min: 0,
      max: 1024,
      step: 1,
    }).on('change', (event) => {
      this.updateAttackGameObjectPosition('x', event.value);
    });
    f2.addBinding(f2Params, 'y', {
      min: 0,
      max: 576,
      step: 1,
    }).on('change', (event) => {
      this.updateAttackGameObjectPosition('y', event.value);
    });
  }

  private updateAttackGameObjectPosition(param: 'x' | 'y', value: number) {
    if (param === 'x') {
      if (this.selectedAttack === ATTACK_KEYS.SLASH) {
        this.slashAttack.gameObject!.setX(value);
        return;
      }
      if (this.selectedAttack === ATTACK_KEYS.ICE_SHARD) {
        this.iceShardAttack.gameObject!.setX(value);
        return;
      }
    }
    if (this.selectedAttack === ATTACK_KEYS.SLASH) {
      this.slashAttack.gameObject!.setY(value);
      return;
    }
    if (this.selectedAttack === ATTACK_KEYS.ICE_SHARD) {
      this.iceShardAttack.gameObject!.setY(value);
      return;
    }
  }
}
