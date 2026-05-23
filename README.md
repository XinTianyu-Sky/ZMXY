# 造梦西游3 再续天庭

经典 Flash 游戏《造梦西游3 再续天庭》的 HTML5 重制版，基于 Phaser 3 + TypeScript + Vite。

## 快速开始

```bash
npm install
npm run dev      # 开发模式 → http://localhost:3000
npm run build    # 生产构建 → dist/
npm run preview  # 预览生产构建
```

## 操作

| 按键 | 功能 |
|------|------|
| J | 攻击 |
| K | 跳跃 |
| A/D | 左右移动 |
| Y/L/U/I/O | 技能 1-5 |
| 空格 | 法宝 |
| H | 武器技能 |

## 技术栈

- **引擎**: Phaser 3.90
- **语言**: TypeScript 5.x
- **构建**: Vite 5.x
- **架构**: 自定义 AABB 碰撞 + 状态机驱动

## 目录结构

```
src/
├── core/           # 核心系统
│   ├── BootScene.ts     # 资源加载
│   ├── GameScene.ts     # 主游戏场景（关卡、波次、战斗）
│   ├── GameConfig.ts    # 全局常量、键位映射
│   ├── InputManager.ts  # 键盘输入 + 双击奔跑
│   └── SoundManager.ts  # BGM/SFX 管理
├── entity/         # 游戏实体
│   ├── BaseEntity.ts    # 实体基类（物理、碰撞、状态）
│   ├── Hero.ts          # 悟空（连击、技能、升级）
│   ├── Monster.ts       # 怪物（AI 巡逻、索敌、攻击）
│   └── Bullet.ts        # 子弹/弹道
├── ui/             # UI
│   ├── MenuScene.ts     # 主菜单
│   └── HUDScene.ts      # HP/MP/等级显示
├── config/         # JSON 配置数据
│   ├── skills.json      # 技能属性
│   ├── monsters.json    # 怪物数值
│   ├── levels.json      # 关卡/波次
│   └── equipment.json   # 装备数据
└── main.ts         # 入口
```

## 状态

早期原型阶段。已实现：
- 悟空角色（精灵动画、基础连击 hit1-5、9 个技能、受击/死亡）
- 5 种怪物（精灵动画、AI 巡逻/索敌/攻击）
- 关卡波次系统（停止点推进、动态生成）
- 完整的伤害公式（物攻/魔攻、暴击、闪避、无敌帧）
- BGM/SFX 音效
- HP/MP/经验 HUD

## License

MIT
