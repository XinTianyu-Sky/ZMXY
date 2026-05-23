import Phaser from 'phaser';
import { GameConfig } from './GameConfig';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpJustDown: boolean;
  attack: boolean;
  attackJustDown: boolean;
  skill1: boolean;
  skill2: boolean;
  skill3: boolean;
  skill4: boolean;
  skill5: boolean;
  magic: boolean;
  weaponSkill: boolean;
  backpack: boolean;
  skillPanel: boolean;
  equipPanel: boolean;
}

export class InputManager {
  private scene: Phaser.Scene;
  private keys: Map<string, Phaser.Input.Keyboard.Key> = new Map();
  public state: InputState;

  private leftPressed = false;
  private rightPressed = false;
  private lastLeftTime = 0;
  private lastRightTime = 0;
  private doubleTapWindow = 500;
  public isRunning = false;

  private prevJump = false;
  private prevAttack = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.state = this.createEmptyState();

    if (scene.input.keyboard) {
      const mappings = GameConfig.KEY_MAPPINGS.PLAYER1;
      for (const [action, keyNames] of Object.entries(mappings)) {
        for (const keyName of keyNames) {
          const key = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes[keyName as keyof typeof Phaser.Input.Keyboard.KeyCodes]
          );
          this.keys.set(`${action}_${keyName}`, key);
        }
      }
    }
  }

  private createEmptyState(): InputState {
    return {
      left: false, right: false, up: false, down: false,
      jump: false, jumpJustDown: false,
      attack: false, attackJustDown: false,
      skill1: false, skill2: false, skill3: false, skill4: false, skill5: false,
      magic: false, weaponSkill: false,
      backpack: false, skillPanel: false, equipPanel: false,
    };
  }

  update(time: number): void {
    this.state.left = this.isKeyDown('LEFT');
    this.state.right = this.isKeyDown('RIGHT');
    this.state.up = this.isKeyDown('UP');
    this.state.down = this.isKeyDown('DOWN');

    const jumpDown = this.isKeyDown('JUMP');
    this.state.jumpJustDown = jumpDown && !this.prevJump;
    this.state.jump = jumpDown;
    this.prevJump = jumpDown;

    const attackDown = this.isKeyDown('ATTACK');
    this.state.attackJustDown = attackDown && !this.prevAttack;
    this.state.attack = attackDown;
    this.prevAttack = attackDown;

    this.state.skill1 = Phaser.Input.Keyboard.JustDown(this.getKey('SKILL1', 'Y'));
    this.state.skill2 = Phaser.Input.Keyboard.JustDown(this.getKey('SKILL2', 'L'));
    this.state.skill3 = Phaser.Input.Keyboard.JustDown(this.getKey('SKILL3', 'U'));
    this.state.skill4 = Phaser.Input.Keyboard.JustDown(this.getKey('SKILL4', 'I'));
    this.state.skill5 = Phaser.Input.Keyboard.JustDown(this.getKey('SKILL5', 'O'));
    this.state.magic = Phaser.Input.Keyboard.JustDown(this.getKey('MAGIC', 'SPACE'));
    this.state.weaponSkill = Phaser.Input.Keyboard.JustDown(this.getKey('WEAPON_SKILL', 'H'));

    this.state.backpack = Phaser.Input.Keyboard.JustDown(this.getKey('BACKPACK', 'C'));
    this.state.skillPanel = Phaser.Input.Keyboard.JustDown(this.getKey('SKILL_PANEL', 'V'));
    this.state.equipPanel = Phaser.Input.Keyboard.JustDown(this.getKey('EQUIP_PANEL', 'B'));

    this.isRunning = this.checkDoubleTap(time);
  }

  private checkDoubleTap(time: number): boolean {
    const nowLeft = this.state.left;
    const nowRight = this.state.right;

    let result = false;

    if (nowLeft && !this.leftPressed) {
      if (time - this.lastLeftTime < this.doubleTapWindow) {
        result = true;
      }
      this.lastLeftTime = time;
    }
    this.leftPressed = nowLeft;

    if (nowRight && !this.rightPressed) {
      if (time - this.lastRightTime < this.doubleTapWindow) {
        result = true;
      }
      this.lastRightTime = time;
    }
    this.rightPressed = nowRight;

    if (!nowLeft && !nowRight) {
      result = false;
    }

    return result;
  }

  private isKeyDown(action: string): boolean {
    const mappings = GameConfig.KEY_MAPPINGS.PLAYER1;
    const keyNames = mappings[action as keyof typeof mappings] as readonly string[];
    if (!keyNames) return false;

    for (const keyName of keyNames) {
      const compositeKey = `${action}_${keyName}`;
      const key = this.keys.get(compositeKey);
      if (key && key.isDown) return true;
    }
    return false;
  }

  private getKey(action: string, defaultKey: string): Phaser.Input.Keyboard.Key {
    const compositeKey = `${action}_${defaultKey}`;
    return this.keys.get(compositeKey)!;
  }

  destroy(): void {
    this.keys.clear();
  }
}
