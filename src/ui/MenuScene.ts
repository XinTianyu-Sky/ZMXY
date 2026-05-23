import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a0a1a');

    const title = this.add.text(470, 120, '造梦西游3', {
      fontSize: '64px', color: '#ffcc00',
      fontFamily: 'SimHei, Arial',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);

    const subtitle = this.add.text(470, 190, '再续天庭', {
      fontSize: '32px', color: '#ff6600',
      fontFamily: 'SimHei, Arial',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title, y: 125, duration: 2000,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    const startBtn = this.add.text(470, 320, '[ 开始游戏 ]', {
      fontSize: '28px', color: '#ffffff',
      fontFamily: 'SimHei, Arial',
      backgroundColor: '#333366',
      padding: { x: 30, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setColor('#ffcc00'));
    startBtn.on('pointerout', () => startBtn.setColor('#ffffff'));
    startBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { levelId: 'sl12' });
    });

    const info = this.add.text(470, 420, '操作: A/D 移动 | J 跳跃 | K 攻击 | Y/L/U/I/O 技能', {
      fontSize: '14px', color: '#888888', fontFamily: 'Arial',
    }).setOrigin(0.5);

    const version = this.add.text(470, 540, 'v0.1.0-alpha | HTML5 Remake | 基于Phaser 3', {
      fontSize: '12px', color: '#555555',
    }).setOrigin(0.5);
  }
}
