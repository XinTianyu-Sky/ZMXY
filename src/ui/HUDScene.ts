import Phaser from 'phaser';

export class HUDScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private mpBar!: Phaser.GameObjects.Graphics;
  private expBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private mpText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private enemyCountText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(): void {
    const barX = 10;
    const barWidth = 200;
    const barHeight = 14;

    this.hpBar = this.add.graphics();
    this.hpBar.setDepth(300);
    this.hpBar.setScrollFactor(0);

    this.mpBar = this.add.graphics();
    this.mpBar.setDepth(300);
    this.mpBar.setScrollFactor(0);

    this.expBar = this.add.graphics();
    this.expBar.setDepth(300);
    this.expBar.setScrollFactor(0);

    this.hpText = this.add.text(barX + barWidth / 2, 8, '', {
      fontSize: '11px', color: '#ffffff', fontFamily: 'Arial',
    }).setOrigin(0.5, 0).setDepth(301).setScrollFactor(0);

    this.mpText = this.add.text(barX + barWidth / 2, 24, '', {
      fontSize: '11px', color: '#ffffff', fontFamily: 'Arial',
    }).setOrigin(0.5, 0).setDepth(301).setScrollFactor(0);

    this.levelText = this.add.text(10, 42, '', {
      fontSize: '12px', color: '#ffcc00', fontFamily: 'SimHei, Arial',
    }).setDepth(301).setScrollFactor(0);

    this.enemyCountText = this.add.text(930, 8, '', {
      fontSize: '12px', color: '#ff6666', fontFamily: 'Arial',
    }).setOrigin(1, 0).setDepth(301).setScrollFactor(0);
  }

  updateStats(
    hp: number, maxHp: number,
    mp: number, maxMp: number,
    level: number, exper: number, expToLevel: number,
    enemyCount: number
  ): void {
    const barX = 10;
    const barY1 = 6;
    const barY2 = 22;
    const barY3 = 38;
    const barW = 200;
    const barH = 13;

    this.hpBar.clear();
    this.hpBar.fillStyle(0x000000, 0.6);
    this.hpBar.fillRect(barX, barY1, barW, barH);
    this.hpBar.fillStyle(0xcc0000);
    this.hpBar.fillRect(barX, barY1, barW * Math.max(0, hp / maxHp), barH);
    this.hpBar.lineStyle(1, 0x666666);
    this.hpBar.strokeRect(barX, barY1, barW, barH);

    this.mpBar.clear();
    this.mpBar.fillStyle(0x000000, 0.6);
    this.mpBar.fillRect(barX, barY2, barW, barH);
    this.mpBar.fillStyle(0x0066cc);
    this.mpBar.fillRect(barX, barY2, barW * Math.max(0, mp / maxMp), barH);
    this.mpBar.lineStyle(1, 0x666666);
    this.mpBar.strokeRect(barX, barY2, barW, barH);

    this.expBar.clear();
    this.expBar.fillStyle(0x000000, 0.6);
    this.expBar.fillRect(barX, barY3, barW, 5);
    this.expBar.fillStyle(0xccaa00);
    this.expBar.fillRect(barX, barY3, barW * Math.max(0, exper / expToLevel), 5);

    this.hpText.setText(`HP: ${Math.floor(hp)} / ${maxHp}`);
    this.mpText.setText(`MP: ${Math.floor(mp)} / ${maxMp}`);
    this.levelText.setText(`Lv.${level}`);
    this.enemyCountText.setText(`剩余敌人: ${enemyCount}`);
  }
}
