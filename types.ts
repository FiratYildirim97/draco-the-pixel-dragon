// src/types.ts

// -----------------------------
// Ekranlar (Screen)
// -----------------------------
export type Screen =
  | 'HOME'
  | 'STATS'
  | 'SHOP'
  | 'MINIGAMES_MENU'
  | 'MINIGAME_CATCH'
  | 'MINIGAME_TAP'
  | 'MINIGAME_TARGET'   // 🎯 Hedefe Ateş
  | 'MINIGAME_MEMORY'   // 🧩 Hafıza Kartları
  | 'SLEEP'
  | 'BATH'
  | 'EAT'
  | 'SKINS'             // Draco skin seçme ekranı
  | 'UPGRADES'          // Ev geliştirmeleri ekranı
  | 'SETTINGS';

// -----------------------------
// Hava Durumu
// -----------------------------
export type WeatherType = 'sunny' | 'rainy' | 'snowy' | 'storm';

// -----------------------------
// Ejderha Gelişim Evresi
// -----------------------------
export type DragonStage = 'baby' | 'teen' | 'adult';

// -----------------------------
// Mini Oyun Tipleri
// -----------------------------
export type MiniGameType =
  | 'catch_falling'
  | 'tap_fast'
  | 'target_shoot'      // 🎯 hedefe ateş
  | 'memory_cards';     // 🧩 hafıza kartları

// -----------------------------
// Eşya / Item Tipleri
// -----------------------------
export type ItemCategory =
  | 'food'
  | 'toy'
  | 'cleaning'
  | 'potion'
  | 'ticket'
  | 'accessory';

// Item’ın Draco’ya etkisi
export type ItemEffectType =
  | 'hunger'
  | 'happiness'
  | 'clean'
  | 'energy'
  | 'xp'
  | 'gold';

// En temel Item tipi
export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  effectType: ItemEffectType;
  effectValue: number;
  icon?: string;
}

// -----------------------------
// Yeni Aksesuar Sistemi
// -----------------------------
export interface Accessory {
  id: string;
  name: string;
  description: string;
  bonusType: 'happiness' | 'cleaning' | 'minigame_gold' | 'attack_mode';
  bonusValue: number;
  color?: string; // örn: parlak sarı, kırmızı-beyaz, neon tonlar
}

// -----------------------------
// Skin Sistemi (Draco karakterleri)
// -----------------------------
export interface DragonSkin {
  id: string; // 'red_default' | 'ice_draco' | 'electric_draco' ...
  name: string;
  unlockLevel: number;
  passive: {
    // Temizlik daha yavaş azalır, mini oyun hız bonusu vs.
    type: 'clean_decay' | 'minigame_speed' | 'none';
    value: number;
  };
  palette: {
    base: string;   // gövde rengi
    accent: string; // detay rengi (kanat, boynuz vb.)
  };
}

// -----------------------------
// Ev Geliştirmeleri (Home Upgrade)
// -----------------------------
export interface HomeUpgrade {
  id: string; // 'mini_forest' | 'cleaning_set' | 'weather_station'
  name: string;
  bonusType: 'happiness_rate' | 'cleaning_rate' | 'weather_bonus';
  bonusValue: number;
}

// -----------------------------
// NPC Sistemi
// -----------------------------
export interface NpcState {
  id: 'mouse_friend' | 'owl_weather' | 'joker_dragon';
  message: string;
  rewardType: 'minigame_invite' | 'weather_info' | 'random_buff';
}

// -----------------------------
// Günlük Görevler
// -----------------------------
export type DailyQuestType =
  | 'feed_once'
  | 'play_minigame'
  | 'clean_poop'
  | 'wash_draco_once'          // yeni
  | 'win_minigame_once'        // yeni
  | 'reach_happiness_80';      // yeni

export interface DailyQuest {
  id: string;
  type: DailyQuestType;
  description: string;
  isCompleted: boolean;
  rewardXp: number;
  rewardGold: number;
  // skin açma parçası
  rewardSkinShards?: number;
}

// -----------------------------
// Draco’nun durum istatistikleri
// -----------------------------
export interface DragonStats {
  happiness: number; // 0–100
  hunger: number;    // 0–100 (0 = tok, 100 = aç)
  energy: number;    // 0–100
  cleanliness: number; // 0–100
}

// -----------------------------
// Görsel Efektler (küçük partiküller vs.)
// -----------------------------
export interface VisualEffect {
  id: number;
  type: 'sparkle' | 'level_up' | 'clean_sparkle' | 'tap_happy';
  x: number;
  y: number;
  lifetime: number;
}

// -----------------------------
// Oyunun Ana State’i
// -----------------------------
export interface GameState {
  // Genel
  level: number;
  xp: number;
  gold: number;

  stage: DragonStage;
  stats: DragonStats;

  currentScreen: Screen;
  currentWeather: WeatherType;

  // Zaman / kayıt
  lastSaveAt: number;
  lastUpdateAt: number;

  // Poop ve temizlik
  poopCount: number;

  // Envanter
  inventory: Item[];

  // Aktif mini oyun
  activeMiniGame?: MiniGameType;
  miniGameStreak: number;

  // Günlük görevler
  dailyQuests: DailyQuest[];
  lastDailyResetAt: number;

  // 🎧 Aksesuar sistemi
  equippedAccessoryId?: string; // şu an takılı olan aksesuar ID’si

  // 🎨 Skin sistemi
  activeSkinId: string;       // hangi skin kullanılıyor
  unlockedSkins: string[];    // açılmış skin ID listesi

  // 🏠 Ev geliştirmeleri
  ownedUpgrades: string[];    // sahip olunan upgrade ID listesi

  // 🧍‍♂️ NPC
  activeNpc?: NpcState;       // ekranda görünen NPC varsa

  // 🔹 Skin parçaları
  skinShards: number;

  // Görsel efektler
  visualEffects: VisualEffect[];
}

// -----------------------------
// Kaydedilen veri (persist)
// -----------------------------
export interface PersistedGameState {
  version: number;
  state: GameState;
}
