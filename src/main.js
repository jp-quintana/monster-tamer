import { Phaser } from './lib/phaser.js';
import { BattleScene } from './scenes/battle-scene.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { SCENE_KEYS } from './scenes/scene-keys.js';

const game = new Phaser.Game({
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
});

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
