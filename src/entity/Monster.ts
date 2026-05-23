import Phaser from 'phaser';
import { BaseEntity, EntityAction } from './BaseEntity';
import { Hero } from './Hero';
import { Bullet } from './Bullet';
import { GameConfig } from '../core/GameConfig';

export interface MonsterConfig {
  id: number;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  magicDef: number;
  exp: number;
  speed: number;
  attackRange: number;
  searchRange: number;
}

interface MonsterSpriteCfg {
  key: string;
  cellSize: number;
}

const MONSTER_SPRITES: Record<number, MonsterSpriteCfg> = {
  1: { key: 'monster1', cellSize: 300 },
  2: { key: 'monster2', cellSize: 190 },
  4: { key: 'monster4', cellSize: 190 },
  7: { key: 'monster7', cellSize: 150 },
  8: { key: 'monster8', cellSize: 150 },
};

const COLORS = [
  0xff4444, 0xff6644, 0xff8844, 0xcc3333, 0xee5555,
  0x884444, 0xaa3333, 0xff2222, 0xdd4444, 0x993333,
];

export class Monster extends BaseEntity {
  public config: MonsterConfig;
  public target: Hero | null = null;
  public bullets: Bullet[] = [];
  public nameText: Phaser.GameObjects.Text;
  public sprite?: Phaser.GameObjects.Sprite;

  private aiTimer: number = 0;
  private attackTimer: number = 0;
  private patrolDir: number = 1;
  private patrolTimer: number = 0;
  private hpBarBg: Phaser.GameObjects.Graphics;
  private hpBarFill: Phaser.GameObjects.Graphics;
  private prevAction: EntityAction = EntityAction.WAIT;

  constructor(scene: Phaser.Scene, x: number, y: number, config: MonsterConfig) {
    const color = COLORS[(config.id - 1) % COLORS.length];
    const label = config.name.charAt(0);
    super(scene, x, y, color, label, 44, 72);
    this.config = config;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.attackPower = config.attack;
    this.defense = config.defense;
    this.magicDef = config.magicDef;
    this.horizenSpeed = config.speed;

    const spriteCfg = MONSTER_SPRITES[config.id];
    if (spriteCfg && scene.textures.exists(spriteCfg.key)) {
      this.bodyGraphic.clear();
      this.bodyGraphic.setVisible(false);

      this.sprite = scene.add.sprite(0, 0, spriteCfg.key, 0);
      this.sprite.setOrigin(0.5, 1);
      const scale = 100 / spriteCfg.cellSize;
      this.sprite.setScale(scale);
      this.container.add(this.sprite);
      this.createMonsterAnims(scene, spriteCfg.key);
    }

    this.nameText = scene.add.text(x, y - 60, config.name, {
      fontSize: '10px', color: '#ff6666', fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.hpBarBg = scene.add.graphics();
    this.hpBarFill = scene.add.graphics();
  }

  private createMonsterAnims(scene: Phaser.Scene, key: string): void {
    const cols = 6;
    const rows: Record<string, { start: number; end: number; repeat: number }> = {
      wait:  { start: 0,         end: 5,             repeat: -1 },
      walk:  { start: cols,      end: cols + 3,      repeat: -1 },
      hurt:  { start: cols * 2,  end: cols * 2,      repeat: 0 },
      dead:  { start: cols * 3,  end: cols * 3 + 4,  repeat: 0 },
      hit1:  { start: cols * 4,  end: cols * 4 + 3,  repeat: 0 },
      hit2:  { start: cols * 5,  end: cols * 5 + 3,  repeat: 0 },
    };

    for (const [name, range] of Object.entries(rows)) {
      const animKey = `${key}_${name}`;
      if (scene.anims.exists(animKey)) continue;
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(key, { start: range.start, end: range.end }),
        frameRate: 10,
        repeat: range.repeat,
      });
    }
  }

  private updateSprite(): void {
    if (!this.sprite) return;
    if (this.curAction === this.prevAction) return;
    this.prevAction = this.curAction;

    const key = MONSTER_SPRITES[this.config.id]?.key;
    if (!key) return;

    let animKey = `${key}_${this.curAction}`;
    if (!this.scene.anims.exists(animKey)) {
      animKey = `${key}_wait`;
    }

    if (this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.play(animKey);
    }
  }

  private setAction(action: EntityAction): void {
    this.curAction = action;
    this.updateSprite();
  }

  protected override updateFacing(): void {
    if (this.sprite) {
      this.sprite.setFlipX(this.isFacingRight);
    }
  }

  step(time: number, delta: number): void {
    if (this.isDead()) { this.updateUI(); return; }

    if (this.attackTimer > 0) {
      this.attackTimer--;
      if (this.attackTimer === 0) {
        this.setAction(EntityAction.WAIT);
      }
    }

    this.updateAI();
    super.step(time, delta);
    this.updateSprite();
    this.updateUI();

    this.container.setDepth(this.container.y);

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].step(time, delta);
      if (this.bullets[i].isDestroyed) {
        this.bullets[i].destroy();
        this.bullets.splice(i, 1);
      }
    }

    this.clampToScreen();
  }

  private updateUI(): void {
    this.nameText.setPosition(this.container.x, this.container.y - 60);
    const bx = this.container.x - 22;
    const by = this.container.y - 55;
    this.hpBarBg.clear();
    this.hpBarBg.fillStyle(0x000000);
    this.hpBarBg.fillRect(bx, by, 44, 4);

    const ratio = Math.max(0, this.hp / this.maxHp);
    const fillColor = ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBarFill.clear();
    this.hpBarFill.fillStyle(fillColor);
    this.hpBarFill.fillRect(bx, by, 44 * ratio, 4);
  }

  private updateAI(): void {
    this.aiTimer--;

    if (!this.target || this.target.isDead()) {
      this.target = null;
      this.patrol();
      return;
    }

    const dist = Phaser.Math.Distance.Between(
      this.container.x, this.container.y, this.target.container.x, this.target.container.y
    );

    if (dist > this.config.searchRange) {
      this.target = null;
      this.setAction(EntityAction.WAIT);
      return;
    }

    const dir = this.target.container.x > this.container.x ? 1 : -1;
    this.isFacingRight = dir > 0;
    this.updateFacing();

    if (dist <= this.config.attackRange) {
      if (this.aiTimer <= 0 && this.attackTimer <= 0) {
        this.attack();
        this.aiTimer = 60;
      } else if (this.attackTimer <= 0) {
        this.setAction(EntityAction.WAIT);
        this.speed.x = 0;
      }
    } else {
      this.setAction(EntityAction.WALK);
      this.speed.x = dir * this.horizenSpeed;
    }
  }

  private patrol(): void {
    this.patrolTimer--;
    if (this.patrolTimer <= 0) {
      this.patrolDir = Math.random() > 0.5 ? 1 : -1;
      this.patrolTimer = 120 + Math.random() * 120;
    }
    this.isFacingRight = this.patrolDir > 0;
    this.updateFacing();
    if (Math.random() < 0.3) {
      this.speed.x = this.patrolDir * this.horizenSpeed * 0.5;
      this.setAction(EntityAction.WALK);
    } else {
      this.speed.x = 0;
      this.setAction(EntityAction.WAIT);
    }
  }

  private attack(): void {
    this.attackTimer = 9;
    this.setAction(EntityAction.HIT1);
    const dir = this.isFacingRight ? 1 : -1;
    const b = new Bullet(this.scene, this.container.x + dir * 30, this.container.y - 20, this, {
      attackKind: 'physics', damageRate: 1.0, attackX: dir * 40, attackY: -10, attackWidth: 50, attackHeight: 40,
    });
    b.speed.x = dir * 5;
    b.maxAttackCount = 1;
    this.bullets.push(b);
  }

  findTarget(heroes: Hero[]): void {
    if (this.target && !this.target.isDead()) return;
    let closestDist = Infinity;
    let closest: Hero | null = null;
    for (const h of heroes) {
      if (h.isDead()) continue;
      const d = Phaser.Math.Distance.Between(this.container.x, this.container.y, h.container.x, h.container.y);
      if (d < closestDist && d < this.config.searchRange) {
        closestDist = d;
        closest = h;
      }
    }
    this.target = closest;
  }

  takeDamage(damage: number, attackKind: 'physics' | 'magic', source: BaseEntity): number {
    if (this.getIsYourFather()) return 0;
    if (!this.nameText.active) return 0;

    let final = attackKind === 'magic'
      ? damage * (1 - this.magicDef / 100)
      : damage - this.defense;
    if (final < GameConfig.DAMAGE_MIN) final = GameConfig.DAMAGE_MIN;

    this.hp -= final;
    this.setYourFather(10);

    if (this.hp <= 0) { this.hp = 0; this.die(); return final; }
    this.setAction(EntityAction.HURT);
    return final;
  }

  die(): void {
    this.setAction(EntityAction.DEAD);
    this.scene.tweens.add({
      targets: [this.bodyGraphic, this.hpBarBg, this.hpBarFill],
      alpha: 0, duration: 500,
      onComplete: () => {
        this.nameText.destroy();
        this.hpBarBg.destroy();
        this.hpBarFill.destroy();
      },
    });
    if (this.sprite) {
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0, duration: 500,
      });
    }
  }

  override destroy(): void {
    this.nameText.destroy();
    this.hpBarBg.destroy();
    this.hpBarFill.destroy();
    for (const b of this.bullets) b.destroy();
    this.bullets = [];
    super.destroy();
  }
}
