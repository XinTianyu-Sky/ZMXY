import Phaser from 'phaser';
import { BaseEntity, EntityAction } from './BaseEntity';
import { GameConfig } from '../core/GameConfig';

export interface BulletInfo {
  attackKind: 'physics' | 'magic';
  damageRate: number;
  attackX: number;
  attackY: number;
  attackWidth: number;
  attackHeight: number;
}

export class Bullet extends BaseEntity {
  public source: BaseEntity;
  public bulletInfo: BulletInfo;
  public isDestroyed = false;
  public maxAttackCount: number = 1;
  protected attackInterval: number = 6;
  private attackTimer: number = 0;
  private destroyTimer: number = 120;
  private hitTargets: Set<BaseEntity> = new Set();

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    source: BaseEntity, info: BulletInfo
  ) {
    super(scene, x, y, info.attackKind === 'magic' ? 0x00ccff : 0xffff00, '', 8, 8);
    this.source = source;
    this.bulletInfo = info;
  }

  protected drawBody(): void {
    const g = this.bodyGraphic;
    g.clear();
    g.fillStyle(this.bodyColor);
    g.fillCircle(0, 0, 4);
    if (this.bulletInfo.attackKind === 'magic') {
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(0, 0, 2);
    }
  }

  get displayWidth(): number { return 8; }
  get displayHeight(): number { return 8; }

  override step(time: number, delta: number): void {
    if (this.isDestroyed) return;
    this.container.x += this.speed.x;
    this.container.y += this.speed.y;
    this.destroyTimer--;
    if (this.destroyTimer <= 0) {
      this.isDestroyed = true; return;
    }
    this.attackTimer--;
    if (this.attackTimer <= 0) {
      this.attackTimer = this.attackInterval;
    }
  }

  checkHitTarget(target: BaseEntity): boolean {
    if (this.isDestroyed) return false;
    if (this.hitTargets.has(target)) return false;
    if (target === this.source) return false;
    if (target.getIsYourFather()) return false;
    if (this.checkHitTest(target)) {
      this.hitTargets.add(target);
      this.maxAttackCount--;
      if (this.maxAttackCount <= 0) this.isDestroyed = true;
      return true;
    }
    return false;
  }

  getDamage(): number {
    return Math.floor(this.source.attackPower * this.bulletInfo.damageRate);
  }

  getAttackKind(): 'physics' | 'magic' {
    return this.bulletInfo.attackKind;
  }
}
