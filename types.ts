
import React from 'react';

export enum View {
  SPLASH = 'SPLASH',
  OVERVIEW = 'OVERVIEW',
  ANIMALS = 'ANIMALS',
  ANIMAL_DETAILS = 'ANIMAL_DETAILS',
  CONSTRUCTION = 'CONSTRUCTION',
  TASKS = 'TASKS',
  SHOP = 'SHOP',
  MAP = 'MAP',
  MANAGEMENT = 'MANAGEMENT', 
}

export type HabitatType = 'Savanna' | 'Forest' | 'Polar' | 'Aquatic' | 'Jungle' | 'General';

export interface Animal {
  id: string;
  name: string;
  species: string;
  habitatType: HabitatType;
  image: string;
  health: number;
  happiness: number;
  gender: 'Male' | 'Female';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description?: string;
  isBornInZoo?: boolean; 
  // Yeni özellikler
  cleanliness?: number; // 0-100, barınak/hayvan temizliği
  personality?: 'Uysal' | 'Oyuncu' | 'Agresif' | 'Utangaç';
}

export interface Task {
  id: string;
  type: 'daily' | 'event' | 'achievement';
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  rewards: { type: 'gold' | 'xp' | 'diamond'; amount: number }[];
  completed: boolean;
  minLevel?: number;
}

export interface BuildingItem {
  id: string;
  name: string;
  cost: number;
  currency: 'gold' | 'leaves' | 'diamond';
  icon: string | React.ReactElement;
  type: 'decoration' | 'habitat' | 'facility' | 'road';
  habitatType?: HabitatType;
  width: number;
  height: number;
}

export interface PlacedItem {
  instanceId: string;
  itemId: string;
  x: number;
  y: number;
  buildingData: BuildingItem;
}

// MarketItem is now used for background data, not direct display
export interface MarketItem {
  id: string;
  species: string;
  cost: number; // This is now the "value" of the animal
  minLevel: number;
  habitatType: HabitatType;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  image: string;
  stock: number; 
  maxStock: number;
}

export interface ExplorationRegion {
  id: string;
  name: string;
  description: string;
  image: string;
  cost: number;
  minLevel: number;
  habitatType: HabitatType;
  availableAnimals: string[]; // List of species names available here
}

export interface SpecialEvent {
  id: string;
  title: string;
  description: string;
  timeLeft: string;
  color: string;
  icon: string;
  rewardText: string;
  rewardItem?: MarketItem;
  requiredProgress: number; 
  currentProgress: number;
}

// --- NEW TYPES FOR IMPROVEMENTS ---

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

export interface Visitor {
    id: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    color: string;
    thought?: string; // Visitor thought bubble
}

export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'night';

export interface SavedGameState {
    gold: number;
    diamonds: number;
    xp: number;
    level: number;
    zooName: string;
    ticketPrice: number;
    myAnimals: Animal[];
    placedItems: PlacedItem[];
    tasks: Task[];
    mapLevel: number;
    isDarkMode: boolean;
    soundEnabled: boolean;
    musicEnabled: boolean;
}
