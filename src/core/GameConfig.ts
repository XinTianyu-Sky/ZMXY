export const GameConfig = {
  WIDTH: 940,
  HEIGHT: 560,

  FRAME_CLIPS: 24,

  GRAVITY: 1.5,
  HORIZEN_SPEED: 5,
  HORIZEN_RUN_SPEED: 10,
  JUMP_POWER: -30,

  MAX_MONSTER_PER_SCREEN: 6,
  FPS: 24,

  HERO_ATTACK_RANGE: 80,
  DASH_SPEED: 12,

  DAMAGE_MIN: 1,

  SCREEN_LEFT_BOUND: 20,
  SCREEN_RIGHT_BOUND: 920,

  KEY_MAPPINGS: {
    PLAYER1: {
      LEFT: ['A', 'LEFT'],
      RIGHT: ['D', 'RIGHT'],
      JUMP: ['K'],
      ATTACK: ['J'],
      SKILL1: ['Y'],
      SKILL2: ['L'],
      SKILL3: ['U'],
      SKILL4: ['I'],
      SKILL5: ['O'],
      MAGIC: ['SPACE'],
      WEAPON_SKILL: ['H'],
      BACKPACK: ['C'],
      SKILL_PANEL: ['V'],
      EQUIP_PANEL: ['B'],
    },
  },

  ROLE_SPRITES: [
    { id: 1, key: 'wukong', frameWidth: 128, frameHeight: 128 },
    { id: 2, key: 'bajie', frameWidth: 128, frameHeight: 128 },
    { id: 3, key: 'tangseng', frameWidth: 128, frameHeight: 128 },
    { id: 4, key: 'shaseng', frameWidth: 128, frameHeight: 128 },
  ],

  SKILL_NAMES: ['Y', 'L', 'U', 'I', 'O'],

  PET_TYPES: ['monkey', 'horse', 'turtle', 'tiger', 'phoenix', 'dragon'] as const,

  MAGIC_WEAPON_TYPES: ['bottle', 'leaf', 'ring', 'sword', 'umbrella'] as const,

  ENEMY_MOVE_SPEED: 2,

  ENEMY_ATTACK_RANGE: 60,

  PET_ATTACK_RANGE: 150,
  PET_SEARCH_RANGE: 400,
  PET_FOLLOW_RANGE: 200,
} as const;
