
export enum Screen {
  START = 'START',
  HATCH = 'HATCH',
  MAIN = 'MAIN',
  STATS = 'STATS',
  MARKET = 'MARKET'
}

export enum DragonStage {
  EGG = 'EGG',
  BABY = 'BABY',
  TEEN = 'TEEN',
  ADULT = 'ADULT',
  ELDER = 'ELDER'
}

export type WeatherType = 'SUNNY' | 'RAIN';

export interface Stats {
  str: number;
  vit: number;
  int: number;
  agi: number;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  image: string;
  effect: {
    hunger?: number;
    happiness?: number;
    xp?: number;
    health?: number;
    energy?: number;
  };
  type: 'FOOD' | 'TOY' | 'ACCESSORY' | 'POTION';
}

export interface DragonState {
  name: string;
  stage: DragonStage;
  hunger: number; // 0-100 (100 is full)
  happiness: number; // 0-100
  hygiene: number; // 0-100
  energy: number; // 0-100
  health: number; // 0-100
  xp: number;
  maxXp: number;
  stats: Stats;
  evolutionStage: number; // 1-5
  age: number; // in days/ticks
  isSleeping: boolean;
  poops: number; // number of poops on screen
  equippedAccessory?: string | null; // ID of the equipped item
}

export interface GameState {
  screen: Screen;
  dragon: DragonState;
  currency: number;
  inventory: Record<string, number>; // Item ID -> Count
  lastSaveTime: number;
  weather: WeatherType;
}
