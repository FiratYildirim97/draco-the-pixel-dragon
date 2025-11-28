// src/constants.ts

import {
  DragonStage,
  GameState,
  Item,
  Screen,
  WeatherType,
} from './types';

export const ITEMS: Item[] = [
  // --- YEMEKLER (FOOD) ---
  {
    id: 'apple',
    name: 'Kırmızı Elma',
    type: 'FOOD',
    price: 10,
    image: 'APPLE',
    effect: { hunger: 20, happiness: 5 },
  },
  {
    id: 'steak',
    name: 'Sulu Biftek',
    type: 'FOOD',
    price: 30,
    image: 'STEAK',
    effect: { hunger: 40, happiness: 10, health: 5 },
  },
  {
    id: 'salad',
    name: 'Yeşil Salata',
    type: 'FOOD',
    price: 18,
    image: 'SALAD',
    effect: { hunger: 15, health: 10 },
  },
  {
    id: 'fish',
    name: 'Mavi Balık',
    type: 'FOOD',
    price: 22,
    image: 'FISH',
    effect: { hunger: 25, happiness: 8, health: 5 },
  },
  {
    id: 'magic_potion',
    name: 'Gizemli İksir',
    type: 'FOOD',
    price: 80,
    image: 'POTION',
    effect: { hunger: 10, happiness: 25, energy: 20, health: 20 },
  },

    // --- OYUNCAKLAR (TOY) ---
  {
    id: 'ball',
    name: 'Kırmızı Top',
    type: 'TOY',
    price: 25,
    image: 'BALL',
    effect: { happiness: 15, energy: -5 },
  },
  {
    id: 'plush_dragon',
    name: 'Peluş Draco',
    type: 'TOY',
    price: 40,
    image: 'PLUSH',
    effect: { happiness: 20, energy: -3 },
  },
  {
    id: 'flame_show',
    name: "Draco's Flame Show",
    type: 'TOY',
    price: 55,
    image: 'CIRCUS_RING',   // Bunu birazdan PIXEL_ART'a ekliyoruz
    effect: { happiness: 25, energy: -5 },
  },
  // --- AKSESUARLAR (ACCESSORY) ---
  {
    id: 'hat',
    name: 'Sihirli Şapka',
    type: 'ACCESSORY',
    price: 60,
    image: 'HAT',
    effect: {},
  },
  {
    id: 'glasses',
    name: 'Akıllı Gözlük',
    type: 'ACCESSORY',
    price: 70,
    image: 'GLASSES',
    effect: {},
  },
  {
    id: 'star_charm',
    name: 'Yıldız Tılsımı',
    type: 'ACCESSORY',
    price: 100,
    image: 'STAR',
    effect: { happiness: 5 },
  },
];

const DEFAULT_WEATHER: WeatherType = 'SUNNY';

export const INITIAL_GAME_STATE: GameState = {
  screen: Screen.START,
  weather: DEFAULT_WEATHER,
  currency: 100,

  dragon: {
    name: 'DRACO',
    stage: DragonStage.EGG,
    evolutionStage: 1,
    age: 0,

    hunger: 70,
    happiness: 70,
    hygiene: 80,
    energy: 80,
    health: 100,

    xp: 0,
    maxXp: 100,

    isSleeping: false,
    poops: 0,

    equippedAccessory: null,
    stats: {
      str: 5,
      vit: 5,
      int: 5,
      agi: 5,
    },
  },

  inventory: {
    apple: 2,
    steak: 1,
    ball: 1,
  },

  buffs: {
    happinessDecayMultiplier: 1,
    hygieneDecayMultiplier: 1,
    miniGameGoldMultiplier: 1,
  },

  dailyQuests: [],
  lastQuestDate: null,
  dailyStreak: 0,
};
