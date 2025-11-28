// src/constants.ts
import { GameState, Screen, DragonStage, Item, WeatherType } from './types';

// --- Mağazadaki tüm eşyalar ---
// Item tipi şu alanları kullanıyor:
// id: string
// name: string
// type: 'FOOD' | 'TOY' | 'ACCESSORY'
// price: number
// effect: { hunger?: number; happiness?: number; energy?: number; health?: number }
// image: string  -> PIXEL_ART içindeki anahtarlarla eşleşiyor (APP.tsx’te tanımlı)

export const ITEMS: Item[] = [
  // --- YİYECEKLER (FOOD) ---
  {
    id: 'apple_snack',
    name: 'Elma Atıştırmalığı',
    type: 'FOOD',
    price: 10,
    image: 'APPLE',
    effect: {
      hunger: 15,
      happiness: 5,
      health: 0,
      energy: 0,
    },
  },
  {
    id: 'fish_snack',
    name: 'Balık Şöleni',
    type: 'FOOD',
    price: 18,
    image: 'FISH',
    effect: {
      hunger: 20,
      happiness: 6,
      health: 2,
      energy: 3,
    },
  },
  {
    id: 'steak_feast',
    name: 'Biftek Ziyafeti',
    type: 'FOOD',
    price: 28,
    image: 'STEAK',
    effect: {
      hunger: 30,
      happiness: 8,
      health: 5,
      energy: 5,
    },
  },
  {
    id: 'veggie_salad',
    name: 'Sebze Salatası',
    type: 'FOOD',
    price: 16,
    image: 'SALAD',
    effect: {
      hunger: 18,
      happiness: 4,
      health: 8,
      energy: 2,
    },
  },

  // Potions – kodda item.id.includes('potion') kontrolü var:
  {
    id: 'small_potion',
    name: 'Küçük İksir',
    type: 'FOOD',
    price: 35,
    image: 'POTION',
    effect: {
      hunger: 10,
      happiness: 15,
      health: 20,
      energy: 10,
    },
  },
  {
    id: 'rainbow_potion',
    name: 'Gökkuşağı İksiri',
    type: 'FOOD',
    price: 60,
    image: 'POTION',
    effect: {
      hunger: 15,
      happiness: 30,
      health: 30,
      energy: 20,
    },
  },

  // --- OYUNCAKLAR (TOY) ---
  {
    id: 'ball',
    name: 'Kırmızı Top',
    type: 'TOY',
    price: 22,
    image: 'BALL',
    effect: {
      happiness: 15,
      hunger: 0,
      energy: 0, // gerçek enerji düşüşü App içinde PLAY/FETCH’te ayarlanıyor
      health: 0,
    },
  },
  {
    id: 'plushie',
    name: 'Ejderha Peluş',
    type: 'TOY',
    price: 26,
    image: 'PLUSH',
    effect: {
      happiness: 20,
      hunger: 0,
      energy: -2,
      health: 0,
    },
  },

  // --- AKSESUARLAR (ACCESSORY) ---
  // ÖNEMLİ: App.tsx içinde bazı aksesuar id’leri özel olarak kontrol ediliyor:
  // - 'hat'  -> pasif XP bonusu
  // - 'glasses' -> mutluluk decay yavaşlatma
  // Ayrıca drawAccessory içinde 'hat', 'glasses', 'crown', 'scarf' destekleniyor.
  {
    id: 'hat',
    name: 'Büyücü Şapkası',
    type: 'ACCESSORY',
    price: 40,
    image: 'HAT',
    effect: {
      happiness: 5,
      hunger: 0,
      energy: 0,
      health: 0,
    },
  },
  {
    id: 'glasses',
    name: 'Zeki Gözlük',
    type: 'ACCESSORY',
    price: 40,
    image: 'GLASSES',
    effect: {
      happiness: 4,
      hunger: 0,
      energy: 0,
      health: 0,
    },
  },
  {
    id: 'crown',
    name: 'Kraliyet Tacı',
    type: 'ACCESSORY',
    price: 70,
    image: 'STAR', // Taç için yıldız sprite’ını kullanıyoruz
    effect: {
      happiness: 10,
      hunger: 0,
      energy: 0,
      health: 5,
    },
  },
  {
    id: 'scarf',
    name: 'Kırmızı Atkı',
    type: 'ACCESSORY',
    price: 32,
    image: 'PLUSH',
    effect: {
      happiness: 6,
      hunger: 0,
      energy: 0,
      health: 3,
    },
  },
];

// --- BAŞLANGIÇ OYUN DURUMU ---

export const INITIAL_GAME_STATE: GameState = {
  screen: Screen.START,
  weather: 'SUNNY' as WeatherType,
  currency: 50,

  // Çanta: başlangıçta birkaç yiyecek ve bir top
  inventory: {
    apple_snack: 2,
    steak_feast: 1,
    ball: 1,
  },

  dragon: {
    // App.tsx başlangıçta ismi DRACO’ya override ediyor
    name: 'YUMURTA',

    // Temel ihtiyaç barları
    hunger: 80,
    happiness: 70,
    hygiene: 90,
    energy: 80,
    health: 100,

    // Level / evrim sistemi
    xp: 0,
    maxXp: 50,
    evolutionStage: 1,
    stage: DragonStage.EGG, // Yumurtadan başlıyoruz

    // Diğer durumlar
    age: 0,
    poops: 0,
    isSleeping: false,
    equippedAccessory: null,

    // Statlar (Stats ekranında gösteriliyor)
    stats: {
      str: 5,
      vit: 5,
      int: 5,
      agi: 5,
    },
  },
};
