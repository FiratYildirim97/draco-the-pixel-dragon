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

  // Mevcut aksesuar alanı (dokunmuyoruz)
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

  // Yeni ama opsiyonel: görev tipi + skin parçası ödülü
  type?: DailyQuestType;
  rewardSkinShards?: number;
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

  // --- Yeni özellikler (tamamı mevcut kaydı BOZMAMAK için ek alanlar) ---

  // Mini oyun durumu
  activeMiniGame?: MiniGameType | null;
  miniGameStreak?: number;

  // Skin sistemi
  activeSkinId?: string;      // aktif skin ID (örn. 'RED_DEFAULT', 'ICE_DRAGON')
  unlockedSkins?: string[];   // açılmış skin ID listesi
  skinShards?: number;        // biriken skin parçası sayısı

  // Ev geliştirmeleri
  ownedUpgrades?: string[];   // sahip olunan upgrade ID'leri

  // NPC sistemi
  activeNpc?: NpcState;       // ekranda görünen NPC varsa

  // Görsel efektler (ışık, parıltı, tap sevinç vb.)
  visualEffects?: VisualEffect[];
}

/* ──────────────────────────────────────────────
   YENİ TİPLER – Mini oyunlar, skinler, ev, NPC
   (Önceki planın tamamı buraya eklendi)
────────────────────────────────────────────── */

// Mini oyun tipleri
export type MiniGameType =
  | 'CATCH_FALLING'
  | 'TAP_FAST'
  | 'TARGET_SHOOT'    // 🎯 Hedefe Ateş
  | 'MEMORY_CARDS';   // 🧩 Hafıza Kartları

// Aksesuar tanımı (market + inventory için)
export interface Accessory {
  id: string; // 'CROWN_KING', 'HORN_SPEAR', 'SCARF_WINTER', 'HEADPHONES_NEON'
  name: string;
  description: string;
  bonusType: 'HAPPINESS' | 'HYGIENE' | 'MINIGAME_GOLD' | 'ATTACK_MODE';
  bonusValue: number;
  color?: string; // örn: parlak sarı, kırmızı-beyaz, neon
}

// Skin sistemi
export interface DragonSkin {
  id: string; // 'RED_DEFAULT', 'ICE_DRAGON', 'ELECTRIC_DRAGON'
  name: string;
  unlockLevel: number;
  passive: {
    // Temizlik daha yavaş azalır, mini oyun hız bonusu vs.
    type: 'CLEAN_DECAY' | 'MINIGAME_SPEED' | 'NONE';
    value: number;
  };
  palette: {
    base: string;   // gövde rengi
    accent: string; // detay rengi (kanat, boynuz vb.)
  };
}

// Ev geliştirmeleri
export interface HomeUpgrade {
  id: string; // 'MINI_FOREST', 'CLEANING_SET', 'WEATHER_STATION'
  name: string;
  bonusType: 'HAPPINESS_RATE' | 'HYGIENE_RATE' | 'WEATHER_BONUS';
  bonusValue: number;
}

// NPC sistemi
export interface NpcState {
  id: 'MOUSE_FRIEND' | 'OWL_WEATHER' | 'JOKER_DRAGON';
  message: string;
  rewardType: 'MINIGAME_INVITE' | 'WEATHER_INFO' | 'RANDOM_BUFF';
}

// Günlük görev tipleri
export type DailyQuestType =
  | 'FEED_ONCE'
  | 'WASH_DRAGON_ONCE'
  | 'WIN_MINIGAME_ONCE'
  | 'REACH_HAPPINESS_80';

// Görsel efektler (parıltı, level up, temizleme efekti, tap sevinç)
export interface VisualEffect {
  id: number;
  type: 'SPARKLE' | 'LEVEL_UP' | 'CLEAN_SPARKLE' | 'TAP_HAPPY';
  x: number;
  y: number;
  lifetime: number;
}
