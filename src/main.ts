import Phaser from 'phaser';
import { BootScene } from './core/BootScene';
import { GameScene } from './core/GameScene';
import { MenuScene } from './ui/MenuScene';
import { HUDScene } from './ui/HUDScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 940,
  height: 560,
  parent: 'game-container',
  backgroundColor: '#000000',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, HUDScene],
};

new Phaser.Game(config);
