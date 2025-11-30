// src/types.ts

export enum Screen {
  START = 'START',
  HATCH = 'HATCH',
  MAIN = 'MAIN',
  MARKET = 'MARKET',
  STATS = 'STATS',
  GARDEN = 'GARDEN',
  ARENA = 'ARENA',
}

export enum DragonStage {
  EGG = 'EGG',
  BABY = 'BABY',
  TEEN = 'TEEN',
  ADULT = 'ADULT',
  ELDER = 'ELDER',
}

export type DragonType = 'NORMAL' | 'FIRE' | 'ICE' | 'NATURE';

export type WeatherType = 'SUNNY' | 'RAIN';

export type ItemType = 'FOOD' | 'TOY' | 'ACCESSORY' | 'SEED';

export interface ItemEffect {
  hunger?: number;
  happiness?: number;
  energy?: number;
  health?: number;
  stats?: Partial<Stats>;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  image: string;
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
  type: DragonType;
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

export interface GardenPlot {
  id: number;
  isUnlocked: boolean;
  seedId: string | null;
  stage: 0 | 1 | 2 | 3;
  progress: number;
  lastWatered: number;
}

export interface PermanentBuffs {
  happinessDecayMultiplier: number;
  hygieneDecayMultiplier: number;
  miniGameGoldMultiplier: number;
}

// Updated DailyQuest logic
export interface DailyQuest {
  id: string;
  text: string;
  targetType: string; // e.g. 'WASH', 'FEED', 'WIN'
  targetCount: number;
  currentCount: number;
  completed: boolean;
  rewardClaimed: boolean;
  rewardGold: number;
}

export interface GameState {
  screen: Screen;
  dragon: Dragon;
  inventory: Record<string, number>;
  currency: number;
  weather: WeatherType;
  
  garden: GardenPlot[];

  buffs: PermanentBuffs;

  dailyQuests: DailyQuest[];
  lastQuestDate: string | null; // Used for daily reset or timer
  
  activeMiniGame?: MiniGameType | null;

  activeSkinId?: string;
  unlockedSkins?: string[];
  skinShards?: number;

  ownedUpgrades?: string[];

  activeNpc?: NpcState;

  visualEffects?: VisualEffect[];
  
  settings: {
    muted: boolean;
  };
}

export type MiniGameType =
  | 'RPS'
  | 'MATH'
  | 'CATCH'
  | 'TAP'
  | 'TARGET'
  | 'MEMORY'
  | 'RUNNER'
  | 'RHYTHM'
  | 'FLAME_SHOW'
  | 'FALLING' // Yeni
  | 'CLICKER'; // Yeni

export interface Accessory {
  id: string;
  name: string;
  description: string;
  bonusType: 'HAPPINESS' | 'HYGIENE' | 'MINIGAME_GOLD' | 'ATTACK_MODE';
  bonusValue: number;
  color?: string;
}

export interface HomeUpgrade {
  id: string;
  name: string;
  bonusType: 'HAPPINESS_RATE' | 'HYGIENE_RATE' | 'WEATHER_BONUS';
  bonusValue: number;
}

export interface NpcState {
  type: 'MOUSE' | 'OWL' | 'JOKER' | 'MERCHANT' | 'BARD'; // Yeni NPC'ler
  message: string;
  x: number;
  y: number;
}

export interface VisualEffect {
  id: number;
  type: 'SPARKLE' | 'LEVEL_UP' | 'CLEAN_SPARKLE' | 'TAP_HAPPY';
  x: number;
  y: number;
  lifetime: number;
}