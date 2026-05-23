import Phaser from 'phaser';
import { GameConfig } from '../core/GameConfig';

export enum EntityAction {
  WAIT = 'wait',
  WAIT2 = 'wait2',
  WALK = 'walk',
  RUN = 'run',
  JUMP1 = 'jump1',
  JUMP2 = 'jump2',
  JUMP3 = 'jump3',
  HURT = 'hurt',
  DEAD = 'dead',
  HIT1 = 'hit1',
  HIT2 = 'hit2',
  HIT3 = 'hit3',
  HIT4 = 'hit4',
  HIT5 = 'hit5',
  HIT6 = 'hit6',
  HIT7 = 'hit7',
  HIT8 = 'hit8',
  HIT9 = 'hit9',
  HIT10 = 'hit10',
  HIT11 = 'hit11',
  HIT12 = 'hit12',
  HIT13 = 'hit13',
  HIT14 = 'hit14',
}

export interface HitBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class BaseEntity {
  public scene: Phaser.Scene;
  public bodyGraphic: Phaser.GameObjects.Graphics;
  public container: Phaser.GameObjects.Container;
  public speed: Phaser.Math.Vector2;
  public enforceSpeed: Phaser.Math.Vector2;
  public curAction: EntityAction = EntityAction.WAIT;
  public isFacingRight = true;
  public gravity: number = GameConfig.GRAVITY;
  public horizenSpeed: number = GameConfig.HORIZEN_SPEED;

  public hp: number = 100;
  public maxHp: number = 100;
  public mp: number = 100;
  public maxMp: number = 100;
  public attackPower: number = 10;
  public defense: number = 2;
  public magicDef: number = 0;
  public crit: number = 5;
  public miss: number = 0;

  public jumpCount: number = 0;
  public maxJumpCount: number = 2;
  public standOnWall: boolean = false;

  public fatherCount: number = 0;
  protected fatherMaxCount: number = 19;

  private entityWidth = 48;
  private entityHeight = 80;

  public bodyColor: number;
  private bodyLabel: string;

  public attackBackInfoDict: Map<string, {
    attackKind: 'physics' | 'magic';
    damageRate: number;
    attackX: number;
    attackY: number;
    attackWidth: number;
    attackHeight: number;
  }> = new Map();

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, label: string, width = 48, height = 80) {
    this.scene = scene;
    this.bodyColor = color;
    this.bodyLabel = label;
    this.entityWidth = width;
    this.entityHeight = height;
    this.speed = new Phaser.Math.Vector2(0, 0);
    this.enforceSpeed = new Phaser.Math.Vector2(0, 0);

    this.container = scene.add.container(x, y);
    this.bodyGraphic = scene.add.graphics();
    this.container.add(this.bodyGraphic);
    this.drawBody();
  }

  get x(): number { return this.container.x; }
  set x(v: number) { this.container.x = v; }
  get y(): number { return this.container.y; }
  set y(v: number) { this.container.y = v; }

  get displayWidth(): number { return this.entityWidth; }
  get displayHeight(): number { return this.entityHeight; }

  protected drawBody(): void {
    const g = this.bodyGraphic;
    g.clear();

    const r = (this.bodyColor >> 16) & 0xff;
    const gr = (this.bodyColor >> 8) & 0xff;
    const b = this.bodyColor & 0xff;

    if (this.isDead()) {
      g.fillStyle(0x666666, 0.5);
    } else if (this.isBeAttacking()) {
      g.fillStyle(0xff4444);
    } else if (this.fatherCount > 0 && this.fatherCount % 4 < 2) {
      g.fillStyle(0xffffff, 0.3);
    } else {
      g.fillStyle(this.bodyColor);
    }

    const hw = this.entityWidth / 2;
    g.fillRoundedRect(-hw, -this.entityHeight, this.entityWidth, this.entityHeight, 6);

    const label = this.scene.add.text(0, -this.entityHeight / 2, this.bodyLabel, {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(label);
  }

  isWaiting(): boolean { return this.curAction === EntityAction.WAIT || this.curAction === EntityAction.WAIT2; }
  isWalking(): boolean { return this.curAction === EntityAction.WALK || this.curAction === EntityAction.RUN; }
  isJumping(): boolean { return this.curAction.startsWith('jump'); }
  isInSky(): boolean { return !this.standOnWall; }
  isBeAttacking(): boolean { return this.curAction === EntityAction.HURT; }
  isAttacking(): boolean { return this.curAction.startsWith('hit'); }
  isDead(): boolean { return this.curAction === EntityAction.DEAD; }

  step(_time: number, _delta: number): void {
    if (this.isBeAttacking()) {
      this.speed.x = 0;
    }

    this.container.x += this.speed.x;
    this.container.y += this.speed.y;
    this.speed.y += this.gravity;

    this.container.x += this.enforceSpeed.x;
    this.container.y += this.enforceSpeed.y;

    if (this.fatherCount > 0) {
      this.fatherCount--;
    }
  }

  setSpeed(left: boolean, right: boolean): void {
    if (this.isBeAttacking()) return;
    if (left) {
      this.speed.x = -this.horizenSpeed;
      this.isFacingRight = false;
    } else if (right) {
      this.speed.x = this.horizenSpeed;
      this.isFacingRight = true;
    } else {
      this.speed.x = 0;
    }
    this.updateFacing();
  }

  protected updateFacing(): void {
    this.container.setScale(this.isFacingRight ? 1 : -1, 1);
  }

  jump(): void {
    if (this.jumpCount >= this.maxJumpCount) return;
    this.speed.y = GameConfig.JUMP_POWER;
    this.standOnWall = false;
    this.jumpCount++;
    this.curAction = this.jumpCount === 1 ? EntityAction.JUMP1 : EntityAction.JUMP2;
  }

  groundDetect(walls: Phaser.Geom.Rectangle[]): void {
    if (this.speed.y < 0) return;

    for (const wb of walls) {
      const myLeft = this.container.x - this.entityWidth / 2;
      const myRight = this.container.x + this.entityWidth / 2;
      const myBottom = this.container.y;

      if (myRight > wb.left && myLeft < wb.right && myBottom <= wb.top + 8 && myBottom >= wb.top - 12) {
        this.container.y = wb.top;
        this.speed.y = 0;
        this.standOnWall = true;
        this.jumpCount = 0;
        if (this.isJumping()) {
          this.curAction = EntityAction.WAIT;
        }
        return;
      }
    }
    this.standOnWall = false;
  }

  wallCollide(walls: Phaser.Geom.Rectangle[]): void {
    for (const wb of walls) {
      const myLeft = this.container.x - this.entityWidth / 2;
      const myRight = this.container.x + this.entityWidth / 2;
      const myTop = this.container.y - this.entityHeight;
      const myBottom = this.container.y;

      if (myRight > wb.left && myLeft < wb.right && myBottom > wb.top && myTop < wb.bottom) {
        const ol = myRight - wb.left;
        const or_ = wb.right - myLeft;
        const ot = myBottom - wb.top;
        const ob = wb.bottom - myTop;
        const min = Math.min(ol, or_, ot, ob);

        if (min === ot) {
          this.container.y = wb.top;
          this.speed.y = 0; this.jumpCount = 0;
        } else if (min === ob) {
          this.container.y = wb.bottom + this.entityHeight;
          this.speed.y = 0;
        } else if (min === ol) {
          this.container.x = wb.left - this.entityWidth / 2;
          this.speed.x = 0;
        } else {
          this.container.x = wb.right + this.entityWidth / 2;
          this.speed.x = 0;
        }
      }
    }
  }

  setYourFather(frames: number): void {
    this.fatherCount = frames;
  }

  getIsYourFather(): boolean {
    return this.fatherCount > 0;
  }

  clampToScreen(leftBound = GameConfig.SCREEN_LEFT_BOUND, rightBound = GameConfig.SCREEN_RIGHT_BOUND): void {
    if (this.container.x < leftBound) this.container.x = leftBound;
    if (this.container.x > rightBound) this.container.x = rightBound;
  }

  getHitBox(): HitBox {
    return {
      x: this.container.x - this.entityWidth / 2,
      y: this.container.y - this.entityHeight,
      width: this.entityWidth,
      height: this.entityHeight,
    };
  }

  checkHitTest(target: BaseEntity): boolean {
    const a = this.getHitBox();
    const b = target.getHitBox();
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  destroy(): void {
    this.container.destroy();
  }
}
