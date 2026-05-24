import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add.image(width / 2, height / 2, 'loadingBg').setOrigin(0.5);

    const btnStyle = {
      fontSize: '22px',
      color: '#ffcc00',
      fontFamily: 'SimHei, Arial',
      stroke: '#000000',
      strokeThickness: 3,
    };

    const startBtn = this.add.text(824, 176, '开 始 游 戏', btnStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setColor('#ffffff'));
    startBtn.on('pointerout', () => startBtn.setColor('#ffcc00'));
    startBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { levelId: 'sl12' });
    });

    this.tweens.add({
      targets: startBtn,
      alpha: { from: 0.6, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    const loadBtn = this.add.text(824, 216, '读 取 存 档', btnStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    loadBtn.on('pointerover', () => loadBtn.setColor('#ffffff'));
    loadBtn.on('pointerout', () => loadBtn.setColor('#ffcc00'));
    loadBtn.on('pointerdown', () => {
      // TODO: load save
    });
  }
}
