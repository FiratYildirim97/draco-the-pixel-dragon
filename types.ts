// src/types.ts

export enum Screen {
  START = 'START',
  HATCH = 'HATCH',
  MAIN = 'MAIN',
  MARKET = 'MARKET',
  STATS = 'STATS',
}

export enum DragonStage {
  EGG = 'EGG',
  BABY = 'BABY',
  TEEN = 'TEEN',
  ADULT = 'ADULT',
  ELDER = 'ELDER',
}

export type WeatherType = 'SUNNY' | 'RAIN';

export type ItemType = 'FOOD' | 'TOY' | 'ACCESSORY';

export interface ItemEffect {
  hunger?: number;
  happiness?: number;
  energy?: number;
  health?: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  image: string; // PIXEL_ART key: APPLE, FISH, STEAK, etc.
  effect: ItemEffect;
}

export interface Stats {
  str: number;
  vit: number;
  int: number;
  agi: number;
}

export interface Dragon {
  name: string;
  stage: DragonStage;
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

  equippedAccessory: string | null; // 'hat', 'glasses', vb.
  stats: Stats;
}

export interface PermanentBuffs {
  happinessDecayMultiplier: number; // <1 ise daha yavaş azalır
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
}

export interface GameState {
  screen: Screen;
  dragon: Dragon;
  inventory: Record<string, number>;
  currency: number;
  weather: WeatherType;

  // Uzun vadeli progression
  buffs: PermanentBuffs;

  // Günlük görevler
  dailyQuests: DailyQuest[];
  lastQuestDate: string | null;
  dailyStreak: number;
}
