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
  NpcState,
  VisualEffect,
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

  // --- Yeni alanların başlangıç değerleri ---
  activeMiniGame: null,
  miniGameStreak: 0,

  activeSkinId: 'RED_DEFAULT',
  unlockedSkins: ['RED_DEFAULT'],
  skinShards: 0,

  ownedUpgrades: [],

  activeNpc: undefined as NpcState | undefined,

  visualEffects: [] as VisualEffect[],
};

// --------------------------------------------------
// YENİ SİSTEMLER İÇİN SABİTLER
// --------------------------------------------------

// Aksesuarlar (ID'ler Item.id ile hizalı, + ekstra özel aksesuarlar)
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
  // Planladığımız yeni aksesuarlar
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

// Skinler
export const SKINS: DragonSkin[] = [
  {
    id: 'RED_DEFAULT',
    name: 'Kırmızı Draco',
    unlockLevel: 1,
    passive: {
      type: 'NONE',
      value: 0,
    },
    palette: {
      base: '#FF3B3B',
      accent: '#B22222',
    },
  },
  {
    id: 'ICE_DRAGON',
    name: 'Buz Draco',
    unlockLevel: 5,
    passive: {
      type: 'CLEAN_DECAY',
      value: 0.8, // %20 daha yavaş kirlenme
    },
    palette: {
      base: '#66D9FF',
      accent: '#0099CC',
    },
  },
  {
    id: 'ELECTRIC_DRAGON',
    name: 'Elektrik Draco',
    unlockLevel: 10,
    passive: {
      type: 'MINIGAME_SPEED',
      value: 1.2, // mini oyunlarda %20 hız/avantaj
    },
    palette: {
      base: '#FFE066',
      accent: '#FFB400',
    },
  },
];

// Ev geliştirmeleri
export const HOME_UPGRADES: HomeUpgrade[] = [
  {
    id: 'MINI_FOREST',
    name: 'Mini Orman',
    bonusType: 'HAPPINESS_RATE',
    bonusValue: 0.2,
  },
  {
    id: 'CLEANING_SET',
    name: 'Temizlik Seti',
    bonusType: 'HYGIENE_RATE',
    bonusValue: 0.3,
  },
  {
    id: 'WEATHER_STATION',
    name: 'Hava İstasyonu',
    bonusType: 'WEATHER_BONUS',
    bonusValue: 1,
  },
];

// Günlük görev havuzu
export const DAILY_QUEST_POOL: {
  id: string;
  type: DailyQuestType;
  description: string;
  target: number;
  rewardGold: number;
  rewardXp: number;
  rewardSkinShards?: number;
}[] = [
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

// Mini oyun ödülleri
export const MINIGAME_REWARDS: Record<MiniGameType, { xp: number; gold: number }> = {
  CATCH_FALLING: { xp: 10, gold: 8 },
  TAP_FAST: { xp: 12, gold: 10 },
  TARGET_SHOOT: { xp: 15, gold: 12 },
  MEMORY_CARDS: { xp: 25, gold: 5 },
};
