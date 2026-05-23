import Phaser from 'phaser';
import { Hero } from '../entity/Hero';
import { Monster, MonsterConfig } from '../entity/Monster';
import { InputManager } from './InputManager';
import { GameConfig } from './GameConfig';
import { HUDScene } from '../ui/HUDScene';
import { SoundManager } from './SoundManager';
import { DEBUG } from './Debug';
import monstersData from '../config/monsters.json';
import levelsData from '../config/levels.json';

interface SpawnWave {
  enemyType: number;
  delay: number;
  interval: number;
  totalNum: number;
  stopPointIdx: number;
  elapsed: number;
  spawned: number;
  nextSpawn: number;
}

export class GameScene extends Phaser.Scene {
  public hero!: Hero;
  public monsters: Monster[] = [];
  public groundColliders: Phaser.Geom.Rectangle[] = [];
  public wallRects: Phaser.Geom.Rectangle[] = [];
  private inputMgr!: InputManager;
  private worldWidth = 2500;
  private hudScene!: HUDScene;
  public soundMgr!: SoundManager;

  private monsterConfigs: Map<number, MonsterConfig> = new Map();
  private currentLevelKey = 'sl12';
  private stopPoints: { idx: number; x: number; isBoss: boolean }[] = [];
  private waves: SpawnWave[] = [];
  private activatedStopPoints: Set<number> = new Set();
  private victoryShown = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data?: { levelId?: string }): void {
    this.monsters = [];
    this.groundColliders = [];
    this.wallRects = [];
    this.activatedStopPoints.clear();
    this.victoryShown = false;

    this.soundMgr = new SoundManager(this);
    this.loadMonsterConfigs();
    this.createBackground();
    this.inputMgr = new InputManager(this);

    if (data?.levelId) {
      this.currentLevelKey = data.levelId;
    }
    this.loadLevel(this.currentLevelKey);

    this.physics.world.setBounds(0, 0, this.worldWidth, 560);
    this.cameras.main.setBounds(0, 0, this.worldWidth, 560);
    this.cameras.main.setBackgroundColor('#0a0a1a');

    this.scene.launch('HUDScene');
    this.hudScene = this.scene.get('HUDScene') as HUDScene;
  }

  private loadMonsterConfigs(): void {
    this.monsterConfigs.clear();
    for (const m of monstersData as MonsterConfig[]) {
      this.monsterConfigs.set(m.id, m);
    }
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.setDepth(-10);
    bg.fillStyle(0x1a1a2e);
    bg.fillRect(0, 0, this.worldWidth, 560);
    for (let i = 0; i < 80; i++) {
      bg.fillStyle(0xffffff, 0.2 + Math.random() * 0.3);
      bg.fillCircle(Math.random() * this.worldWidth, Math.random() * 350, 1 + Math.random());
    }
  }

  private loadLevel(levelKey: string): void {
    const levelData = (levelsData as Record<string, any>)[levelKey];
    if (!levelData) {
      console.warn(`Level ${levelKey} not found, creating test level`);
      this.createTestLevel();
      return;
    }

    const sps = levelData.stopPoints || [];
    this.worldWidth = sps.length > 0
      ? sps.reduce((sum: number, sp: any) => sum + (sp.betweenRandL || 1150), 0)
      : 940;

    this.add.text(this.worldWidth / 2, 20, `${levelData.name || levelKey} — Stage ${levelData.stage}`, {
      fontSize: '22px', color: '#ffcc00', fontFamily: 'SimHei, Arial',
    }).setOrigin(0.5).setDepth(50);

    this.soundMgr.playBGM(levelData.stage || 1);

    this.createGround(0, 540, this.worldWidth, 20);

    let cumulativeX = 0;
    this.stopPoints = [];
    for (const sp of sps) {
      cumulativeX += sp.betweenRandL || 1150;
      this.stopPoints.push({ idx: sp.idx, x: cumulativeX, isBoss: sp.isBoss });
    }

    const platformXs = this.generatePlatforms(sps.length);

    this.hero = new Hero(this, 150, 500, 1, this.inputMgr, this.soundMgr);

    this.waves = (levelData.waves || []).map((w: any) => ({
      enemyType: w.enemyType,
      delay: w.delay * GameConfig.FRAME_CLIPS,
      interval: w.interval * GameConfig.FRAME_CLIPS,
      totalNum: w.totalNum,
      stopPointIdx: w.stopPointIdx,
      elapsed: 0,
      spawned: 0,
      nextSpawn: w.delay * GameConfig.FRAME_CLIPS,
    }));
  }

  private getStageScale(): number {
    const stage = parseInt(this.currentLevelKey.replace('sl', '').charAt(0)) || 1;
    if (stage <= 1) return 0.12;
    if (stage <= 2) return 0.2;
    return 0.35;
  }

  private generatePlatforms(stopPointCount: number): void {
    const platforms = [
      { x: 750, y: 400, w: 180 },
      { x: 1100, y: 350, w: 200 },
      { x: 1500, y: 380, w: 180 },
      { x: 1850, y: 430, w: 200 },
      { x: 2200, y: 370, w: 180 },
      { x: 2600, y: 400, w: 200 },
      { x: 3000, y: 350, w: 180 },
      { x: 3400, y: 420, w: 200 },
      { x: 3800, y: 380, w: 180 },
      { x: 4200, y: 400, w: 200 },
      { x: 4600, y: 360, w: 180 },
      { x: 5000, y: 430, w: 200 },
    ];
    const count = Math.max(4, Math.min(stopPointCount * 2 + 2, platforms.length));
    for (let i = 0; i < count; i++) {
      const p = platforms[i];
      this.createPlatform(p.x, p.y, p.w, 12);
    }
  }

  private createTestLevel(): void {
    this.worldWidth = 2500;
    this.add.text(this.worldWidth / 2, 20, '测试关卡 — 天宫道', {
      fontSize: '22px', color: '#ffcc00', fontFamily: 'SimHei, Arial',
    }).setOrigin(0.5).setDepth(50);

    this.createGround(0, 540, this.worldWidth, 20);
    this.createPlatform(750, 400, 180, 12);
    this.createPlatform(1100, 350, 200, 12);
    this.createPlatform(1500, 380, 180, 12);
    this.createPlatform(1850, 430, 200, 12);

    this.hero = new Hero(this, 150, 500, 1, this.inputMgr, this.soundMgr);

    const defaultMonsters = [1, 2, 7, 8, 3, 4, 5, 6, 15];
    const spawns = [
      { x: 500, y: 500 }, { x: 700, y: 500 }, { x: 850, y: 360 },
      { x: 1050, y: 500 }, { x: 1200, y: 310 }, { x: 1400, y: 500 },
      { x: 1600, y: 340 }, { x: 1800, y: 500 }, { x: 2000, y: 500 },
    ];
    for (let i = 0; i < spawns.length; i++) {
      const cfg = this.monsterConfigs.get(defaultMonsters[i % defaultMonsters.length]);
      if (cfg) {
        const m = new Monster(this, spawns[i].x, spawns[i].y, { ...cfg, id: i + 1 });
        this.monsters.push(m);
      }
    }
  }

  private createGround(x: number, y: number, width: number, height: number): void {
    const g = this.add.graphics();
    g.fillStyle(0x333344);
    g.fillRect(x, y, width, height);
    g.fillStyle(0x444455);
    g.fillRect(x, y, width, 2);
    this.groundColliders.push(new Phaser.Geom.Rectangle(x, y, width, height));
    this.wallRects.push(new Phaser.Geom.Rectangle(x, y, width, height));
  }

  private createPlatform(x: number, y: number, width: number, height: number): void {
    const g = this.add.graphics();
    g.fillStyle(0x555566);
    g.fillRect(x - width / 2, y, width, height);
    g.fillStyle(0x666677);
    g.fillRect(x - width / 2, y, width, 2);
    const rect = new Phaser.Geom.Rectangle(x - width / 2, y, width, height);
    this.groundColliders.push(rect);
    this.wallRects.push(rect);
  }

  update(time: number, delta: number): void {
    if (!this.hero || !this.hero.container.active) return;

    try {
      this.doUpdate(time, delta);
    } catch (e) {
      if (DEBUG) {
        console.error('[GameScene] update error:', e);
      }
    }
  }

  private doUpdate(time: number, delta: number): void {
    this.inputMgr.update(time);
    this.hero.step(time, delta);
    this.hero.groundDetect(this.groundColliders);
    this.hero.wallCollide(this.wallRects);

    this.updateStopPoints();
    this.updateWaveSpawning();

    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i];
      if (!m.nameText?.active) {
        if (m.isDead()) {
          this.hero.gainExp(m.config.exp || 10);
        }
        m.destroy();
        this.monsters.splice(i, 1);
        continue;
      }
      m.findTarget([this.hero]);
      m.step(time, delta);
      m.groundDetect(this.groundColliders);
      m.wallCollide(this.wallRects);
    }

    this.checkCombat();

    if (this.hero.container.active) {
      this.cameras.main.scrollX = this.hero.container.x - 470;
    }

    this.updateHUD();

    const allWavesDone = this.waves.length > 0 && this.waves.every(w => w.spawned >= w.totalNum);
    if (allWavesDone && this.monsters.length === 0) {
      this.showVictory();
    }
  }

  private updateStopPoints(): void {
    for (const sp of this.stopPoints) {
      if (!this.activatedStopPoints.has(sp.idx) && this.hero.container.x >= sp.x) {
        this.activatedStopPoints.add(sp.idx);
        if (sp.isBoss) {
          this.cameras.main.shake(200, 0.005);
        }
      }
    }
  }

  private updateWaveSpawning(): void {
    const maxOnScreen = GameConfig.MAX_MONSTER_PER_SCREEN;

    for (const wave of this.waves) {
      if (!this.activatedStopPoints.has(wave.stopPointIdx)) continue;
      if (wave.spawned >= wave.totalNum) continue;

      wave.elapsed++;
      if (wave.elapsed < wave.nextSpawn) continue;

      const aliveFromWave = this.monsters.filter(m => m.config.id === wave.enemyType && !m.isDead()).length;
      const totalAlive = this.monsters.filter(m => !m.isDead()).length;
      if (aliveFromWave >= 3 || totalAlive >= maxOnScreen) continue;

      const cfg = this.monsterConfigs.get(wave.enemyType);
      if (!cfg) {
        wave.spawned++;
        wave.nextSpawn = wave.elapsed + wave.interval;
        continue;
      }

      const sp = this.stopPoints.find(s => s.idx === wave.stopPointIdx);
      const spawnX = sp ? sp.x - 200 + Math.random() * 400 : this.hero.container.x + 400;

      const stageScale = this.getStageScale();
      const scaledCfg: MonsterConfig = {
        ...cfg,
        id: wave.enemyType,
        hp: Math.floor(cfg.hp * stageScale),
        attack: Math.floor(cfg.attack * stageScale),
        defense: Math.floor(cfg.defense * stageScale),
      };

      const m = new Monster(this, spawnX, 500, scaledCfg);
      this.monsters.push(m);
      wave.spawned++;
      wave.nextSpawn = wave.elapsed + wave.interval;

      if (wave.spawned >= wave.totalNum) break;
    }
  }

  private checkCombat(): void {
    for (const b of this.hero.bullets) {
      for (const m of this.monsters) {
        if (b.isDestroyed || !m.nameText?.active) continue;
        if (b.checkHitTarget(m)) {
          const dmg = b.getDamage();
          m.takeDamage(dmg, b.getAttackKind(), this.hero);
          this.showDmgNum(m.container.x, m.container.y - 60, dmg, '#ffff00');
        }
      }
    }
    for (const m of this.monsters) {
      for (const b of m.bullets) {
        if (b.isDestroyed || !this.hero.container.active) continue;
        if (b.checkHitTarget(this.hero)) {
          const dmg = b.getDamage();
          this.hero.takeDamage(dmg, b.getAttackKind(), m);
          this.showDmgNum(this.hero.container.x, this.hero.container.y - 70, dmg, '#ff4444');
        }
      }
    }
  }

  private showDmgNum(x: number, y: number, damage: number, color: string): void {
    const txt = this.add.text(x + (Math.random() - 0.5) * 20, y, Math.floor(damage).toString(), {
      fontSize: '13px', color, fontStyle: 'bold', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({
      targets: txt, y: y - 25, alpha: 0, duration: 500,
      onComplete: () => txt.destroy(),
    });
  }

  private updateHUD(): void {
    if (this.hudScene && this.hudScene.scene.isActive()) {
      this.hudScene.updateStats(
        this.hero.hp, this.hero.maxHp,
        this.hero.mp, this.hero.maxMp,
        this.hero.level, this.hero.exper, this.hero.expToLevel,
        this.monsters.length
      );
    }
  }

  private showVictory(): void {
    if (this.victoryShown) return;
    this.victoryShown = true;

    const txt = this.add.text(470, 250, '关 卡 完 成 !', {
      fontSize: '52px', color: '#ffcc00', fontStyle: 'bold',
      fontFamily: 'SimHei, Arial', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

    this.tweens.add({
      targets: txt, alpha: 0, delay: 2500, duration: 500,
      onComplete: () => txt.destroy(),
    });
  }
}
