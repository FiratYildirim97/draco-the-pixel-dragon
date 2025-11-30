// src/constants.ts

import {
  DragonStage,
  GameState,
  Item,
  Screen,
  WeatherType,
  Accessory,
  DailyQuest,
} from './types';

export const ITEMS: Item[] = [
  // --- YEMEKLER (FOOD) ---
  {
    id: 'apple',
    name: 'Kırmızı Elma',
    type: 'FOOD',
    price: 10,
    image: 'APPLE',
    effect: { hunger: 20, happiness: 5, stats: { vit: 1 } },
  },
  {
    id: 'steak',
    name: 'Sulu Biftek',
    type: 'FOOD',
    price: 30,
    image: 'STEAK',
    effect: { hunger: 40, happiness: 10, health: 5, stats: { str: 2 } },
  },
  {
    id: 'salad',
    name: 'Yeşil Salata',
    type: 'FOOD',
    price: 18,
    image: 'SALAD',
    effect: { hunger: 15, health: 10, stats: { int: 1 } },
  },
  {
    id: 'fish',
    name: 'Mavi Balık',
    type: 'FOOD',
    price: 22,
    image: 'FISH',
    effect: { hunger: 25, happiness: 8, health: 5, stats: { int: 2 } },
  },
  {
    id: 'magic_potion',
    name: 'Gizemli İksir',
    type: 'FOOD',
    price: 80,
    image: 'POTION',
    effect: { hunger: 10, happiness: 25, energy: 20, health: 20 },
  },

  // --- TOHUMLAR (SEED) ---
  {
    id: 'seed_apple',
    name: 'Elma Tohumu',
    type: 'SEED',
    price: 5,
    image: 'SEED_APPLE',
    effect: {},
  },
  {
    id: 'seed_salad',
    name: 'Marul Tohumu',
    type: 'SEED',
    price: 8,
    image: 'SEED_SALAD',
    effect: {},
  },

  // --- OYUNCAKLAR (TOY) ---
  {
    id: 'ball',
    name: 'Kırmızı Top',
    type: 'TOY',
    price: 25,
    image: 'BALL',
    effect: { happiness: 15, energy: -5, stats: { agi: 1 } },
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
    image: 'CIRCUS_RING',
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
    type: 'NORMAL',
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
    seed_apple: 1,
  },

  garden: [
    { id: 0, isUnlocked: true, seedId: null, stage: 0, progress: 0, lastWatered: 0 },
    { id: 1, isUnlocked: true, seedId: null, stage: 0, progress: 0, lastWatered: 0 },
    { id: 2, isUnlocked: false, seedId: null, stage: 0, progress: 0, lastWatered: 0 },
    { id: 3, isUnlocked: false, seedId: null, stage: 0, progress: 0, lastWatered: 0 },
  ],

  buffs: {
    happinessDecayMultiplier: 1,
    hygieneDecayMultiplier: 1,
    miniGameGoldMultiplier: 1,
  },

  dailyQuests: [], // Will be populated by App
  lastQuestDate: null,
  dailyStreak: 0,

  activeMiniGame: null,
  miniGameStreak: 0,

  activeSkinId: 'RED_DEFAULT',
  unlockedSkins: ['RED_DEFAULT'],
  skinShards: 0,

  ownedUpgrades: [],

  activeNpc: undefined,

  visualEffects: [],
  
  settings: {
    muted: false
  }
};

export const ACCESSORIES: Accessory[] = [
  {
    id: 'hat',
    name: 'Sihirli Şapka',
    description: 'Draco’ya karizma katar.',
    bonusType: 'HAPPINESS',
    bonusValue: 3,
    color: '#FFFFFF',
  },
  {
    id: 'glasses',
    name: 'Akıllı Gözlük',
    description: 'Zekasını artırıyor gibi hissediyor.',
    bonusType: 'HAPPINESS',
    bonusValue: 2,
    color: '#ADD8E6',
  },
  {
    id: 'star_charm',
    name: 'Yıldız Tılsımı',
    description: 'Minicik de olsa mutluluk artışı sağlar.',
    bonusType: 'HAPPINESS',
    bonusValue: 5,
    color: '#FFD700',
  },
  {
    id: 'CROWN_KING',
    name: 'Kral Tacı',
    description: 'Mutluluğu artırır.',
    bonusType: 'HAPPINESS',
    bonusValue: 10,
    color: '#FFD700',
  },
  {
    id: 'HORN_SPEAR',
    name: 'Kargı Boynuz',
    description: 'Saldırı pozuna özel animasyon.',
    bonusType: 'ATTACK_MODE',
    bonusValue: 5,
    color: '#8B0000',
  },
  {
    id: 'SCARF_WINTER',
    name: 'Kış Atkısı',
    description: 'Uyku + temizlik bonusu hissi.',
    bonusType: 'HYGIENE',
    bonusValue: 8,
    color: '#FF4C4C',
  },
  {
    id: 'HEADPHONES_NEON',
    name: 'Neon Kulaklık',
    description: 'Mini oyunlarda ekstra altın.',
    bonusType: 'MINIGAME_GOLD',
    bonusValue: 15,
    color: '#39FF14',
  },
];

// Expanded Quest Pool
export const QUEST_DEFINITIONS = [
  { targetType: 'WASH', targetCount: 1, text: 'Draco\'yu 1 kez yıka', rewardGold: 20 },
  { targetType: 'FEED', targetCount: 2, text: 'Draco\'yu 2 kez besle', rewardGold: 30 },
  { targetType: 'WIN_MINIGAME', targetCount: 1, text: '1 mini oyun kazan', rewardGold: 50 },
  { targetType: 'HAPPY_80', targetCount: 1, text: 'Mutluluğu 80+ yap', rewardGold: 40 },
  { targetType: 'SLEEP', targetCount: 1, text: 'Draco\'yu uyut', rewardGold: 15 },
  { targetType: 'GARDEN_WATER', targetCount: 1, text: 'Bahçeyi sula', rewardGold: 25 },
  { targetType: 'BATTLE_PLAY', targetCount: 1, text: 'Arenada savaş', rewardGold: 40 },
  { targetType: 'PET', targetCount: 5, text: 'Draco\'yu 5 kez sev', rewardGold: 10 },
];