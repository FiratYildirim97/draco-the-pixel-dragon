
import { Item, DragonStage, GameState, Screen } from './types';

// Artık harici URL kullanmıyoruz, type ID'leri kullanıyoruz.
export const IMAGES = {
  TITLE_BG: 'BG', // Kod içinde halledilecek
  EGG: 'EGG',
};

// Market ve envanterde kullanılacak item listesi
export const ITEMS: Item[] = [
  // YİYECEKLER
  {
    id: 'apple',
    name: 'Kırmızı Elma',
    price: 5,
    image: 'APPLE',
    effect: { hunger: 20, happiness: 2 },
    type: 'FOOD',
  },
  {
    id: 'fish',
    name: 'Izgara Balık',
    price: 10,
    image: 'FISH',
    effect: { hunger: 30, happiness: 3 },
    type: 'FOOD',
  },
  {
    id: 'steak',
    name: 'Sulu Biftek',
    price: 15,
    image: 'STEAK',
    effect: { hunger: 40, happiness: 4, health: 5 },
    type: 'FOOD',
  },
  {
    id: 'salad',
    name: 'Vitamin Salata',
    price: 8,
    image: 'SALAD',
    effect: { hunger: 15, happiness: 5, health: 3 },
    type: 'FOOD',
  },
  // OYUNCAKLAR
  {
    id: 'ball',
    name: 'Kırmızı Top',
    price: 25,
    image: 'BALL',
    effect: { happiness: 15, energy: -5 },
    type: 'TOY',
  },
  {
    id: 'plush',
    name: 'Ayıcık',
    price: 40,
    image: 'PLUSH',
    effect: { happiness: 25 },
    type: 'TOY',
  },
  // AKSESUARLAR
  {
    id: 'hat',
    name: 'Büyücü Şapkası',
    price: 100,
    image: 'HAT',
    effect: { happiness: 50 },
    type: 'ACCESSORY',
  },
  {
    id: 'glasses',
    name: 'Havalı Gözlük',
    price: 75,
    image: 'GLASSES',
    effect: { happiness: 30 },
    type: 'ACCESSORY',
  },
  // İKSİRLER (YENİ)
  {
    id: 'potion_rainbow',
    name: 'Gökkuşağı İksiri',
    price: 150,
    image: 'POTION',
    effect: { hunger: 100, energy: 100, happiness: 100 },
    type: 'FOOD', // Food kategorisinde görünsün ki yenilebilsin
  }
];

// Oyunun başlangıç durumu
export const INITIAL_GAME_STATE: GameState = {
  screen: Screen.START,
  dragon: {
    name: '',
    stage: DragonStage.EGG,
    hunger: 60,
    happiness: 50,
    hygiene: 50,
    energy: 50,
    health: 100,
    xp: 0,
    maxXp: 100,
    stats: {
      str: 5,
      vit: 5,
      int: 5,
      agi: 5,
    },
    evolutionStage: 1,
    age: 0,
    isSleeping: false,
    poops: 0,
    equippedAccessory: null,
  },
  currency: 150, // Başlangıç parası
  inventory: {
    apple: 2,
    fish: 1,
    ball: 1, 
  },
  lastSaveTime: Date.now(),
  weather: 'SUNNY',
};
