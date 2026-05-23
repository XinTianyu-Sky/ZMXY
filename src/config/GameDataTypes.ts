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
  color?: string;
}

export interface MonsterSpawnWave {
  enemyType: number;
  delay: number;
  interval: number;
  totalNum: number;
  stopPointIdx: number;
  isRandom: boolean;
}

export interface StopPoint {
  idx: number;
  isBoss: boolean;
  betweenRandL: number;
}

export interface LevelConfig {
  stage: number;
  level: number;
  worldWidth: number;
  stopPoints: StopPoint[];
  waves: MonsterSpawnWave[];
}

export interface SkillConfig {
  id: string;
  name: string;
  mpCost: number[];
  damageMultiplier: number;
  cooldown: number;
  description: string;
}

export interface HeroConfig {
  id: number;
  name: string;
  baseHp: number;
  baseMp: number;
  baseAttack: number;
  baseDefense: number;
  baseMagicDef: number;
  baseCrit: number;
  skills: SkillConfig[];
  hpPerLevel: number;
  mpPerLevel: number;
  attackPerLevel: number;
  defensePerLevel: number;
}

export interface EquipmentConfig {
  id: number;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'magicWeapon';
  quality: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  attack?: number;
  defense?: number;
  hp?: number;
  mp?: number;
  crit?: number;
  magicDef?: number;
  description: string;
}

export interface PetConfig {
  id: number;
  name: string;
  type: string;
  forms: {
    level: number;
    name: string;
    hp: number;
    attack: number;
    defense: number;
    skills: string[];
  }[];
}

export interface SkillLevelData {
  level: number;
  requiredExp: number;
  hpBonus: number;
  mpBonus: number;
  attackBonus: number;
  defenseBonus: number;
}
