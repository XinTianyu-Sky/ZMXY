import Phaser from 'phaser';
import { BaseEntity, EntityAction } from './BaseEntity';
import { InputManager } from '../core/InputManager';
import { GameConfig } from '../core/GameConfig';
import { Bullet } from './Bullet';
import { SoundManager } from '../core/SoundManager';
import skillsData from '../config/skills.json';

interface SkillDef {
  id: string;
  name: string;
  action: string;
  mpCost: number[];
  damageKind: string;
  damageFormula?: string;
  description?: string;
  timers?: number;
  addProtection?: number;
}

const ANIM_FRAMES: Record<string, { start: number; end: number }> = {
  wait:  { start: 0,  end: 5 },
  walk:  { start: 12, end: 15 },
  run:   { start: 18, end: 21 },
  jump1: { start: 24, end: 27 },
  jump2: { start: 30, end: 34 },
  jump3: { start: 25, end: 27 },
  hit1:  { start: 36, end: 40 },
  hit2:  { start: 36, end: 40 },
  hit3:  { start: 42, end: 46 },
  hit4:  { start: 48, end: 52 },
  hit5:  { start: 54, end: 58 },
  hit6:  { start: 60, end: 63 },
  hit7:  { start: 72, end: 73 },
  hit8:  { start: 66, end: 69 },
  hit9:  { start: 26, end: 26 },
  hit10: { start: 27, end: 27 },
  hit11: { start: 28, end: 29 },
  hit12: { start: 72, end: 75 },
  hit13: { start: 75, end: 75 },
  hit14: { start: 78, end: 80 },
  hurt:  { start: 74, end: 74 },
  dead:  { start: 74, end: 74 },
};

export class Hero extends BaseEntity {
  public heroId: number;
  public input: InputManager;
  public bullets: Bullet[] = [];
  public sprite: Phaser.GameObjects.Sprite;

  public level: number = 1;
  public exper: number = 0;
  public expToLevel: number = 135;

  public eatBlood: number = 0;
  public deepHit: number = 0;
  public regenHp: number = 1;
  public regenMp: number = 1;

  private comboStep: number = 0;
  private comboTimer: number = 0;
  private comboWindow: number = 30;
  private gxpMode: boolean = false;
  private gxpTimer: number = 0;
  private lastRegenTime: number = 0;
  private attackTimer: number = 0;

  private skillDefs: SkillDef[] = [];
  private expTable: number[] = [];
  private heroCfg: any;
  private soundMgr: SoundManager;
  private prevAction: EntityAction = EntityAction.WAIT;

  constructor(scene: Phaser.Scene, x: number, y: number, heroId: number, input: InputManager, soundMgr: SoundManager) {
    const colors = [0xffcc00, 0x3399ff, 0xff99cc, 0x99ff99];
    const labels = ['W', 'B', 'T', 'S'];
    super(scene, x, y, colors[heroId - 1] || 0xffcc00, labels[heroId - 1] || '?', 48, 80);
    this.heroId = heroId;
    this.input = input;
    this.soundMgr = soundMgr;

    this.bodyGraphic.clear();
    this.bodyGraphic.setVisible(false);

    this.sprite = scene.add.sprite(0, 0, 'wukong', 0);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(0.65);
    this.container.add(this.sprite);

    this.createAnimations(scene);

    const heroCfg = (skillsData as any).wukong;
    this.heroCfg = heroCfg;
    this.expTable = ((skillsData as any).expCurve?.table || [135, 145, 155, 165, 175, 185, 625, 675, 725, 775, 825, 875, 1950, 2050, 2150, 2250, 2350, 2450, 5000]) as number[];
    this.maxHp = heroCfg.baseHp;
    this.maxMp = heroCfg.baseMp;
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    this.attackPower = heroCfg.baseAttack;
    this.defense = heroCfg.baseDefense;
    this.horizenSpeed = heroCfg.horizenSpeed || GameConfig.HORIZEN_SPEED;
    this.expToLevel = this.expTable[0] || 135;

    this.loadSkillDefs(heroCfg);
    this.initAttackData(heroCfg);
  }

  private createAnimations(scene: Phaser.Scene): void {
    const frameRate = 10;
    for (const [key, range] of Object.entries(ANIM_FRAMES)) {
      if (scene.anims.exists(`wukong_${key}`)) continue;
      const repeat = (key === 'wait' || key === 'walk' || key === 'run') ? -1 : 0;
      scene.anims.create({
        key: `wukong_${key}`,
        frames: scene.anims.generateFrameNumbers('wukong', { start: range.start, end: range.end }),
        frameRate,
        repeat,
      });
    }
  }

  private updateSprite(): void {
    if (this.curAction === this.prevAction) return;
    this.prevAction = this.curAction;
    const animKey = `wukong_${this.curAction}`;
    if (this.scene.anims.exists(animKey)) {
      this.sprite.play(animKey);
    }
  }

  private loadSkillDefs(heroCfg: any): void {
    const skillMap = heroCfg.skills || {};
    const skillKeys = ['slz', 'zz', 'sx', 'qsez', 'hmz', 'lys', 'hytj', 'lyfb', 'jdy', 'hyjj'];
    for (const key of skillKeys) {
      if (skillMap[key]) {
        this.skillDefs.push(skillMap[key] as SkillDef);
      }
    }
  }

  private initAttackData(heroCfg: any): void {
    const chain = heroCfg.hitChain || {};
    for (let i = 1; i <= 5; i++) {
      const hitData = chain[`hit${i}`] || { multiplier: 0.7 + i * 0.15, attackKind: 'physics' };
      this.attackBackInfoDict.set(`hit${i}`, {
        attackKind: hitData.attackKind || 'physics',
        damageRate: hitData.multiplier || 0.8,
        attackX: 40, attackY: -20, attackWidth: 60, attackHeight: 50,
      });
    }
  }

  step(time: number, delta: number): void {
    if (this.isDead()) return;

    if (this.attackTimer > 0) {
      this.attackTimer--;
      if (this.attackTimer === 0) {
        this.curAction = EntityAction.WAIT;
        this.prevAction = this.curAction;
      }
    }

    this.processInput(time);
    super.step(time, delta);

    this.container.setDepth(this.container.y);

    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer === 0) this.comboStep = 0;
    }

    if (this.gxpMode) {
      this.gxpTimer--;
      if (this.gxpTimer <= 0) {
        this.gxpMode = false;
        this.horizenSpeed = GameConfig.HORIZEN_SPEED;
        this.attackPower = Math.floor(this.attackPower / 1.5);
      }
    }

    this.clampToScreen();
    this.regen(time);

    if (this.fatherCount > 0 && this.fatherCount % 4 < 2) {
      this.sprite.setTint(0xffffff);
    } else {
      this.sprite.clearTint();
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].step(time, delta);
      if (this.bullets[i].isDestroyed) {
        this.bullets[i].destroy();
        this.bullets.splice(i, 1);
      }
    }
  }

  private processInput(time: number): void {
    const state = this.input.state;

    if (this.isBeAttacking()) return;

    if (state.attackJustDown && this.isWaiting() && this.attackTimer <= 0) {
      this.doAttack();
      return;
    }

    if (this.attackTimer <= 0) {
      if (state.skill1) { this.doSkill(0); return; }
      if (state.skill2) { this.doSkill(1); return; }
      if (state.skill3) { this.doSkill(2); return; }
      if (state.skill4) { this.doSkill(3); return; }
      if (state.skill5) { this.doSkill(4); return; }
      if (state.magic) { this.turnToGXP(); return; }
    }

    if (state.jumpJustDown && !this.isJumping() && this.attackTimer <= 0) {
      this.jump();
      this.soundMgr.playSFX('jump');
      return;
    }

    this.horizenSpeed = this.input.isRunning ? GameConfig.HORIZEN_RUN_SPEED : GameConfig.HORIZEN_SPEED;
    this.setSpeed(state.left, state.right);

    if (this.isWaiting()) {
      if (state.left || state.right) {
        this.setAction(this.input.isRunning ? EntityAction.RUN : EntityAction.WALK);
      }
    } else if (this.isWalking()) {
      if (!state.left && !state.right) {
        this.setAction(EntityAction.WAIT);
      }
    }
  }

  private setAction(action: EntityAction): void {
    this.curAction = action;
    this.updateSprite();
  }

  override jump(): void {
    super.jump();
    this.updateSprite();
  }

  protected override updateFacing(): void {
    this.sprite.setFlipX(this.isFacingRight);
  }

  private doAttack(): void {
    this.comboTimer = this.comboWindow;
    this.comboStep = (this.comboStep % 5) + 1;
    this.attackTimer = 30;
    this.setAction(`hit${this.comboStep}` as EntityAction);
    this.soundMgr.playSFX(`hit${this.comboStep}`);

    const info = this.attackBackInfoDict.get(`hit${this.comboStep}`);
    if (info) {
      const dir = this.isFacingRight ? 1 : -1;
      const b = new Bullet(this.scene, this.container.x + dir * 40, this.container.y - 40, this, info);
      b.speed.x = dir * 8;
      b.maxAttackCount = 1;
      this.bullets.push(b);
    }
  }

  private doSkill(slotIdx: number): void {
    const skill = this.skillDefs[slotIdx];
    if (!skill || skill.action === 'passive') return;

    const skillLevel = 1;
    const levelIdx = Math.min(skillLevel - 1, skill.mpCost.length - 1);
    const mpCost = skill.mpCost[levelIdx] || 20;
    if (this.mp < mpCost) return;

    this.mp -= mpCost;
    const dir = this.isFacingRight ? 1 : -1;

    let actionName = '';
    switch (skill.action) {
      case 'hit6':
        this.setAction(EntityAction.HIT6);
        actionName = 'hit6';
        for (let i = 0; i < 3; i++) {
          const b = new Bullet(this.scene, this.container.x + dir * 40, this.container.y - 40 - i * 20, this, {
            attackKind: 'magic', damageRate: 0.8, attackX: dir * 60, attackY: -20, attackWidth: 60, attackHeight: 40,
          });
          b.speed.set(dir * 6, 0);
          this.bullets.push(b);
        }
        break;
      case 'hit7':
        this.setAction(EntityAction.HIT7);
        actionName = 'hit7';
        for (let i = 0; i < 5; i++) {
          const b = new Bullet(this.scene, this.container.x + dir * 40, this.container.y - 30 - i * 15, this, {
            attackKind: 'magic', damageRate: 0.5, attackX: dir * 50, attackY: -10, attackWidth: 50, attackHeight: 30,
          });
          b.speed.set(dir * 7, -1 + i * 0.5);
          this.bullets.push(b);
        }
        break;
      case 'hit8':
        this.setAction(EntityAction.HIT8);
        actionName = 'hit8';
        for (let i = 0; i < 6; i++) {
          const angle = -Math.PI / 2 + (i / 5) * Math.PI;
          const b = new Bullet(this.scene, this.container.x, this.container.y - 50, this, {
            attackKind: 'magic', damageRate: 0.45, attackX: 0, attackY: -15, attackWidth: 40, attackHeight: 30,
          });
          b.speed.set(Math.cos(angle) * 5, Math.sin(angle) * 5);
          this.bullets.push(b);
        }
        break;
      case 'hit9':
        this.setAction(EntityAction.HIT9);
        actionName = 'hit9';
        this.speed.x = dir * GameConfig.HORIZEN_RUN_SPEED * 1.5;
        const b9 = new Bullet(this.scene, this.container.x, this.container.y - 40, this, {
          attackKind: 'physics', damageRate: 0.6, attackX: dir * 50, attackY: -20, attackWidth: 60, attackHeight: 50,
        });
        b9.speed.x = dir * 10;
        b9.maxAttackCount = 3;
        this.bullets.push(b9);
        break;
      case 'hit10':
        this.setAction(EntityAction.HIT10);
        actionName = 'hit10';
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const b = new Bullet(this.scene, this.container.x, this.container.y - 50, this, {
            attackKind: 'physics', damageRate: 0.5, attackX: 0, attackY: -20, attackWidth: 40, attackHeight: 40,
          });
          b.speed.set(Math.cos(angle) * 5, Math.sin(angle) * 5);
          this.bullets.push(b);
        }
        break;
      case 'hit11':
        this.setAction(EntityAction.HIT11);
        actionName = 'hit11';
        const b11 = new Bullet(this.scene, this.container.x + dir * 30, this.container.y - 60, this, {
          attackKind: 'magic', damageRate: 0.55, attackX: dir * 40, attackY: -30, attackWidth: 50, attackHeight: 60,
        });
        b11.speed.set(dir * 3, -8);
        b11.maxAttackCount = 3;
        this.bullets.push(b11);
        break;
      case 'hit12':
        this.setAction(EntityAction.HIT12);
        actionName = 'hit12';
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const b = new Bullet(this.scene, this.container.x, this.container.y, this, {
            attackKind: 'magic', damageRate: 0.55, attackX: 0, attackY: -15, attackWidth: 45, attackHeight: 30,
          });
          b.speed.set(Math.cos(angle) * 4, Math.sin(angle) * 4 - 3);
          this.bullets.push(b);
        }
        break;
      case 'hit13':
        this.setAction(EntityAction.HIT13);
        actionName = 'hit13';
        for (let i = 0; i < 5; i++) {
          const b = new Bullet(this.scene, this.container.x + dir * (30 + i * 25), this.container.y - 40, this, {
            attackKind: 'physics', damageRate: 0.35, attackX: dir * 30, attackY: -20, attackWidth: 45, attackHeight: 45,
          });
          b.speed.set(dir * 4, 0);
          b.maxAttackCount = 2;
          this.bullets.push(b);
        }
        break;
      case 'hit14':
        this.setAction(EntityAction.HIT14);
        actionName = 'hit14';
        const b14 = new Bullet(this.scene, this.container.x + dir * 35, this.container.y - 30, this, {
          attackKind: 'physics', damageRate: 1.2, attackX: dir * 55, attackY: -30, attackWidth: 70, attackHeight: 60,
        });
        b14.speed.x = dir * 10;
        b14.maxAttackCount = 1;
        this.bullets.push(b14);
        break;
      default:
        this.setAction(EntityAction.HIT1);
        actionName = 'hit1';
        break;
    }
    this.attackTimer = 20;
    this.soundMgr.playSFX(actionName);
  }

  private turnToGXP(): void {
    if (this.mp < 100) return;
    this.mp -= 100;
    this.gxpMode = true;
    this.gxpTimer = 300;
    this.horizenSpeed = GameConfig.HORIZEN_RUN_SPEED;
    this.attackPower = Math.floor(this.attackPower * 1.5);
  }

  takeDamage(rawDamage: number, attackKind: 'physics' | 'magic', source: BaseEntity): number {
    if (this.getIsYourFather() || this.isDead()) return 0;
    if (this.miss > 0 && Math.random() * 100 <= this.miss) return 0;

    let dmg = attackKind === 'magic'
      ? rawDamage * (1 - this.magicDef / 100)
      : rawDamage - this.defense;
    if (dmg < GameConfig.DAMAGE_MIN) dmg = GameConfig.DAMAGE_MIN;
    if (Math.random() * 100 <= this.crit) dmg *= 2;

    this.hp -= dmg;
    this.setYourFather(this.fatherMaxCount);

    if (this.hp <= 0) { this.hp = 0; this.die(); }
    else { this.setAction(EntityAction.HURT); this.soundMgr.playSFX('beAttack'); }

    return dmg;
  }

  die(): void {
    this.curAction = EntityAction.DEAD;
    this.updateSprite();
    this.soundMgr.playSFX('dead');
    this.sprite.setAlpha(0.5);
  }

  gainExp(amount: number): boolean {
    if (this.isDead()) return false;
    this.exper += amount;
    let leveled = false;
    while (this.exper >= this.expToLevel && this.level < 50) {
      this.exper -= this.expToLevel;
      this.level++;
      leveled = true;

      this.maxHp += this.heroCfg.hpPerLevel || 50;
      this.maxMp += this.heroCfg.mpPerLevel || 20;
      this.attackPower += this.heroCfg.attackPerLevel || 5;
      this.defense += this.heroCfg.defensePerLevel || 2;
      this.hp = this.maxHp;
      this.mp = this.maxMp;

      const idx = Math.min(this.level - 1, this.expTable.length - 1);
      this.expToLevel = this.expTable[idx] || 5000;
    }
    return leveled;
  }

  private regen(time: number): void {
    const tick = Math.floor(time / 1000);
    if (tick !== this.lastRegenTime) {
      this.lastRegenTime = tick;
      this.hp = Math.min(this.hp + this.regenHp, this.maxHp);
      this.mp = Math.min(this.mp + this.regenMp, this.maxMp);
    }
  }

  override destroy(): void {
    for (const b of this.bullets) b.destroy();
    this.bullets = [];
    super.destroy();
  }
}
