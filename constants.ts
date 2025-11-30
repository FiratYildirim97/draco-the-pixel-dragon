// src/constants.ts

import {
  DragonStage,
  GameState,
  Item,
  Screen,
  WeatherType,
  Accessory,
  DragonSkin,
  HomeUpgrade,
  MiniGameType,
  DailyQuestType,
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
    seed_apple: 1, // Başlangıç hediyesi
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

  dailyQuests: [],
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

export const DAILY_QUEST_POOL = [
  {
    id: 'FEED_ONCE',
    type: 'FEED_ONCE',
    description: 'Draco’yu bir kez besle.',
    target: 1,
    rewardGold: 10,
    rewardXp: 20,
  },
  {
    id: 'WASH_DRAGON_ONCE',
    type: 'WASH_DRAGON_ONCE',
    description: 'Draco’yu 1 defa yıka.',
    target: 1,
    rewardGold: 15,
    rewardXp: 25,
    rewardSkinShards: 1,
  },
  {
    id: 'WIN_MINIGAME_ONCE',
    type: 'WIN_MINIGAME_ONCE',
    description: '1 mini oyun kazan.',
    target: 1,
    rewardGold: 20,
    rewardXp: 30,
    rewardSkinShards: 2,
  },
  {
    id: 'REACH_HAPPINESS_80',
    type: 'REACH_HAPPINESS_80',
    description: 'Mutluluğu 80 üzerine çıkar.',
    target: 1,
    rewardGold: 15,
    rewardXp: 25,
    rewardSkinShards: 1,
  },
];