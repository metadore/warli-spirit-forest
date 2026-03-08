/* =====================================================
   Warli: Spirit of the Forest — game.js
   Main Phaser 3 configuration
   ===================================================== */

const GAME_W = 800;
const GAME_H = 400;

const config = {
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  parent: 'game-container',
  backgroundColor: '#3E2209',
  antialias: false,
  scene: [
    BootScene,
    MenuScene,
    StoryScene,
    GameScene,
    GameOverScene
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);