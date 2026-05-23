import Phaser from 'phaser';

const AUDIO_FILES = [
  '0.wav',
  '1_Role4_hit5', '2_Role1_hit8', '3_bg2', '4_Role4_hit10Arrow', '5_BeattackByRole2',
  '6_Role3_hit8', '7_Role2_hit4', '8_over', '9_Game_Victory',
  '10_Role3_hit7', '11_Role2_hit5', '12_Role3_hit5', '13_Role1_hit6', '14_Role1_hit14',
  '15_Role4_hit9Arrow', '16_Role4_hit2Arrow', '17_Role4_hit1Arrow', '18_Role4_hit3', '19_Role4_hit2',
  '20_Role4_hit1', '21_Role1_hit7', '22_Role1_hit13_1', '23_Role1_hit13_2', '24_bg4',
  '25_bg1', '26_Role4_hit6', '27_Role3_hit6', '28_Role2_hit6', '29_Role4_mds',
  '30_bg5', '31_bg3', '32_Role1_hit9', '33_bg0', '34_Role3_hit9',
  '35_Role2_hit9', '36_Role2_hit7', '37_Role4_hit4', '38_Role1_hit11', '39_bg6',
  '40_Role1_hit12_2', '41_Role1_hit12_1', '42_Role1_hit10_2', '43_Role1_hit10_4', '44_Role1_hit5',
  '45_Role1_hit3AndHit4', '46_Role1_hit1AndHit2', '47_Role2_hit10', '48_Role3_hit12_2', '49_Role3_hit4',
  '50_begin', '51_SD_xz', '52_Role3_hit10', '53_Role2_hit8', '54_Role2_hit1',
  '55_Role2_hit2', '56_Role2_hit3', '57_Role1_beAttack', '58_Role2_beAttack', '59_Role4_hit8Arrow',
  '60_Role3_jump', '61_Role2_jump', '62_Role1_jump', '63_Role3_hit11', '64_Role3_beAttack',
  '65_Role3_hit3', '66_Role3_hit2', '67_Role3_hit1', '68_Role3_dead', '69_Role1_dead',
  '70_Role3_hit12_1', '71_Role2_dead', '72_Role4_hit12', '73_Role4_hit11', '74_Role4_hit10',
  '75_BeattackByRole1', '76_Role4_hit9', '77_Role4_hit4Arrow', '78_Role4_hit8', '79_Role4_hit12Arrow',
  '80_Role4_hit7', '81_bg7', '82_m_bg13', '83_m_bg12', '84_pickup',
];

const BGM_FILES = ['33_bg0', '25_bg1', '3_bg2', '31_bg3', '24_bg4', '30_bg5', '39_bg6', '81_bg7'];

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const { width, height } = this.cameras.main;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 15, 320, 30);

    const loadingText = this.add.text(width / 2, height / 2 - 35, '造梦西游3 再续天庭', {
      fontSize: '20px', color: '#ffcc00', fontFamily: 'SimHei, Arial',
    }).setOrigin(0.5);

    const statusText = this.add.text(width / 2, height / 2 + 30, '加载资源...', {
      fontSize: '12px', color: '#888888', fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffcc00, 1);
      progressBar.fillRect(width / 2 - 155, height / 2 - 10, 310 * value, 20);
    });

    this.load.on('fileprogress', (file: { key: string }) => {
      statusText.setText(`加载: ${file.key}`);
    });

    for (const file of AUDIO_FILES) {
      this.load.audio(file, `sounds/${file}.mp3`);
    }

    this.load.spritesheet('wukong', 'sprites/wukong.png', { frameWidth: 200, frameHeight: 200 });
    this.load.spritesheet('monster1', 'sprites/monster1.png', { frameWidth: 300, frameHeight: 300 });
    this.load.spritesheet('monster2', 'sprites/monster2.png', { frameWidth: 190, frameHeight: 190 });
    this.load.spritesheet('monster4', 'sprites/monster4.png', { frameWidth: 190, frameHeight: 190 });
    this.load.spritesheet('monster7', 'sprites/monster7.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('monster8', 'sprites/monster8.png', { frameWidth: 150, frameHeight: 150 });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      statusText.destroy();
    });
  }

  create(): void {
    this.generatePlaceholderTextures();
    this.scene.start('MenuScene');
  }

  private generatePlaceholderTextures(): void {
    const bulletGfx = this.add.graphics();
    bulletGfx.fillStyle(0xffff00);
    bulletGfx.fillCircle(4, 4, 4);
    bulletGfx.generateTexture('bullet', 8, 8);
    bulletGfx.destroy();

    const sizes = [{ w: 1, h: 1 }, { w: 940, h: 560 }];
    for (const s of sizes) {
      if (!this.textures.exists(`__WHITE${s.w}x${s.h}`)) {
        const g = this.add.graphics();
        g.fillStyle(0xffffff);
        g.fillRect(0, 0, s.w, s.h);
        g.generateTexture(`__WHITE${s.w}x${s.h}`, s.w, s.h);
        g.destroy();
      }
    }
  }
}
