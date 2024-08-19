import { Game, Types } from 'phaser';
import { SCENE_KEYS } from './scenes/scene-keys';
import { PreloadScene } from './scenes/preload-scene';
import { BattleScene } from './scenes/battle-scene';
import { WorldScene } from './scenes/world-scene';
import { TitleScene } from './scenes/title-scene';

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
game.scene.add(SCENE_KEYS.WORLD_SCENE, WorldScene);
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene);
game.scene.add(SCENE_KEYS.TITLE_SCENE, TitleScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
