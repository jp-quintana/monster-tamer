import { Game, Types } from 'phaser';
import { SCENE_KEYS } from './scenes/scene-keys';
import { PreloadScene } from './scenes/preload-scene';
import { BattleScene } from './scenes/battle-scene';

const config: Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  pixelArt: false,
  scale: {
    parent: 'game-container',
    width: 1024,
    height: 576,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: '#000',
  // scene: [PreloadScene] --> comienza scenes directamente
};

const game = new Game(config);

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
