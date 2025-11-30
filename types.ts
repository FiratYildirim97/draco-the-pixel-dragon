// src/types.ts

export enum Screen {
  START = 'START',
  HATCH = 'HATCH',
  MAIN = 'MAIN',
  MARKET = 'MARKET',
  STATS = 'STATS',
  GARDEN = 'GARDEN', // Yeni
  ARENA = 'ARENA',   // Yeni
}

export enum DragonStage {
  EGG = 'EGG',
  BABY = 'BABY',
  TEEN = 'TEEN',
  ADULT = 'ADULT',
  ELDER = 'ELDER',
}

// Yeni: Ejderha element türleri
export type DragonType = 'NORMAL' | 'FIRE' | 'ICE' | 'NATURE';

export type WeatherType = 'SUNNY' | 'RAIN';

export type ItemType = 'FOOD' | 'TOY' | 'ACCESSORY' | 'SEED'; // Seed eklendi

export interface ItemEffect {
  hunger?: number;
  happiness?: number;
  energy?: number;
  health?: number;
  stats?: Partial<Stats>; // Kalıcı stat bonusları
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  image: string; // PIXEL_ART key
  effect: ItemEffect;
}

export interface Stats {
  str: number; // Güç
  vit: number; // Can
  int: number; // Zeka
  agi: number; // Hız
}

export interface Dragon {
  name: string;
  stage: DragonStage;
  type: DragonType; // Yeni
  evolutionStage: number;
  age: number;

  hunger: number;
  happiness: number;
  hygiene: number;
  energy: number;
  health: number;

  xp: number;
  maxXp: number;

  isSleeping: boolean;
  poops: number;

  equippedAccessory: string | null;

  stats: Stats;
}

// Bahçe Tarlası
export interface GardenPlot {
  id: number;
  isUnlocked: boolean;
  seedId: string | null;
  stage: 0 | 1 | 2 | 3; // 0:Tohum, 1:Filiz, 2:Meyve, 3:Çürük
  progress: number;
  lastWatered: number;
}

export interface PermanentBuffs {
  happinessDecayMultiplier: number;
  hygieneDecayMultiplier: number;
  miniGameGoldMultiplier: number;
}

export interface DailyQuest {
  id: string;
  description: string;
  target: number;
  progress: number;
  rewardGold: number;
  rewardXp: number;
  completed: boolean;
  type?: DailyQuestType;
  rewardSkinShards?: number;
}

export interface GameState {
  screen: Screen;
  dragon: Dragon;
  inventory: Record<string, number>;
  currency: number;
  weather: WeatherType;
  
  garden: GardenPlot[]; // Yeni

  buffs: PermanentBuffs;

  dailyQuests: DailyQuest[];
  lastQuestDate: string | null;
  dailyStreak: number;

  activeMiniGame?: MiniGameType | null;
  miniGameStreak?: number;

  activeSkinId?: string;
  unlockedSkins?: string[];
  skinShards?: number;

  ownedUpgrades?: string[];

  activeNpc?: NpcState;

  visualEffects?: VisualEffect[];
}

// Tüm Mini Oyunlar
export type MiniGameType =
  | 'RPS'
  | 'MATH'
  | 'CATCH'
  | 'TAP'
  | 'TARGET'
  | 'MEMORY'
  | 'RUNNER' // Yeni
  | 'RHYTHM' // Yeni
  | 'FLAME_SHOW';

export interface Accessory {
  id: string;
  name: string;
  description: string;
  bonusType: 'HAPPINESS' | 'HYGIENE' | 'MINIGAME_GOLD' | 'ATTACK_MODE';
  bonusValue: number;
  color?: string;
}

export interface DragonSkin {
  id: string;
  name: string;
  unlockLevel: number;
  passive: {
    type: 'CLEAN_DECAY' | 'MINIGAME_SPEED' | 'NONE';
    value: number;
  };
  palette: {
    base: string;
    accent: string;
  };
}

export interface HomeUpgrade {
  id: string;
  name: string;
  bonusType: 'HAPPINESS_RATE' | 'HYGIENE_RATE' | 'WEATHER_BONUS';
  bonusValue: number;
}

export interface NpcState {
  type: 'MOUSE' | 'OWL' | 'JOKER';
  message: string;
  x: number;
  y: number;
  rewardType?: 'MINIGAME_INVITE' | 'WEATHER_INFO' | 'RANDOM_BUFF';
}

export type DailyQuestType =
  | 'FEED_ONCE'
  | 'WASH_DRAGON_ONCE'
  | 'WIN_MINIGAME_ONCE'
  | 'REACH_HAPPINESS_80';

export interface VisualEffect {
  id: number;
  type: 'SPARKLE' | 'LEVEL_UP' | 'CLEAN_SPARKLE' | 'TAP_HAPPY';
  x: number;
  y: number;
  lifetime: number;
}