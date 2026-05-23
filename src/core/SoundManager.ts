import Phaser from 'phaser';

export class SoundManager {
  private scene: Phaser.Scene;
  private bgmKey: string | null = null;
  private enabled = true;

  private static readonly SFX_MAP: Record<string, string> = {
    jump: '62_Role1_jump',
    dead: '69_Role1_dead',
    beAttack: '57_Role1_beAttack',
    hit1: '46_Role1_hit1AndHit2',
    hit2: '46_Role1_hit1AndHit2',
    hit3: '45_Role1_hit3AndHit4',
    hit4: '45_Role1_hit3AndHit4',
    hit5: '44_Role1_hit5',
    hit6: '13_Role1_hit6',
    hit7: '21_Role1_hit7',
    hit8: '2_Role1_hit8',
    hit9: '32_Role1_hit9',
    hit10: '42_Role1_hit10_2',
    hit11: '38_Role1_hit11',
    hit12: '40_Role1_hit12_2',
    hit13: '22_Role1_hit13_1',
    hit14: '14_Role1_hit14',
    pickup: '84_pickup',
    victory: '9_Game_Victory',
    begin: '50_begin',
  };

  private static readonly BGM_LIST = ['33_bg0', '25_bg1', '3_bg2', '31_bg3', '24_bg4', '30_bg5', '39_bg6', '81_bg7'];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  playBGM(stageIndex: number): void {
    if (!this.enabled) return;
    const key = SoundManager.BGM_LIST[Math.min(stageIndex, SoundManager.BGM_LIST.length - 1)];
    if (this.bgmKey === key && this.scene.sound.get(key)?.isPlaying) return;
    this.stopBGM();
    this.bgmKey = key;
    this.scene.sound.play(key, { loop: true, volume: 0.3 });
  }

  stopBGM(): void {
    if (this.bgmKey) {
      this.scene.sound.stopByKey(this.bgmKey);
      this.bgmKey = null;
    }
  }

  playSFX(action: string): void {
    if (!this.enabled) return;
    const key = SoundManager.SFX_MAP[action];
    if (key) {
      this.scene.sound.play(key, { volume: 0.5 });
    }
  }

  toggle(): void {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.scene.sound.stopAll();
    }
  }
}
