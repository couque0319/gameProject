import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import MainScene from './scenes/MainScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [MainScene],
};

new Phaser.Game(config);