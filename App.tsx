import React, { useState, useEffect, useRef } from 'react';
import { GameState, Screen, DragonStage, Item, WeatherType, MiniGameType, NpcState, DragonType, GardenPlot, DailyQuest, OfflineSummary } from './types';
import { ITEMS, INITIAL_GAME_STATE, QUEST_DEFINITIONS } from './constants';
import { Haptics } from './haptics';

// --- AUDIO & HAPTIC ENGINE ---
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const SoundEngine = {
  muted: false,
  playTone: (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    if (SoundEngine.muted) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error("Audio Error", e);
    }
  },
  playJump: () => {
    Haptics.tap();
    SoundEngine.playTone(150, 'square', 0.1);
    setTimeout(() => SoundEngine.playTone(300, 'square', 0.2), 100);
  },
  playEat: () => {
    Haptics.success();
    SoundEngine.playTone(200, 'sawtooth', 0.1);
    setTimeout(() => SoundEngine.playTone(150, 'sawtooth', 0.1), 100);
  },
  playCoin: () => {
    Haptics.tap();
    SoundEngine.playTone(1000, 'sine', 0.1, 0.05);
    setTimeout(() => SoundEngine.playTone(1500, 'sine', 0.3, 0.05), 100);
  },
  playEvolve: () => {
    Haptics.evolve();
    [220, 330, 440, 550, 660, 880].forEach((f, i) => {
      setTimeout(() => SoundEngine.playTone(f, 'square', 0.3, 0.1), i * 150);
    });
  },
  playBattleHit: () => {
    Haptics.mediumTap();
    SoundEngine.playTone(100, 'sawtooth', 0.2, 0.2);
  },
  playBattleWin: () => {
    Haptics.success();
    SoundEngine.playTone(400, 'square', 0.2);
    setTimeout(() => SoundEngine.playTone(600, 'square', 0.4), 200);
  },
  playDefend: () => {
    Haptics.tap();
    SoundEngine.playTone(800, 'triangle', 0.1, 0.1);
  },
  playCharge: () => {
    Haptics.mediumTap();
    SoundEngine.playTone(300, 'sine', 0.5, 0.1);
  },
  playUltimate: () => {
    Haptics.evolve();
    [100, 200, 300, 400, 500].forEach((f, i) => setTimeout(() => SoundEngine.playTone(f, 'sawtooth', 0.1, 0.3), i*50));
  }
};

// --- Types ---
interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface HomeUpgrades {
  forest: boolean;
  cleanKit: boolean;
  weatherStation: boolean;
}

// --- Pixel Art Data ---
const PIXEL_ART: Record<string, { grid: number[][]; palette: string[] }> = {
  EGG: {
    grid: [[0,0,0,1,1,1,0,0],[0,0,1,2,2,2,1,0],[0,1,2,2,3,2,2,1],[0,1,2,3,2,3,2,1],[0,1,2,2,2,2,2,1],[0,1,2,2,2,2,2,1],[0,0,1,2,2,2,1,0],[0,0,0,1,1,1,0,0]],
    palette: ['transparent', '#b91c1c', '#fecaca', '#f87171'],
  },
  APPLE: {
    grid: [[0,0,0,2,0,0,0,0],[0,0,0,2,2,0,0,0],[0,0,1,1,1,1,0,0],[0,1,3,1,1,1,1,0],[0,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,0,0,0,0,0,0,0]],
    palette: ['transparent', '#ef4444', '#166534', '#fca5a5'],
  },
  SEED_APPLE: {
     grid: [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,1,1,0,0,0],[0,0,1,2,2,1,0,0],[0,0,1,2,2,1,0,0],[0,0,0,1,1,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
     palette: ['transparent', '#5c3a21', '#3e2723']
  },
  SEED_SALAD: {
     grid: [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,1,1,1,0,0,0],[0,0,1,1,1,0,0,0],[0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
     palette: ['transparent', '#fef3c7']
  },
  FISH: {
    grid: [[0,0,0,0,0,0,0,0],[0,0,0,1,1,1,0,0],[0,1,1,2,2,2,1,0],[1,2,2,2,2,3,1,1],[0,1,1,2,2,2,1,0],[0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
    palette: ['transparent', '#1e3a8a', '#60a5fa', '#000000'],
  },
  STEAK: {
    grid: [[0,0,0,0,0,0,0,0],[0,0,1,1,1,0,0,0],[0,1,2,2,2,1,0,0],[0,1,3,2,2,2,1,0],[0,1,2,3,2,2,1,0],[0,0,1,1,1,1,2,1],[0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0]],
    palette: ['transparent', '#7f1d1d', '#b91c1c', '#fecaca'],
  },
  SALAD: {
    grid: [[0,0,0,0,0,0,0,0],[0,0,0,1,0,1,0,0],[0,0,1,1,1,1,1,0],[0,1,2,1,2,1,2,1],[0,1,1,2,1,2,1,1],[0,0,3,3,3,3,3,0],[0,0,3,3,3,3,3,0],[0,0,0,3,3,3,0,0]],
    palette: ['transparent', '#166534', '#4ade80', '#92400e'],
  },
  BALL: {
    grid: [[0,0,0,1,1,0,0,0],[0,0,1,2,2,1,0,0],[0,1,2,3,3,2,1,0],[1,2,3,3,3,3,2,1],[1,2,3,3,3,3,2,1],[0,1,2,3,3,2,1,0],[0,0,1,2,2,1,0,0],[0,0,0,1,1,0,0,0]],
    palette: ['transparent', '#7f1d1d', '#ef4444', '#f87171'],
  },
  PLUSH: {
    grid: [[0,1,0,0,0,0,1,0],[1,2,1,0,0,1,2,1],[1,2,2,1,1,2,2,1],[0,1,2,2,2,2,1,0],[0,1,2,3,3,2,1,0],[0,0,1,2,2,1,0,0],[0,1,2,1,1,2,1,0],[0,1,1,0,0,1,1,0]],
    palette: ['transparent', '#78350f', '#b45309', '#000000'],
  },
  CIRCUS_RING: {
    grid: [[0,0,1,2,2,1,0,0],[0,1,3,0,0,3,1,0],[1,2,0,0,0,0,2,1],[1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1],[1,2,0,0,0,0,2,1],[0,1,3,0,0,3,1,0],[0,0,1,2,2,1,0,0]],
    palette: ['transparent', '#b91c1c', '#f97316', '#facc15'],
  },
  HAT: {
    grid: [[0,0,0,0,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,1,0,0],[0,0,1,1,1,1,0,0],[0,0,1,2,2,1,0,0],[0,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0]],
    palette: ['transparent', '#4338ca', '#facc15'],
  },
  GLASSES: {
    grid: [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[1,1,1,0,0,1,1,1],[1,2,1,1,1,1,2,1],[1,1,1,0,0,1,1,1],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
    palette: ['transparent', '#000000', '#3b82f6'],
  },
  POTION: {
    grid: [[0,0,0,1,0,0,0,0],[0,0,0,2,0,0,0,0],[0,0,0,2,0,0,0,0],[0,0,1,1,1,0,0,0],[0,0,1,3,1,0,0,0],[0,1,3,3,3,1,0,0],[0,1,3,3,3,1,0,0],[0,0,1,1,1,0,0,0]],
    palette: ['transparent', '#eab308', '#a16207', '#ec4899'],
  },
  STAR: {
    grid: [[0,0,0,0,1,0,0,0],[0,0,0,1,2,1,0,0],[0,1,1,1,2,1,1,1],[0,0,1,1,2,1,1,0],[0,0,0,1,2,1,0,0],[0,0,1,0,0,1,0,0],[0,1,0,0,0,0,1,0],[0,0,0,0,0,0,0,0]],
    palette: ['transparent', '#eab308', '#fef08a'],
  },
  MOUSE: {
    grid: [[0,2,0,0,0,0,2,0],[2,1,2,0,0,2,1,2],[2,1,1,2,2,1,1,2],[0,2,1,1,1,1,2,0],[0,0,1,3,3,1,0,0],[0,0,1,1,1,1,0,0],[0,1,1,0,0,1,1,0],[1,1,0,0,0,0,1,1]],
    palette: ['transparent', '#9ca3af', '#4b5563', '#000']
  },
  OWL: {
    grid: [[0,1,0,0,0,0,1,0],[1,2,1,1,1,1,2,1],[1,2,3,2,2,3,2,1],[1,1,1,3,3,1,1,1],[0,1,2,2,2,2,1,0],[0,1,2,1,1,2,1,0],[0,0,3,0,0,3,0,0],[0,0,0,0,0,0,0,0]],
    palette: ['transparent', '#78350f', '#92400e', '#fef3c7']
  },
  JOKER: {
    grid: [[0,1,0,1,0,1,0,1],[1,2,1,2,1,2,1,2],[0,1,3,3,3,3,1,0],[0,1,3,4,3,4,1,0],[0,1,3,3,5,3,1,0],[0,0,1,3,3,1,0,0],[0,1,1,2,2,1,1,0],[0,0,0,0,0,0,0,0]],
    palette: ['transparent', '#db2777', '#facc15', '#ffffff', '#000', '#ef4444']
  },
  ROCK: {
    grid: [[0,0,0,0,0,0,0,0],[0,0,0,1,1,0,0,0],[0,0,1,1,1,1,0,0],[0,1,1,2,2,1,1,0],[0,1,2,2,2,2,1,0],[1,1,2,2,2,2,1,1],[1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0]],
    palette: ['transparent', '#4b5563', '#1f2937']
  },
  NOTE: {
    grid: [[0,0,0,0,0,1,0,0],[0,0,0,0,0,1,1,0],[0,0,0,0,0,1,0,1],[0,0,0,0,0,1,0,0],[0,0,0,0,0,1,0,0],[0,1,1,1,1,1,0,0],[1,1,1,1,1,1,0,0],[0,1,1,1,1,0,0,0]],
    palette: ['transparent', '#facc15']
  },
  MERCHANT: {
    grid: [[0,0,0,1,1,1,0,0],[0,0,1,1,1,1,1,0],[0,0,1,2,2,2,1,0],[0,0,1,2,2,2,1,0],[0,0,3,3,3,3,3,0],[0,3,3,3,3,3,3,3],[0,3,3,4,4,4,3,3],[0,0,4,4,4,4,4,0]],
    palette: ['transparent', '#4b5563', '#d1d5db', '#1e3a8a', '#1d4ed8']
  },
  BARD: {
    grid: [[0,0,0,1,1,0,0,0],[0,0,0,2,2,0,0,0],[0,0,2,2,2,2,0,0],[0,0,1,1,1,1,0,0],[0,1,1,3,3,1,1,0],[0,1,1,3,3,1,1,0],[0,0,1,1,1,1,0,0],[0,0,4,0,0,4,0,0]],
    palette: ['transparent', '#166534', '#fca5a5', '#facc15', '#000']
  }
};

// --- COMPONENTS ---

const ProceduralIcon = ({ type, size = 32, className = '' }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const art = PIXEL_ART[type];
    if (!art || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const grid = art.grid;
    const palette = art.palette;
    const h = grid.length;
    const w = grid[0].length;
    const pixelSize = Math.floor(size / Math.max(w, h));
    canvasRef.current.width = w * pixelSize;
    canvasRef.current.height = h * pixelSize;
    ctx.clearRect(0, 0, w * pixelSize, h * pixelSize);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const colorIndex = grid[y][x];
        if (colorIndex !== 0) {
          ctx.fillStyle = palette[colorIndex];
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }, [type, size]);
  return <canvas ref={canvasRef} className={`image-rendering-pixelated ${className}`} style={{ width: size, height: size }} />;
};

const PixelButton = ({ children, onClick, className = '', disabled = false, variant = 'default' }: any) => {
    let s = 'bg-gray-200 border-4 border-gray-800 text-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100';
    if(variant === 'primary') s = 'bg-[#ef4444] border-4 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:brightness-110';
    return <button onClick={onClick} disabled={disabled} className={`relative font-pixel text-xs uppercase py-3 px-4 active:translate-y-1 ${s} ${className}`}>{children}</button>;
};

const LcdScreen = ({ children, className = '', isNight = false, onClick, upgrades }: any) => (
  // FIXED: Mobile layout using fixed inset-0
  <div className={`fixed inset-0 w-full h-full text-lcd-fg overflow-hidden relative font-pixel shadow-screen-inner transition-colors duration-1000 ${upgrades?.forest ? 'bg-[#3b5c3a]' : 'bg-lcd-bg'}`} onClick={onClick}>
    <div className="absolute inset-0 pointer-events-none opacity-20 z-10 mix-blend-multiply" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0, 0.5) 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
    <div className={`absolute inset-0 bg-[#0f172a] mix-blend-multiply pointer-events-none z-20 transition-opacity duration-1000 ${isNight ? 'opacity-90' : 'opacity-0'}`} />
    <div className={`relative z-0 h-full p-4 ${className}`}>{children}</div>
  </div>
);

const StatBar = ({ icon, value, reverse = false }: any) => (
    <div className={`flex items-center gap-1 w-full max-w-[120px] ${reverse ? 'flex-row-reverse' : ''}`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <div className="flex-1 h-4 border-2 border-lcd-fg p-[1px]"><div className="h-full bg-lcd-fg" style={{ width: `${Math.min(100, value)}%` }} /></div>
    </div>
);

const Clouds = () => <div className="absolute inset-0 pointer-events-none opacity-30"><div className="absolute top-10 left-10 w-20 h-8 bg-white blur-md animate-pulse"></div></div>;
const WeatherOverlay = ({ weather }: any) => weather === 'RAIN' ? <div className="absolute inset-0 bg-blue-500/20 pointer-events-none mix-blend-multiply" /> : null;
const FloatingTextOverlay = ({ items }: any) => <div className="absolute inset-0 pointer-events-none z-50">{items.map((i:any) => <div key={i.id} style={{left:`${i.x}%`, top:`${i.y}%`, color:i.color}} className="absolute font-bold text-xs animate-bounce">{i.text}</div>)}</div>;

// --- DRAGON RENDERER ---

const DRAGON_SPRITES = {
  BABY: {
    FRONT: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,1,3,1,1,1,3,1,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,4,4,4,1,0,0,0,0,0,0],[0,0,0,0,0,1,4,4,4,1,0,0,0,0,0,0],[0,0,0,0,1,1,4,4,4,1,1,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
    SIDE: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,3,1,1,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],[0,0,0,0,1,1,4,4,1,0,0,0,0,0,0,0],[0,0,0,0,4,4,4,4,1,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],[0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
  },
  TEEN: {
    FRONT: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,1,3,1,1,1,3,1,0,0,0,0,0],[0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0],[0,0,1,1,1,1,4,4,4,1,1,1,1,0,0,0],[0,0,1,1,1,1,4,4,4,1,1,1,1,0,0,0],[0,0,0,1,1,1,4,4,4,1,1,1,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0],[0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
    SIDE: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0],[0,0,0,0,0,0,1,1,1,1,3,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0],[0,0,0,4,4,0,0,1,1,1,1,0,0,0,0,0],[0,0,4,4,4,1,1,1,4,4,1,0,0,0,0,0],[0,0,0,1,1,1,1,1,4,4,1,0,0,0,0,0],[0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],[1,1,1,1,0,0,1,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
  },
  ADULT: {
    FRONT: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],[0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,1,1,3,3,1,1,1,3,3,1,1,0,0,0],[0,0,1,1,3,3,1,1,1,3,3,1,1,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,0,1,1,2,1,1,1,2,1,1,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,0,1,4,4,4,1,0,0,0,0,0,0],[0,0,0,0,1,1,4,4,4,1,1,0,0,0,0,0],[0,0,0,0,1,1,4,4,4,1,1,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
    SIDE: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],[0,0,0,0,4,4,0,0,0,0,1,1,1,1,1,0],[0,0,0,4,4,4,0,0,1,1,1,3,3,1,2,0],[0,0,4,4,4,4,1,1,1,1,1,1,1,1,2,0],[0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,4,4,4,0,0,0,0],[1,1,1,1,1,1,1,1,1,2,2,0,0,0,0,0],[0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
  },
  ELDER: {
    FRONT: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,1,2,2,1,1,2,2,1,0,0,0,0,0],[0,0,0,1,3,3,1,1,3,3,1,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,1,1,5,5,1,1,5,5,1,1,0,0,0,0],[0,0,0,1,1,1,5,5,1,1,1,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],[0,0,0,1,1,4,4,4,4,1,1,0,0,0,0,0],[0,0,0,1,4,4,4,4,4,4,1,0,0,0,0,0],[0,0,0,1,4,4,4,4,4,4,1,0,0,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,2,2,0,0,0,0,2,2,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
    SIDE: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,2,2,1,1,0,0],[0,0,0,0,0,0,0,0,0,1,1,3,1,1,0,0],[0,0,0,0,0,4,0,0,0,1,1,5,5,1,0,0],[0,0,0,4,4,4,0,0,1,1,1,1,1,0,0,0],[0,0,0,4,4,4,1,1,1,1,1,1,0,0,0,0],[0,0,1,1,1,1,1,1,4,4,4,0,0,0,0,0],[1,1,1,1,0,0,0,1,2,2,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
  }
};

function getDragonColors(val: number, type: DragonType, age: DragonStage, t: number = 0) {
    let body = '#ef4444', shadow = '#991b1b', eye = '#fbbf24', belly = '#fee2e2', white = '#ffffff';
    if (type === 'FIRE') { body = '#dc2626'; shadow = '#7f1d1d'; belly = '#fca5a5'; }
    else if (type === 'ICE') { body = '#06b6d4'; shadow = '#0e7490'; belly = '#cffafe'; }
    else if (type === 'NATURE') { body = '#16a34a'; shadow = '#14532d'; belly = '#dcfce7'; }
    if(age === DragonStage.BABY) { body = '#f87171'; shadow = '#b91c1c'; }
    if(age === DragonStage.ELDER) { body = '#b91c1c'; shadow = '#7f1d1d'; belly='#e5e7eb'; }
    if(val===3) return eye; if(val===4) return belly; if(val===1) return body; if(val===2) return shadow; if(val===5) return white; 
    return null;
}

const ProceduralDragon = ({ stage, type='NORMAL', accessory, className = '', animate = true, direction = 1, isMoving = false }: any) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);
    const flipStyle = direction === -1 ? { transform: 'scaleX(-1)' } : {};
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const baseSize = 16, scale = 4, logicalSize = baseSize * scale;
        canvas.width = logicalSize; canvas.height = logicalSize;
        let currentStageData = DRAGON_SPRITES.ADULT;
        if (stage === DragonStage.BABY) currentStageData = DRAGON_SPRITES.BABY;
        else if (stage === DragonStage.TEEN) currentStageData = DRAGON_SPRITES.TEEN;
        else if (stage === DragonStage.ELDER) currentStageData = DRAGON_SPRITES.ELDER;
        const dragonGrid = isMoving ? currentStageData.SIDE : currentStageData.FRONT;
        const render = (ts: number) => {
            if(!animate) { ctx.clearRect(0,0,canvas.width,canvas.height); }
            const t = ts/1000;
            const offsetY = Math.sin(t*(isMoving ? 12 : 2))*0.5;
            ctx.clearRect(0,0,canvas.width,canvas.height);
            for(let by=0; by<16; by++) {
                for(let bx=0; bx<16; bx++) {
                    const val = dragonGrid[by][bx];
                    if(val===0) continue;
                    const c = getDragonColors(val, type, stage, t);
                    if(!c) continue;
                    for(let sy=0; sy<scale; sy++) for(let sx=0; sx<scale; sx++) { ctx.fillStyle = c; ctx.fillRect(bx*scale+sx, by*scale+sy+offsetY, 1, 1); }
                }
            }
             if(accessory === 'hat') { ctx.fillStyle = '#6366f1'; ctx.fillRect(20, 10 + offsetY, 24, 4); }
             else if(accessory === 'glasses') { ctx.fillStyle = '#000'; ctx.fillRect(16, 25+offsetY, 32, 2); }
             else if(accessory === 'crown') { ctx.fillStyle = '#fbbf24'; ctx.fillRect(20, 5 + offsetY, 24, 8); }
             else if(accessory === 'horn') { ctx.fillStyle = '#b91c1c'; ctx.fillRect(30, 8 + offsetY, 4, 10); }
             else if(accessory === 'scarf') { ctx.fillStyle = '#ef4444'; ctx.fillRect(20, 48 + offsetY, 24, 6); }
             else if(accessory === 'headphones') { ctx.fillStyle = '#22c55e'; ctx.fillRect(14, 20 + offsetY, 4, 12); ctx.fillRect(46, 20 + offsetY, 4, 12); ctx.fillRect(14, 18+offsetY, 36, 2); }
            frameRef.current = requestAnimationFrame(render);
        }
        frameRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frameRef.current);
    }, [stage, type, animate, accessory, isMoving]);
    return <canvas ref={canvasRef} className={`image-rendering-pixelated w-full h-full object-contain ${className}`} style={flipStyle} />;
};

// --- MODAL COMPONENT DEFINITIONS ---

const QuestModal = ({ quests, onClaim, onClose }: { quests: DailyQuest[], onClaim: (id: string) => void, onClose: () => void }) => (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-lcd-bg border-4 border-lcd-fg p-3 w-full max-w-[280px] shadow-pixel">
            <div className="flex justify-between items-center mb-2 border-b-2 border-lcd-fg pb-1">
                <h3 className="text-sm font-pixel">GÜNLÜK GÖREVLER</h3>
                <button onClick={onClose}>X</button>
            </div>
            <div className="space-y-2">
                {quests.map(q => (
                    <div key={q.id} className="border-2 border-black/20 p-2 flex justify-between items-center bg-white/10">
                        <div className="text-[10px]">
                            <div className={q.completed ? 'line-through opacity-50' : ''}>{q.text} ({q.currentCount}/{q.targetCount})</div>
                            <div className="text-[9px] text-green-700">{q.rewardClaimed ? 'Tamamlandı' : q.completed ? 'Ödül Hazır!' : 'Devam Ediyor'}</div>
                        </div>
                        <button disabled={!q.completed || q.rewardClaimed} onClick={() => onClaim(q.id)} className="text-[9px] border-2 border-black px-1 py-1 bg-yellow-400 disabled:opacity-30 disabled:bg-gray-400">
                             {q.rewardClaimed ? 'ALINDI' : `AL (${q.rewardGold}G)`}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const InventoryModal = ({ inventory, onSelect, onClose }: any) => {
    const items = ITEMS.filter(i => (inventory[i.id]||0)>0);
    return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
        <div className="bg-lcd-bg border-4 border-lcd-fg p-4 w-64 max-h-[80%] overflow-y-auto">
            <div className="flex justify-between mb-2"><h3>ÇANTA</h3><button onClick={onClose}>X</button></div>
            <div className="grid grid-cols-2 gap-2">
                {items.length===0 && <div className="text-xs opacity-50">Boş...</div>}
                {items.map(i => <button key={i.id} onClick={()=>onSelect(i)} className="border border-lcd-fg p-2 flex flex-col items-center"><ProceduralIcon type={i.image} size={24}/><span className="text-[10px]">{i.name} x{inventory[i.id]}</span></button>)}
            </div>
        </div>
    </div>
    );
};

// --- MINI GAMES ---

const FallingGame = ({ onComplete }: any) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [playerX, setPlayerX] = useState(50);
    const [items, setItems] = useState<{id:number, x:number, y:number, type:'GOOD'|'BAD'}[]>([]);
    
    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
        const spawner = setInterval(() => {
            setItems(i => [...i, { id: Date.now(), x: Math.random() * 90 + 5, y: -10, type: Math.random() > 0.3 ? 'GOOD' : 'BAD' }]);
        }, 800);
        const looper = setInterval(() => {
            setItems(prev => {
                return prev.map(i => ({...i, y: i.y + 2})).filter(i => {
                    if (i.y > 85 && i.y < 95 && Math.abs(i.x - playerX) < 10) {
                        if(i.type === 'GOOD') { setScore(s=>s+10); SoundEngine.playCoin(); }
                        else { setScore(s=>Math.max(0, s-20)); SoundEngine.playBattleHit(); }
                        return false; 
                    }
                    return i.y < 100;
                });
            });
        }, 50);
        return () => { clearInterval(timer); clearInterval(spawner); clearInterval(looper); }
    }, []); // Removed playerX dependency to avoid resets

    useEffect(() => { if(timeLeft === 0) onComplete('WIN', 'FALLING'); }, [timeLeft]);

    return (
        <div className="w-full h-64 bg-sky-200 relative overflow-hidden border-4 border-black" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setPlayerX(((e.clientX - rect.left) / rect.width) * 100);
        }}>
            <div className="absolute top-2 left-2">Score: {score}</div>
            <div className="absolute top-2 right-2">Time: {timeLeft}</div>
            {items.map(i => (
                <div key={i.id} className="absolute text-2xl" style={{left:`${i.x}%`, top:`${i.y}%`}}>
                    {i.type === 'GOOD' ? '🍎' : '🪨'}
                </div>
            ))}
            <div className="absolute bottom-2 transition-all duration-100" style={{left:`${playerX}%`, transform:'translateX(-50%)'}}>
                <ProceduralDragon stage={DragonStage.TEEN} scale={2} />
            </div>
        </div>
    );
};

const ClickerGame = ({ onComplete }: any) => {
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    useEffect(() => {
        const t = setInterval(() => setTimeLeft(prev => {
            if(prev <= 1) { clearInterval(t); return 0; }
            return prev - 1;
        }), 1000);
        return () => clearInterval(t);
    }, []);
    
    useEffect(() => { if(timeLeft === 0) onComplete(clicks > 20 ? 'WIN' : 'LOSE', 'CLICKER'); }, [timeLeft]);

    return (
        <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-2xl">Süre: {timeLeft}</div>
            <div className="text-xl">Tıklama: {clicks}</div>
            <button 
                onClick={() => { setClicks(c=>c+1); SoundEngine.playEat(); }}
                className="bg-red-500 text-white w-32 h-32 rounded-full border-b-8 border-red-800 active:translate-y-2 active:border-b-0 text-xl font-bold"
            >
                TIKLA!
            </button>
        </div>
    );
};

const RpsGame = ({ onComplete }: any) => {
    const [status, setStatus] = useState<'PICK' | 'RESULT'>('PICK');
    const [result, setResult] = useState<string>('');
    const [pcMove, setPcMove] = useState('');
    
    const play = (choice: string) => {
        const moves = ['TAŞ', 'KAĞIT', 'MAKAS'];
        const pc = moves[Math.floor(Math.random() * 3)];
        setPcMove(pc);
        let res: 'WIN'|'LOSE'|'DRAW' = 'LOSE';
        if(choice === pc) res = 'DRAW';
        else if((choice === 'TAŞ' && pc === 'MAKAS') || (choice === 'KAĞIT' && pc === 'TAŞ') || (choice === 'MAKAS' && pc === 'KAĞIT')) res = 'WIN';
        setResult(res); setStatus('RESULT');
        setTimeout(() => onComplete(res, 'RPS'), 1500);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {status === 'PICK' ? (
                <>
                    <div className="text-sm">Seçimini Yap:</div>
                    <div className="flex gap-2">
                        <button onClick={()=>play('TAŞ')} className="border-2 border-white p-2 hover:bg-white/20">🪨 TAŞ</button>
                        <button onClick={()=>play('KAĞIT')} className="border-2 border-white p-2 hover:bg-white/20">📄 KAĞIT</button>
                        <button onClick={()=>play('MAKAS')} className="border-2 border-white p-2 hover:bg-white/20">✂️ MAKAS</button>
                    </div>
                </>
            ) : (
                <div className="text-center animate-bounce">
                    <div className="text-xl">{pcMove}</div>
                    <div className={`text-2xl font-bold ${result==='WIN'?'text-green-400':result==='LOSE'?'text-red-400':'text-yellow-400'}`}>{result === 'WIN' ? 'KAZANDIN!' : result === 'LOSE' ? 'KAYBETTİN' : 'BERABERE'}</div>
                </div>
            )}
        </div>
    );
};

const MathGame = ({ onComplete }: any) => {
    const [question, setQuestion] = useState<{q:string, a:number} | null>(null);
    const [options, setOptions] = useState<number[]>([]);
    useEffect(() => {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const op = Math.random() > 0.5 ? '+' : '-';
        const ans = op === '+' ? a+b : a-b;
        setQuestion({ q: `${a} ${op} ${b} = ?`, a: ans });
        const opts = new Set([ans]);
        while(opts.size < 3) opts.add(ans + Math.floor(Math.random() * 10) - 5);
        setOptions(Array.from(opts).sort(()=>Math.random()-0.5));
    }, []);
    const check = (val: number) => { if(question && val === question.a) onComplete('WIN', 'MATH'); else onComplete('LOSE', 'MATH'); };
    if(!question) return <div>Yükleniyor...</div>;
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-2xl font-bold">{question.q}</div>
            <div className="grid grid-cols-3 gap-2">{options.map((o,i) => <button key={i} onClick={()=>check(o)} className="border-2 border-white p-3 text-xl hover:bg-white/20">{o}</button>)}</div>
        </div>
    );
};

const MemoryGame = ({ onComplete }: any) => {
    const [cards, setCards] = useState<{id:number, icon:string, flipped:boolean, matched:boolean}[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    useEffect(() => {
        const icons = ['APPLE', 'BALL', 'HAT', 'STAR'];
        const deck = [...icons, ...icons].sort(() => Math.random() - 0.5).map((icon, id) => ({ id, icon, flipped: false, matched: false }));
        setCards(deck);
    }, []);
    const handleCardClick = (id: number) => {
        if(flipped.length >= 2) return;
        const cardIndex = cards.findIndex(c=>c.id===id);
        if(cards[cardIndex].matched || cards[cardIndex].flipped) return;
        const newCards = [...cards]; newCards[cardIndex].flipped = true; setCards(newCards);
        const newFlipped = [...flipped, id]; setFlipped(newFlipped);
        if(newFlipped.length === 2) {
            const c1 = newCards.find(c=>c.id===newFlipped[0]);
            const c2 = newCards.find(c=>c.id===newFlipped[1]);
            if(c1 && c2 && c1.icon === c2.icon) {
                setTimeout(() => { setCards(curr => { const next = curr.map(c => (c.id === c1.id || c.id === c2.id) ? {...c, matched: true} : c); if(next.every(c=>c.matched)) setTimeout(()=>onComplete('WIN', 'MEMORY'), 500); return next; }); setFlipped([]); }, 500);
            } else {
                setTimeout(() => { setCards(curr => curr.map(c => (c.id === newFlipped[0] || c.id === newFlipped[1]) ? {...c, flipped: false} : c)); setFlipped([]); }, 1000);
            }
        }
    };
    return (
        <div className="grid grid-cols-4 gap-2">{cards.map(c => <button key={c.id} onClick={()=>handleCardClick(c.id)} className={`w-10 h-10 border flex items-center justify-center bg-black/50 ${c.flipped || c.matched ? 'bg-white/20' : ''}`}>{(c.flipped || c.matched) ? <ProceduralIcon type={c.icon} size={24} /> : '?'}</button>)}</div>
    );
};

const TargetGame = ({ onComplete }: any) => {
    const [pos, setPos] = useState({x:50, y:50});
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(12);
    const [targetType, setTargetType] = useState<'FRUIT' | 'STONE'>('FRUIT');

    useEffect(() => {
        const t = setInterval(() => {
            setTimeLeft(prev => { 
                if(prev <= 1) { 
                    clearInterval(t); 
                    return 0; 
                } 
                return prev - 1; 
            });
        }, 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => { 
        if(timeLeft === 0) onComplete(score >= 6 ? 'WIN' : 'LOSE', 'TARGET'); 
    }, [timeLeft]);

    const hit = () => { 
        Haptics.tap();
        setScore(s => s + 1); 
        setPos({x: Math.random() * 76 + 12, y: Math.random() * 70 + 15}); 
        setTargetType(Math.random() > 0.4 ? 'FRUIT' : 'STONE');
        SoundEngine.playCoin(); 
    };

    return (
        <div className="relative w-full h-48 border-4 border-lcd-fg bg-black/60 overflow-hidden font-pixel select-none">
            <div className="absolute top-2 left-2 text-[10px] text-yellow-300">Süre: {timeLeft}s | Skor: {score}/6</div>
            <div className="absolute top-2 right-2 text-[9px] text-green-300">HEDEFE DOKUN!</div>
            <button 
                onTouchStart={(e)=>{ e.stopPropagation(); hit(); }}
                onClick={(e)=>{ e.stopPropagation(); hit(); }} 
                className="absolute w-12 h-12 flex items-center justify-center text-2xl active:scale-125 transition-transform" 
                style={{left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)'}}
            >
                {targetType === 'FRUIT' ? '🍎' : '🎯'}
            </button>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-30 text-[8px] text-white">
                DRACO İLE NİŞAN AL
            </div>
        </div>
    );
};

const RunnerGame = ({ onComplete }: any) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [dracoY, setDracoY] = useState(0);
  const [obstacles, setObstacles] = useState<number[]>([]);
  const tickRef = useRef(0);
  const animRef = useRef(0);
  const jump = () => { if (dracoY === 0) { SoundEngine.playJump(); let velocity = 15; const jumpInterval = setInterval(() => { setDracoY((prev) => { const next = prev + velocity; velocity -= 1.5; if (next <= 0) { clearInterval(jumpInterval); return 0; } return next; }); }, 30); } };
  useEffect(() => {
    const loop = () => { if (gameOver) return; setScore(s => s + 1); tickRef.current++; if (tickRef.current % 100 === 0) setObstacles(prev => [...prev, 100]); setObstacles(prev => { const next = prev.map(x => x - 1.5).filter(x => x > -10); for (const obs of next) { if (obs > 10 && obs < 20 && dracoY < 10) setGameOver(true); } return next; }); animRef.current = requestAnimationFrame(loop); };
    animRef.current = requestAnimationFrame(loop); return () => cancelAnimationFrame(animRef.current);
  }, [gameOver, dracoY]);
  return (
    <div className="w-full h-40 bg-sky-300 relative overflow-hidden border-4 border-black" onClick={jump}>
       <div className="absolute bottom-0 w-full h-4 bg-green-600"></div>
       <div className="absolute left-4 transition-transform" style={{ bottom: `${dracoY * 2 + 16}px` }}><ProceduralDragon stage={DragonStage.TEEN} color="#ef4444" isMoving={true} scale={2} /></div>
       {obstacles.map((x, i) => <div key={i} className="absolute bottom-4" style={{ left: `${x}%` }}><ProceduralIcon type="ROCK" size={20} /></div>)}
       <div className="absolute top-2 right-2 text-white">Score: {Math.floor(score/10)}</div>
       {gameOver && <button className="absolute inset-0 bg-black/50 text-white flex items-center justify-center" onClick={() => onComplete('WIN', 'RUNNER')}>GAME OVER (Click)</button>}
    </div>
  );
};

const RhythmGame = ({ onComplete }: any) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [notes, setNotes] = useState<{id: number, lane: number, y: number}[]>([]);
  const [active, setActive] = useState(true);
  useEffect(() => { if(!active) return; const t = setInterval(() => setTimeLeft(prev => { if(prev<=1) { setActive(false); return 0; } return prev-1; }), 1000); const f = setInterval(() => { if(Math.random() < 0.1) setNotes(p => [...p, { id: Date.now(), lane: Math.floor(Math.random()*3), y: -10 }]); setNotes(p => p.map(n => ({...n, y: n.y + 5})).filter(n => n.y < 110)); }, 100); return () => { clearInterval(t); clearInterval(f); } }, [active]);
  const tap = (lane: number) => { if(!active) return; const hit = notes.find(n => n.lane === lane && n.y > 70 && n.y < 95); if(hit) { SoundEngine.playCoin(); setScore(s => s+10); setNotes(p => p.filter(n => n.id !== hit.id)); } };
  return (
    <div className="w-full h-60 bg-gray-900 relative flex flex-col items-center">
       <div className="text-white w-full flex justify-between px-2"><span>Time: {timeLeft}</span><span>Score: {score}</span></div>
       <div className="flex-1 w-full flex justify-around relative"> {[0,1,2].map(l => <div key={l} className="h-full w-16 border-x border-gray-700 relative"><div className="absolute bottom-4 w-full h-8 bg-white/20"></div><button className="absolute bottom-0 w-full h-12 bg-purple-600 opacity-50 active:opacity-100" onClick={()=>tap(l)}></button></div>)} {notes.map(n => <div key={n.id} className="absolute w-8 h-8" style={{ left: `${n.lane*33 + 10}%`, top: `${n.y}%` }}><ProceduralIcon type="NOTE" size={24}/></div>)} </div>
       {!active && <button className="absolute inset-0 bg-black/80 text-white" onClick={()=>onComplete('WIN', 'RHYTHM')}>DONE (Score: {score})</button>}
    </div>
  );
};

const MiniGameModal = ({ onClose, onComplete, onPlayToy }: any) => {
    const [activeGame, setActiveGame] = useState<MiniGameType>('NONE');
    const renderGame = () => {
        switch(activeGame) {
            case 'RPS': return <RpsGame onComplete={onComplete} />;
            case 'MATH': return <MathGame onComplete={onComplete} />;
            case 'MEMORY': return <MemoryGame onComplete={onComplete} />;
            case 'TARGET': return <TargetGame onComplete={onComplete} />;
            case 'RUNNER': return <RunnerGame onComplete={onComplete} />;
            case 'RHYTHM': return <RhythmGame onComplete={onComplete} />;
            case 'FALLING': return <FallingGame onComplete={onComplete} />;
            case 'CLICKER': return <ClickerGame onComplete={onComplete} />;
            default: return null;
        }
    };
    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 text-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-pixel text-yellow-500">{activeGame === 'NONE' ? 'OYUN SEÇ' : activeGame}</h2>
                    <button onClick={activeGame === 'NONE' ? onClose : () => setActiveGame('NONE')} className="text-xs border px-2">{activeGame === 'NONE' ? 'X' : '< GERİ'}</button>
                </div>
                {activeGame === 'NONE' ? (
                    <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                        <button onClick={onPlayToy} className="border border-yellow-500 p-3 text-yellow-500 animate-pulse flex flex-col items-center"><span className="material-symbols-outlined mb-1">sports_soccer</span><span className="text-xs">TOP YAKALAMA</span></button>
                        {[
                            {id:'RPS', name:'TAŞ KAĞIT MAKAS', icon:'✊'}, {id:'MATH', name:'MATEMATİK', icon:'1+2'}, {id:'MEMORY', name:'HAFIZA', icon:'grid_view'}, {id:'TARGET', name:'HEDEF VUR', icon:'ads_click'},
                            {id:'RUNNER', name:'KOŞU', icon:'directions_run'}, {id:'RHYTHM', name:'RİTİM', icon:'music_note'}, {id:'FALLING', name:'YAĞMUR', icon:'umbrella'}, {id:'CLICKER', name:'HIZLI TIKLA', icon:'touch_app'}
                        ].map(g => <button key={g.id} onClick={()=>setActiveGame(g.id as MiniGameType)} className="border border-gray-500 p-3 hover:bg-white/10 flex flex-col items-center"><span className="material-symbols-outlined mb-1">{g.icon}</span><span className="text-xs">{g.name}</span></button>)}
                    </div>
                ) : (
                    <div className="border-2 border-gray-700 p-4 rounded bg-gray-900 min-h-[200px] flex items-center justify-center">{renderGame()}</div>
                )}
            </div>
        </div>
    );
};

// --- SCREENS ---

const GardenScreen = ({ gameState, onNavigate, onAction }: any) => {
  return (
    <div className="h-full bg-green-900 p-4 font-pixel text-white flex flex-col border-4 border-green-700">
       <div className="flex justify-between items-center mb-4 border-b-2 border-green-500 pb-2">
           <h2 className="text-xl text-green-300">BAHÇE</h2>
           <button onClick={() => onNavigate(Screen.MAIN)} className="bg-red-500 px-2 py-1 text-xs">ÇIKIŞ</button>
       </div>
       <div className="grid grid-cols-2 gap-4 mb-8">
          {gameState.garden.map((plot: GardenPlot) => (
             <div key={plot.id} onClick={() => onAction({ type: 'GARDEN_INTERACT', plotId: plot.id })} className={`h-24 border-4 ${plot.isUnlocked ? 'border-green-600 bg-[#3a2820]' : 'border-gray-600 bg-gray-800'} flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-transform`}>
                {!plot.isUnlocked ? <span className="text-gray-500 text-xs text-center">KİLİTLİ<br/>(100G)</span> : !plot.seedId ? <span className="text-green-200 animate-pulse text-xs">EK (TOHUM SEÇ)</span> : (
                   <>{plot.stage === 0 && <div className="w-2 h-2 bg-yellow-200 rounded-full"></div>}{plot.stage === 1 && <div className="w-2 h-6 bg-green-400"></div>}{plot.stage === 2 && <div className="text-xl animate-bounce">🍎</div>}
                      <div className="absolute bottom-1 w-3/4 h-1 bg-black"><div className="h-full bg-blue-400" style={{ width: `${plot.progress}%` }}></div></div>
                      {Date.now() - plot.lastWatered > 10000 && plot.stage < 2 && <div className="absolute top-1 right-1 text-blue-300 text-xs animate-bounce">💧</div>}
                   </>
                )}
             </div>
          ))}
       </div>
       <div className="text-[10px] text-center text-green-200 mt-auto">Tohumları Pazardan Al!</div>
    </div>
  );
};

const ArenaScreen = ({ gameState, onNavigate, onCompleteBattle }: any) => {
    const [turn, setTurn] = useState<'PLAYER' | 'ENEMY'>('PLAYER');
    const [actionLog, setActionLog] = useState<string[]>(['Savaş Başladı!']);
    const [playerHp, setPlayerHp] = useState(100);
    const [enemyHp, setEnemyHp] = useState(100);
    const [ap, setAp] = useState(3);
    const [enemy, setEnemy] = useState({ name: 'Vahşi Yarasa', type: 'NATURE' as DragonType, maxHp: 100 });
    const [critNext, setCritNext] = useState(false);
    const [shake, setShake] = useState(false);
    const [flash, setFlash] = useState('');
    const [combo, setCombo] = useState(0);
    
    const playerDefendingRef = useRef(false);

    useEffect(() => {
        const pMax = 50 + (gameState.dragon.stats.vit * 10);
        setPlayerHp(pMax);
        const eMax = 50 + (gameState.dragon.evolutionStage * 30);
        const eTypes: DragonType[] = ['FIRE', 'ICE', 'NATURE'];
        const eType = eTypes[Math.floor(Math.random() * 3)];
        setEnemy({ name: `Vahşi ${eType === 'FIRE' ? 'Alev' : eType === 'ICE' ? 'Buz' : 'Yaprak'} Kanat`, type: eType, maxHp: eMax });
        setEnemyHp(eMax);
    }, []);

    const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 300); };
    const triggerFlash = (color: string) => { setFlash(color); setTimeout(() => setFlash(''), 200); };

    const getElementMult = (atk: DragonType, def: DragonType) => {
        if(atk === 'FIRE' && def === 'NATURE') return 1.5;
        if(atk === 'NATURE' && def === 'ICE') return 1.5;
        if(atk === 'ICE' && def === 'FIRE') return 1.5;
        if(atk === def) return 1.0;
        return 0.8;
    };

    const playerAction = (action: 'ATTACK' | 'DEFEND' | 'FOCUS' | 'ULTIMATE') => {
        if(turn !== 'PLAYER') return;
        let dmg = 0; let log = '';

        if(action === 'ATTACK') {
            if(ap < 2) { setActionLog(p=>['Yetersiz AP!', ...p]); return; }
            setAp(p => p - 2);
            let mult = getElementMult(gameState.dragon.type, enemy.type);
            let base = 5 + (gameState.dragon.stats.str * 1.5);
            if(critNext) { base *= 2; setCritNext(false); mult *= 1.2; triggerFlash('gold'); }
            dmg = Math.floor(base * mult);
            setEnemyHp(h => Math.max(0, h - dmg));
            log = `${gameState.dragon.name} vurdu! ${dmg} Hasar. ${mult > 1 ? 'SÜPER ETKİLİ!' : ''}`;
            SoundEngine.playBattleHit();
            triggerShake();
            setCombo(c => c + 1);
        } else if (action === 'ULTIMATE') {
             if(ap < 3 || combo < 3) return;
             setAp(0);
             let base = 20 + (gameState.dragon.stats.int * 2);
             dmg = Math.floor(base);
             setEnemyHp(h => Math.max(0, h - dmg));
             log = `ULTIMATE SALDIRI! ${dmg} HASAR!`;
             SoundEngine.playBattleWin();
             triggerFlash('white');
             triggerShake();
             setCombo(0);
        }
        else if(action === 'DEFEND') {
            if(ap < 1) { setActionLog(p=>['Yetersiz AP!', ...p]); return; }
            setAp(p => p - 1);
            log = 'Savunma pozisyonu!';
            SoundEngine.playDefend();
            setCombo(0);
            playerDefendingRef.current = true; 
        }
        else if(action === 'FOCUS') {
            setAp(p => Math.min(5, p + 1));
            setCritNext(true);
            log = 'Gözler parlıyor... (Sonraki vuruş Kritik)';
            SoundEngine.playCharge();
            triggerFlash('blue');
        }

        setActionLog(p => [log, ...p].slice(0, 4));

        if(enemyHp - dmg <= 0) {
            setTimeout(() => { SoundEngine.playBattleWin(); onCompleteBattle(true); }, 1000);
        } else {
            setTurn('ENEMY');
            setTimeout(enemyTurn, 1500);
        }
    };

    const enemyTurn = () => {
        let dmg = 10 + (gameState.dragon.evolutionStage * 2);
        let log = '';
        const isLowHp = enemyHp < 20;
        
        if (isLowHp && Math.random() > 0.3) {
             dmg = 0;
             setEnemyHp(h => Math.min(enemy.maxHp, h + 10));
             log = `${enemy.name} yaralarını sardı! (+10 HP)`;
        } else {
             if(playerDefendingRef.current) {
                 dmg = Math.floor(dmg / 2);
                 log = `${enemy.name} saldırdı! (Bloklandı: ${dmg} Hasar)`;
             } else {
                 if(Math.random() * 100 < gameState.dragon.stats.agi) {
                    dmg = 0;
                    log = `${enemy.name} saldırdı ama ISKALADI!`;
                 } else {
                    log = `${enemy.name} saldırdı! ${dmg} Hasar.`;
                 }
             }
             
             if(dmg > 0) {
                 setPlayerHp(h => Math.max(0, h - dmg));
                 SoundEngine.playBattleHit(); 
                 triggerShake(); 
                 triggerFlash('red'); 
             }
        }

        setActionLog(p => [log, ...p].slice(0,4));
        playerDefendingRef.current = false; 

        if(playerHp - dmg <= 0) {
             setTimeout(() => onCompleteBattle(false), 1000);
        } else {
            setTurn('PLAYER');
            setAp(p => Math.min(5, p + 2));
        }
    };

    return (
        <div className={`w-full h-full bg-slate-900 text-white font-pixel flex flex-col relative overflow-hidden border-4 border-red-900 ${shake ? 'animate-shiver' : ''}`}>
            {flash && <div className={`absolute inset-0 pointer-events-none z-50 ${flash === 'red' ? 'bg-red-500/50' : flash === 'blue' ? 'bg-blue-500/50' : flash === 'gold' ? 'bg-yellow-400/50' : 'bg-white/50'}`} style={{mixBlendMode: 'overlay'}} />}
            
            <div className="shrink-0 p-2 bg-black/40 flex justify-between items-start">
                <div className="w-1/3">
                    <div className="text-[10px] text-green-400 truncate">{gameState.dragon.name} (Sen)</div>
                    <div className="h-3 bg-gray-700 mt-1 border border-gray-500 relative">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{width: `${(playerHp/(50 + gameState.dragon.stats.vit*10))*100}%`}}></div>
                    </div>
                    <div className="flex gap-1 mt-1">{Array.from({length: ap}).map((_,i) => <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>)}</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-red-500 animate-pulse">VS</div>
                    <div className="text-[8px] text-gray-400">{turn === 'PLAYER' ? 'Sıra Sende' : 'Bekle...'}</div>
                </div>
                <div className="w-1/3 text-right">
                    <div className="text-[10px] text-red-400 truncate">{enemy.name}</div>
                    <div className="h-3 bg-gray-700 mt-1 border border-gray-500 relative">
                        <div className="h-full bg-red-500 transition-all duration-500" style={{width: `${(enemyHp/enemy.maxHp)*100}%`}}></div>
                    </div>
                </div>
            </div>
            <div className="flex-1 min-h-0 flex justify-between items-center px-4 relative">
                 <div className={`scale-x-[-1] transition-transform duration-300 ${turn==='PLAYER'?'scale-110':''}`}>
                     <ProceduralDragon stage={gameState.dragon.stage} type={gameState.dragon.type} accessory={gameState.dragon.equippedAccessory} isSleeping={false} scale={3} animate={true} />
                     {critNext && <div className="absolute -top-4 left-0 text-yellow-400 text-xs animate-bounce">KRİTİK!</div>}
                 </div>
                 <div className={`transition-transform duration-300 ${turn==='ENEMY'?'scale-110':''}`}>
                     <ProceduralDragon stage={DragonStage.ADULT} type={enemy.type} isSleeping={false} scale={3} animate={true} direction={-1} />
                 </div>
            </div>
            <div className="shrink-0 p-2 bg-slate-800 border-t-2 border-slate-600 relative z-10">
                <div className="bg-black/50 p-1 h-12 overflow-hidden text-[9px] mb-2 border border-gray-600 rounded">
                    {actionLog.map((l,i) => <div key={i} className={i===0?'text-white font-bold':'text-gray-400'}>{l}</div>)}
                </div>
                <div className="grid grid-cols-4 gap-1">
                    <button onClick={() => playerAction('ATTACK')} disabled={turn !== 'PLAYER' || ap < 2} className="bg-red-600 border-b-4 border-red-800 py-3 rounded active:translate-y-1 disabled:opacity-50 disabled:translate-y-0"><div className="font-bold text-[10px]">SALDIR</div><div className="text-[8px]">2 AP</div></button>
                    <button onClick={() => playerAction('DEFEND')} disabled={turn !== 'PLAYER' || ap < 1} className="bg-blue-600 border-b-4 border-blue-800 py-3 rounded active:translate-y-1 disabled:opacity-50 disabled:translate-y-0"><div className="font-bold text-[10px]">SAVUN</div><div className="text-[8px]">1 AP</div></button>
                    <button onClick={() => playerAction('FOCUS')} disabled={turn !== 'PLAYER'} className="bg-yellow-600 border-b-4 border-yellow-800 py-3 rounded active:translate-y-1 disabled:opacity-50 disabled:translate-y-0"><div className="font-bold text-[10px]">ODAKLAN</div><div className="text-[8px]">+1 AP</div></button>
                    {combo >= 3 ? (
                        <button onClick={() => playerAction('ULTIMATE')} disabled={turn !== 'PLAYER' || ap < 3} className="bg-purple-600 border-b-4 border-purple-800 py-3 rounded active:translate-y-1 animate-pulse"><div className="font-bold text-[10px]">ULTI</div><div className="text-[8px]">3 AP</div></button>
                    ) : (
                        <div className="bg-gray-700 flex flex-col items-center justify-center rounded text-[8px] text-gray-400"><div>COMBO</div><div>{combo}/3</div></div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MarketScreen = ({ gameState, onBuy, onNavigate, upgrades, onBuyUpgrade }: any) => {
  const [tab, setTab] = useState<'ITEMS' | 'UPGRADES'>('ITEMS');
  const [subTab, setSubTab] = useState('FOOD');
  
  return (
    <div className="h-full bg-[#0D0D0D] text-[#C2D5C4] font-pixel p-4 flex flex-col border-4 border-gray-600">
      <div className="flex justify-between items-center border-b-4 border-[#C2D5C4] pb-4 mb-4">
        <h1 className="text-sm text-[#facc15]">PAZAR</h1>
        <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#facc15]">monetization_on</span><span>{gameState.currency}</span></div>
      </div>
      
      <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('ITEMS')} className={`px-2 py-1 text-xs border-2 ${tab==='ITEMS'?'bg-[#C2D5C4] text-black':'text-[#C2D5C4]'}`}>EŞYALAR</button>
          <button onClick={() => setTab('UPGRADES')} className={`px-2 py-1 text-xs border-2 ${tab==='UPGRADES'?'bg-[#C2D5C4] text-black':'text-[#C2D5C4]'}`}>EV</button>
      </div>

      {tab === 'ITEMS' && (
          <>
            <div className="flex gap-1 mb-2 overflow-x-auto">
                {['FOOD','TOY','ACCESSORY','SEED'].map(t => <button key={t} onClick={() => setSubTab(t)} className={`text-[10px] px-2 border ${subTab===t?'bg-gray-700':''}`}>{t}</button>)}
            </div>
            <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-4 pr-1">
                {ITEMS.filter(i => i.type === subTab).map(item => (
                <div key={item.id} className="border-4 border-[#C2D5C4] p-2 flex flex-col gap-2 bg-[#111]">
                    <div className="h-10 flex items-center justify-center"><ProceduralIcon type={item.image} size={32} /></div>
                    <div className="text-[10px] truncate text-center">{item.name}</div>
                    <div className="flex justify-between items-center mt-auto border-t border-[#C2D5C4]/20 pt-2">
                    <span className="text-xs text-[#facc15]">{item.price}G</span>
                    <button onClick={() => onBuy(item)} disabled={gameState.currency < item.price} className="bg-[#C2D5C4] text-black px-1 text-[10px] hover:bg-white disabled:opacity-50">AL</button>
                    </div>
                </div>
                ))}
            </div>
          </>
      )}

      {tab === 'UPGRADES' && (
          <div className="flex flex-col gap-3 overflow-y-auto">
              <div className="border-2 border-[#C2D5C4] p-2 flex justify-between items-center bg-[#111]">
                  <div>
                      <div className="text-xs font-bold">ORMAN EVİ</div>
                      <div className="text-[9px] opacity-70">Yeşil atmosfer, az açlık</div>
                  </div>
                  {upgrades.forest ? <span className="text-green-500 text-xs">ALINDI</span> : 
                  <button onClick={() => onBuyUpgrade('forest', 500)} className="bg-[#C2D5C4] text-black px-2 py-1 text-xs">500G</button>}
              </div>
              <div className="border-2 border-[#C2D5C4] p-2 flex justify-between items-center bg-[#111]">
                  <div>
                      <div className="text-xs font-bold">TEMİZLİK KİTİ</div>
                      <div className="text-[9px] opacity-70">Çok daha az kirlenme</div>
                  </div>
                  {upgrades.cleanKit ? <span className="text-green-500 text-xs">ALINDI</span> : 
                  <button onClick={() => onBuyUpgrade('cleanKit', 300)} className="bg-[#C2D5C4] text-black px-2 py-1 text-xs">300G</button>}
              </div>
              <div className="border-2 border-[#C2D5C4] p-2 flex justify-between items-center bg-[#111]">
                  <div>
                      <div className="text-xs font-bold">HAVA İSTASYONU</div>
                      <div className="text-[9px] opacity-70">Hep güneşli hava</div>
                  </div>
                  {upgrades.weatherStation ? <span className="text-green-500 text-xs">ALINDI</span> : 
                  <button onClick={() => onBuyUpgrade('weatherStation', 1000)} className="bg-[#C2D5C4] text-black px-2 py-1 text-xs">1000G</button>}
              </div>
          </div>
      )}

      <div className="mt-auto pt-4 border-t-4 border-[#C2D5C4] flex justify-center">
        <button onClick={() => onNavigate(Screen.MAIN)} className="text-xs hover:text-white animate-pulse">&lt; GERİ DÖN</button>
      </div>
    </div>
  );
};

const StartScreen = ({ onStart, onContinue, hasSave }: any) => (
  <LcdScreen className="flex flex-col items-center justify-center relative overflow-hidden bg-[#21221d]">
    <div className="z-10 flex flex-col items-center gap-6">
       <h1 className="text-4xl text-[#ef4444] font-pixel text-center leading-relaxed drop-shadow-md tracking-wider">
         Draco the<br/>Pixel Dragon
       </h1>
       <div className="w-32 h-32 relative animate-bounce-pixel">
         <ProceduralDragon stage="adult" mode="idle" animate={true} />
       </div>
       <div className="flex flex-col gap-4 w-48">
          <PixelButton onClick={onStart} variant="primary">YENİ OYUN</PixelButton>
          <PixelButton onClick={onContinue} disabled={!hasSave}>DEVAM ET</PixelButton>
       </div>
       <div className="text-[10px] text-gray-500 mt-4 font-pixel">v1.5.0 Mobile Fix</div>
    </div>
  </LcdScreen>
);

const HatchingScreen = ({ onHatchTick }: any) => {
    const [shake, setShake] = useState(false);
    return (
    <LcdScreen className="flex flex-col items-center justify-center">
        <div onClick={() => { 
            setShake(true); 
            Haptics.heartbeat(); 
            onHatchTick(); 
            SoundEngine.playJump(); 
            setTimeout(()=>setShake(false),200); 
        }} className={`cursor-pointer ${shake ? 'animate-bounce' : ''}`}>
            <ProceduralIcon type="EGG" size={72} />
            <div className="mt-4 text-center text-xs animate-pulse text-amber-900 font-bold">DOKUN! (Yumurtayı Çatlat)</div>
        </div>
    </LcdScreen>
    );
};

// --- TAMAGOTCHI SHELL & HARDWARE BUTTONS ---

const TamagotchiShell = ({ 
  children, 
  deviceMode, 
  onToggleDeviceMode, 
  onButtonA, 
  onButtonB, 
  onButtonC,
  buttonALabel = "ÇANTA",
  buttonBLabel = "SEV",
  buttonCLabel = "TEMİZLE"
}: any) => {
  if (deviceMode !== 'shell') {
    return (
      <div className="fixed inset-0 w-full h-full overflow-hidden">
        {children}
        <button 
          onClick={onToggleDeviceMode}
          title="Tamagotchi Cihaz Görünümüne Geç"
          className="absolute top-2 left-2 z-50 bg-black/60 hover:bg-black/80 text-white px-2 py-1.5 rounded-full border border-white/30 text-xs flex items-center gap-1 active:scale-95 shadow-pixel"
        >
          <span className="text-sm">🥚</span>
          <span className="text-[9px] font-pixel hidden sm:inline">KABUK</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#070b14] flex flex-col items-center justify-center p-2 select-none overflow-hidden">
      {/* 90s Egg-shaped Tamagotchi Plastic Case */}
      <div className="relative w-full max-w-[390px] h-[96vh] max-h-[780px] bg-gradient-to-b from-[#e11d48] via-[#b91c1c] to-[#7f1d1d] rounded-[52px] p-3 shadow-[0_25px_50px_rgba(0,0,0,0.9),inset_0_4px_10px_rgba(255,255,255,0.4),inset_0_-8px_16px_rgba(0,0,0,0.6)] border-4 border-[#450a0a] flex flex-col items-center justify-between">
        
        {/* Keychain Ring Loop */}
        <div className="absolute -top-3.5 w-12 h-5 border-4 border-[#ca8a04] bg-[#78350f] rounded-t-full shadow-inner flex items-center justify-center">
          <div className="w-3.5 h-1.5 bg-[#070b14] rounded-t-full"></div>
        </div>

        {/* Top Header / Mode Switcher */}
        <div className="w-full flex items-center justify-between px-4 pt-2">
          <div className="font-pixel text-[10px] text-yellow-300 tracking-wider flex items-center gap-1 drop-shadow">
            <span>🔥</span> DRACO-GOTCHI
          </div>
          <button 
            onClick={onToggleDeviceMode}
            title="Tam Ekran Moduna Geç"
            className="bg-black/60 hover:bg-black/80 text-white text-[9px] px-2 py-1 rounded font-pixel border border-white/20 flex items-center gap-1 active:scale-95"
          >
            <span>📱</span> TAM EKRAN
          </button>
        </div>

        {/* Inner LCD Screen Frame */}
        <div className="w-full flex-1 max-h-[64%] my-2 bg-[#78350f] p-2.5 rounded-[26px] border-4 border-[#451a03] shadow-[inset_0_4px_10px_rgba(0,0,0,0.7),0_2px_4px_rgba(255,255,255,0.2)] flex flex-col">
          <div className="flex justify-between items-center text-[7px] text-[#fef08a] font-pixel px-2 pb-1 opacity-75">
            <span>PIXEL DRAGON</span>
            <span>GEN-1 TAMAGOTCHI</span>
          </div>

          {/* Actual LCD Screen Viewport */}
          <div className="flex-1 relative rounded-[14px] overflow-hidden border-2 border-[#21221d] shadow-screen-inner">
            {children}
          </div>
        </div>

        {/* Nostalgic Physical Hardware 3-Buttons (A - B - C) */}
        <div className="w-full px-3 pb-3 flex flex-col items-center gap-1.5">
          <div className="flex justify-around items-center w-full gap-2">
            {/* Button A */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => { Haptics.mediumTap(); onButtonA?.(); }}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 active:from-amber-500 active:to-amber-600 border-4 border-amber-700 shadow-[0_5px_0_#78350f,0_6px_8px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-center font-pixel text-xs sm:text-sm font-bold text-amber-950"
              >
                A
              </button>
              <span className="text-[8px] font-pixel text-yellow-200 uppercase">{buttonALabel}</span>
            </div>

            {/* Button B */}
            <div className="flex flex-col items-center gap-1 mt-3">
              <button
                onClick={() => { Haptics.mediumTap(); onButtonB?.(); }}
                className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 active:from-amber-500 active:to-amber-600 border-4 border-amber-700 shadow-[0_5px_0_#78350f,0_6px_8px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-center font-pixel text-xs sm:text-sm font-bold text-amber-950"
              >
                B
              </button>
              <span className="text-[8px] font-pixel text-yellow-200 uppercase">{buttonBLabel}</span>
            </div>

            {/* Button C */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => { Haptics.mediumTap(); onButtonC?.(); }}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 active:from-amber-500 active:to-amber-600 border-4 border-amber-700 shadow-[0_5px_0_#78350f,0_6px_8px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-center font-pixel text-xs sm:text-sm font-bold text-amber-950"
              >
                C
              </button>
              <span className="text-[8px] font-pixel text-yellow-200 uppercase">{buttonCLabel}</span>
            </div>
          </div>
          
          <div className="text-[7px] font-pixel text-rose-200/50 uppercase tracking-widest pt-1">
            RETRO DRAGON PET COMPANION
          </div>
        </div>

      </div>
    </div>
  );
};

// --- OFFLINE PROGRESSION MODAL ---

const OfflineSummaryModal = ({ summary, onClose }: { summary: OfflineSummary, onClose: () => void }) => {
  const hours = Math.floor(summary.minutesAway / 60);
  const mins = summary.minutesAway % 60;
  const timeText = hours > 0 ? `${hours} sa ${mins} dk` : `${mins} dakika`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-lcd-bg border-4 border-lcd-fg p-4 w-full max-w-xs shadow-pixel text-center font-pixel animate-bounce-pixel">
        <div className="text-xs font-bold border-b-2 border-lcd-fg pb-2 mb-3">
          ✨ TEKRAR HOŞ GELDİN! ✨
        </div>
        <div className="text-[10px] mb-3 text-left bg-black/10 p-2.5 rounded border border-lcd-fg/30">
          <p className="mb-2 text-center text-[9px] text-gray-800">Draco seni <strong>{timeText}</strong> boyunca bekledi!</p>
          <div className="space-y-1.5 text-[9px]">
            <div className="flex justify-between">
              <span>🍗 Açlık:</span>
              <span className="text-red-700 font-bold">-{summary.hungerLost}%</span>
            </div>
            <div className="flex justify-between">
              <span>💤 Dinlenme:</span>
              <span className="text-blue-800 font-bold">+{summary.energyGained}%</span>
            </div>
            {summary.poopsAdded > 0 && (
              <div className="flex justify-between">
                <span>💩 Tuvalet:</span>
                <span className="text-amber-800 font-bold">+{summary.poopsAdded} adet</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>⭐ Büyüme:</span>
              <span className="text-green-800 font-bold">+{summary.xpGained} XP</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => { Haptics.mediumTap(); onClose(); }}
          className="w-full bg-lcd-fg text-lcd-bg py-2.5 px-2 text-[10px] uppercase border-2 border-black font-bold active:translate-y-1 shadow-pixel hover:opacity-90"
        >
          DRACO İLE İLGİLEN ❤️
        </button>
      </div>
    </div>
  );
};

const StatsScreen = ({ gameState, onNavigate }: any) => (
    <div className="h-full bg-[#d4b4b4] border-8 border-black p-4 flex flex-col">
        <h2 className="text-center text-xl font-bold mb-4">{gameState.dragon.name}</h2>
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
             <ProceduralIcon type="EGG" size={64} className="mb-4 mix-blend-multiply opacity-50"/> 
             <div className="text-sm font-bold">TÜR: {gameState.dragon.type}</div>
             <div className="text-sm">LVL: {gameState.dragon.evolutionStage}</div>
             <div className="text-sm">XP: {Math.floor(gameState.dragon.xp)}/{gameState.dragon.maxXp}</div>
             <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                 <div>STR: {gameState.dragon.stats.str}</div>
                 <div>INT: {gameState.dragon.stats.int}</div>
                 <div>VIT: {gameState.dragon.stats.vit}</div>
                 <div>AGI: {gameState.dragon.stats.agi}</div>
             </div>
        </div>
        <button onClick={()=>onNavigate(Screen.MAIN)} className="bg-black text-[#d4b4b4] p-3">GERİ</button>
    </div>
);

// --- MAIN APP LOGIC ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>({ 
    ...INITIAL_GAME_STATE, 
    dragon: { ...INITIAL_GAME_STATE.dragon, name: 'DRACO' },
    settings: { muted: false, deviceMode: 'screen', hapticsEnabled: true }
  });
  const [hasSave, setHasSave] = useState(false);
  const [notifications, setNotifications] = useState<FloatingText[]>([]);
  const [npc, setNpc] = useState<NpcState | null>(null);
  const [homeUpgrades, setHomeUpgrades] = useState<HomeUpgrades>({ forest: false, cleanKit: false, weatherStation: false });
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [offlineSummary, setOfflineSummary] = useState<OfflineSummary | null>(null);

  const tickRef = useRef<number | null>(null);
  const lastNotifyTime = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('dragon_save_v2');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        let loadedGameState = p.gameState;
        if (loadedGameState) {
          // Check offline time progression
          const lastSaved = p.lastSavedTime || loadedGameState.lastSavedTime;
          if (lastSaved && typeof lastSaved === 'number') {
            const diffMs = Date.now() - lastSaved;
            const minutesAway = Math.floor(diffMs / 60000);

            // If away for more than 1 minute and not in EGG stage, calculate offline growth & needs
            if (minutesAway >= 1 && loadedGameState.dragon?.stage !== DragonStage.EGG) {
              const clampedMins = Math.min(minutesAway, 1440); // max 24 hours
              const hungerLost = Math.round(clampedMins * 0.08 * 10) / 10;
              const isSleeping = loadedGameState.dragon.isSleeping;
              const energyGained = isSleeping ? Math.min(100, Math.round(clampedMins * 0.6)) : 0;
              const hygieneLost = Math.round(clampedMins * 0.04 * 10) / 10;
              const poopsAdded = Math.min(4, Math.floor(clampedMins / 60));
              const xpGained = Math.round(clampedMins * 0.03 * 10) / 10;

              loadedGameState = {
                ...loadedGameState,
                dragon: {
                  ...loadedGameState.dragon,
                  hunger: Math.max(0, Math.round((loadedGameState.dragon.hunger - hungerLost) * 10) / 10),
                  hygiene: Math.max(0, Math.round((loadedGameState.dragon.hygiene - hygieneLost) * 10) / 10),
                  energy: isSleeping 
                    ? Math.min(100, loadedGameState.dragon.energy + energyGained) 
                    : Math.max(0, loadedGameState.dragon.energy - Math.round(clampedMins * 0.03)),
                  happiness: Math.max(10, Math.round((loadedGameState.dragon.happiness - (hungerLost > 30 ? 20 : 5)) * 10) / 10),
                  poops: Math.min(6, (loadedGameState.dragon.poops || 0) + poopsAdded),
                  xp: loadedGameState.dragon.xp + xpGained,
                  age: Math.round((loadedGameState.dragon.age + (clampedMins * 0.001)) * 100) / 100
                },
                garden: (loadedGameState.garden || []).map((plot: GardenPlot) => {
                  if (plot.seedId && plot.stage < 2) {
                    const addedProgress = Math.min(100, clampedMins * 2);
                    return { ...plot, progress: Math.min(100, plot.progress + addedProgress) };
                  }
                  return plot;
                })
              };

              setOfflineSummary({
                minutesAway,
                hungerLost,
                energyGained,
                poopsAdded,
                xpGained
              });
            }
          }

          setGameState(prev => ({
            ...prev,
            ...loadedGameState,
            dragon: { ...prev.dragon, ...loadedGameState.dragon },
            settings: {
              muted: false,
              deviceMode: 'screen',
              hapticsEnabled: true,
              ...(loadedGameState.settings || {})
            }
          }));
        }
        if(p.upgrades) setHomeUpgrades(p.upgrades);
        if(p.quests) setQuests(p.quests);
        setHasSave(true);
        if(p.gameState?.settings?.muted) { SoundEngine.muted = true; setIsMuted(true); }
      } catch (err) {
        console.error("Save load error", err);
      }
    } else {
      refreshQuests();
    }
    
    if (Notification.permission === 'granted') setPermissionGranted(true);
  }, []);

  const requestNotificationPermission = () => {
      Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
              setPermissionGranted(true);
              new Notification("Bildirimler Açık", { body: "Draco acıktığında haber vereceğiz!" });
          }
      });
  };

  const refreshQuests = () => {
      const newQuests: DailyQuest[] = [];
      const pool = [...QUEST_DEFINITIONS];
      for(let i=0; i<3; i++) {
          const rand = Math.floor(Math.random() * pool.length);
          const def = pool[rand];
          newQuests.push({
              id: `${def.targetType}_${Date.now()}_${i}`,
              text: def.text,
              targetType: def.targetType,
              targetCount: def.targetCount,
              currentCount: 0,
              completed: false,
              rewardClaimed: false,
              rewardGold: def.rewardGold
          });
      }
      setQuests(newQuests);
  };

  const checkQuestCompletion = (type: string, amount = 1) => {
      setQuests(prev => prev.map(q => {
          if(!q.completed && q.targetType === type) {
              const newCount = q.currentCount + amount;
              if(newCount >= q.targetCount) {
                  addNotification("GÖREV TAMAMLANDI!", "#facc15");
                  SoundEngine.playCoin();
                  return { ...q, currentCount: newCount, completed: true };
              }
              return { ...q, currentCount: newCount };
          }
          return q;
      }));
  };

  useEffect(() => {
    if(quests.length > 0 && quests.every(q => q.rewardClaimed)) {
        const timer = setTimeout(() => {
            refreshQuests();
            addNotification("YENİ GÖREVLER!", "#60a5fa");
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [quests]);

  useEffect(() => {
    const npcTimer = window.setInterval(() => {
      if (gameState.screen !== Screen.MAIN) return;
      if (npc) return;
      if (Math.random() < 0.1) { 
        const types: any[] = ['MOUSE', 'OWL', 'JOKER', 'MERCHANT', 'BARD'];
        const t = types[Math.floor(Math.random() * types.length)];
        let msg = '';
        if (t === 'MOUSE') msg = 'Oynayalım mı?';
        else if (t === 'OWL') msg = 'Hava güzel!';
        else if (t === 'JOKER') msg = 'Sürpriz!';
        else if (t === 'MERCHANT') msg = 'Tohum ister misin?';
        else if (t === 'BARD') msg = 'Müzik ruhun gıdasıdır.';
        setNpc({ type: t, message: msg, x: 20 + Math.random() * 60, y: 30 + Math.random() * 40 });
      }
    }, 15000);
    return () => clearInterval(npcTimer);
  }, [gameState.screen, npc]);

  const addNotification = (text: string, color = '#21221d') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, text, x: 40 + Math.random() * 20 - 10, y: 40 + Math.random() * 20 - 10, color }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 1500);
  };

  useEffect(() => {
    if (gameState.screen === Screen.START) return;
    tickRef.current = window.setInterval(() => {
      setGameState((prev) => {
        if (prev.dragon.stage === DragonStage.EGG) return prev;
        
        if (document.hidden && permissionGranted && Date.now() - lastNotifyTime.current > 300000) { 
            if (prev.dragon.hunger < 20) {
                new Notification("Draco Acıktı!", { body: "Ejderhan yemek istiyor!", icon: "/icon.svg" });
                lastNotifyTime.current = Date.now();
            } else if (prev.dragon.energy < 20 && !prev.dragon.isSleeping) {
                new Notification("Draco Yorgun", { body: "Ejderhanın uykuya ihtiyacı var.", icon: "/icon.svg" });
                lastNotifyTime.current = Date.now();
            }
        }

        const isSleeping = prev.dragon.isSleeping;
        const accessory = prev.dragon.equippedAccessory;
        let hungerDecay = isSleeping ? 0.05 : 0.2;
        let hygieneDecay = 0.05;
        if (homeUpgrades.forest) hungerDecay *= 0.9;
        if (homeUpgrades.cleanKit) hygieneDecay *= 0.6;
        const newHunger = Math.max(0, prev.dragon.hunger - hungerDecay);
        let newEnergy = isSleeping ? Math.min(100, prev.dragon.energy + 1.5) : Math.max(0, prev.dragon.energy - 0.1);
        let newHygiene = Math.max(0, prev.dragon.hygiene - hygieneDecay);
        let happinessDecay = 0.1;
        if (newHunger < 20) happinessDecay += 0.2;
        if (newHygiene < 40) happinessDecay += 0.2;
        if (accessory === 'glasses') happinessDecay *= 0.7;
        if (homeUpgrades.forest) happinessDecay *= 0.9;
        const newHappiness = Math.max(0, prev.dragon.happiness - (isSleeping ? 0 : happinessDecay));
        let newWeather = prev.weather;
        if (!homeUpgrades.weatherStation && Math.random() < 0.005) { newWeather = prev.weather === 'SUNNY' ? 'RAIN' : 'SUNNY'; } 
        else if (homeUpgrades.weatherStation) { newWeather = 'SUNNY'; }
        let newPoops = prev.dragon.poops;
        if(!isSleeping && newHunger < 80 && Math.random() < 0.002) { newPoops += 1; }
        
        let newStage = prev.dragon.stage;
        let newType = prev.dragon.type;
        const xp = prev.dragon.xp;
        if(prev.dragon.stage === DragonStage.BABY && xp > 20) { newStage = DragonStage.TEEN; SoundEngine.playEvolve(); }
        else if(prev.dragon.stage === DragonStage.TEEN && xp > 60) {
            newStage = DragonStage.ADULT;
            const { str, int, vit } = prev.dragon.stats;
            if (str >= int && str >= vit) newType = 'FIRE';
            else if (int >= str && int >= vit) newType = 'ICE';
            else newType = 'NATURE';
            SoundEngine.playEvolve();
        }
        else if(prev.dragon.stage === DragonStage.ADULT && xp > 150) { newStage = DragonStage.ELDER; SoundEngine.playEvolve(); }
        
        const newGarden = prev.garden.map(plot => {
            if(plot.seedId && plot.stage < 2) {
                if(Date.now() - plot.lastWatered < 30000) return { ...plot, progress: Math.min(100, plot.progress + 2) };
            }
            return plot;
        });

        return { ...prev, weather: newWeather, garden: newGarden, dragon: { ...prev.dragon, stage: newStage, type: newType, hunger: newHunger, energy: newEnergy, hygiene: newHygiene, happiness: newHappiness, poops: newPoops, age: prev.dragon.age + 0.01 } };
      });
      setGameState(curr => { if(curr.dragon.happiness >= 80) checkQuestCompletion('HAPPY_80'); return curr; });
    }, 1000);
    const saveCurrentState = () => {
      localStorage.setItem('dragon_save_v2', JSON.stringify({ 
        gameState: { ...gameState, lastSavedTime: Date.now() }, 
        upgrades: homeUpgrades, 
        quests,
        lastSavedTime: Date.now()
      }));
    };

    const saveInterval = window.setInterval(saveCurrentState, 15000);
    const handleVisibility = () => { if (document.hidden) saveCurrentState(); };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', saveCurrentState);

    return () => { 
      if(tickRef.current) clearInterval(tickRef.current); 
      clearInterval(saveInterval); 
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', saveCurrentState);
    };
  }, [gameState, homeUpgrades, quests, permissionGranted]);

  const handleAction = (action: any) => {
    const type = typeof action === 'string' ? action : action.type;
    SoundEngine.playCoin();
    if (type === 'GARDEN_INTERACT') {
        checkQuestCompletion('GARDEN_WATER');
        setGameState(prev => {
            const plot = prev.garden.find(p => p.id === action.plotId);
            if(!plot) return prev;
            let newInv = { ...prev.inventory };
            let newGarden = [...prev.garden];
            let msg = '';
            let newCurrency = prev.currency;
            if(!plot.isUnlocked) {
                if(prev.currency >= 100) { newCurrency -= 100; newGarden = newGarden.map(p => p.id === plot.id ? {...p, isUnlocked: true} : p); msg = 'KİLİT AÇILDI'; } else msg = '100G GEREKLİ';
            } else if (!plot.seedId) {
                const seed = ITEMS.find(i => i.type === 'SEED' && newInv[i.id] > 0);
                if(seed) { newInv[seed.id]--; newGarden = newGarden.map(p => p.id === plot.id ? {...p, seedId: seed.id, stage: 0, progress: 0, lastWatered: Date.now()} : p); msg = 'EKİLDİ'; } else msg = 'TOHUM YOK';
            } else if (plot.progress >= 100) {
                newInv['apple'] = (newInv['apple'] || 0) + 1; newGarden = newGarden.map(p => p.id === plot.id ? {...p, seedId: null, stage: 0, progress: 0} : p); msg = '+1 ELMA'; SoundEngine.playEat();
            } else {
                newGarden = newGarden.map(p => p.id === plot.id ? {...p, lastWatered: Date.now()} : p); msg = 'SULANDI';
            }
            addNotification(msg, '#facc15');
            return { ...prev, inventory: newInv, garden: newGarden, currency: newCurrency };
        });
        return;
    }
    setGameState((prev) => {
      const d = { ...prev.dragon };
      let inv = { ...prev.inventory };
      let currency = prev.currency;
      if (type === 'USE_ITEM') {
        const item = action.item as Item;
        if (inv[item.id] > 0) {
          if(item.type !== 'TOY') { inv[item.id]--; }
          if(item.type === 'FOOD') { 
              d.hunger = Math.min(100, d.hunger + (item.effect.hunger || 0)); d.health = Math.min(100, d.health + (item.effect.health || 0)); SoundEngine.playEat(); addNotification('YEDİ', '#16a34a'); 
              checkQuestCompletion('FEED');
          }
          d.happiness = Math.min(100, d.happiness + (item.effect.happiness || 0));
          d.energy = Math.min(100, d.energy + (item.effect.energy || 0));
        }
      } else if (type === 'CLEAN') {
        d.hygiene = 100;
        if (d.poops > 0) {
          if (Math.random() < 0.2) { currency += 50; addNotification('ALTIN BULDUN!', '#facc15'); SoundEngine.playCoin(); } else { addNotification('TERTEMİZ!', '#0ea5e9'); }
          checkQuestCompletion('WASH');
        } else { addNotification('ZATEN TEMİZ', '#0ea5e9'); }
        d.poops = 0;
      } else if (type === 'SLEEP') {
        d.isSleeping = !d.isSleeping;
        if(d.isSleeping) checkQuestCompletion('SLEEP');
      } else if (type === 'EQUIP') {
        const item = action.item as Item;
        if (d.equippedAccessory === item.id) { d.equippedAccessory = null; addNotification('ÇIKARDI', '#9ca3af'); } 
        else { d.equippedAccessory = item.id; d.happiness = Math.min(100, d.happiness + 5); addNotification('TAKTI', '#6366f1'); }
      }
      return { ...prev, dragon: d, inventory: inv, currency };
    });
  };

  const handleMiniGameComplete = (result: 'WIN' | 'LOSE' | 'DRAW', game: MiniGameType) => {
    setGameState((prev) => {
      let bonusGold = 0; let mood = 0; let energyCost = 10; let xpGain = 10;
      if (result === 'WIN') { bonusGold = 50; mood = 20; xpGain = 20; SoundEngine.playCoin(); checkQuestCompletion('WIN_MINIGAME'); } 
      else if (result === 'DRAW') { bonusGold = 20; mood = 10; xpGain = 10; } 
      else { bonusGold = 5; mood = 5; xpGain = 5; }
      const newHappiness = Math.min(100, prev.dragon.happiness + mood);
      if (newHappiness >= 80) checkQuestCompletion('HAPPY_80');
      return { ...prev, currency: prev.currency + bonusGold, dragon: { ...prev.dragon, happiness: newHappiness, energy: Math.max(0, prev.dragon.energy - energyCost), xp: prev.dragon.xp + xpGain } };
    });
    if (result === 'WIN') addNotification('KAZANDIN!', '#16a34a'); else if (result === 'DRAW') addNotification('BERABERE', '#eab308'); else addNotification('KAYBETTİN...', '#dc2626');
  };

  const handleNpcClick = () => {
      if(!npc) return;
      SoundEngine.playCoin();
      if(npc.type === 'MOUSE') { setGameState(prev => ({ ...prev, currency: prev.currency + 100 })); addNotification("+100 ALTIN", "#facc15"); }
      else if(npc.type === 'OWL') { setGameState(prev => ({ ...prev, dragon: { ...prev.dragon, xp: prev.dragon.xp + 50 } })); addNotification("+50 XP", "#6366f1"); }
      else if(npc.type === 'JOKER') { setGameState(prev => ({ ...prev, dragon: { ...prev.dragon, happiness: 100, energy: Math.max(0, prev.dragon.energy - 20) } })); addNotification("ŞAKA YAPTI!", "#ec4899"); }
      else if(npc.type === 'MERCHANT') { 
          const seed = Math.random() > 0.5 ? 'seed_apple' : 'seed_salad';
          setGameState(prev => ({ ...prev, inventory: { ...prev.inventory, [seed]: (prev.inventory[seed]||0)+1 } })); 
          addNotification("TOHUM HEDİYE!", "#10b981");
      }
      else if(npc.type === 'BARD') {
          setGameState(prev => ({ ...prev, dragon: { ...prev.dragon, energy: 100, happiness: 100 } }));
          addNotification("MÜZİK ŞİFASI!", "#f472b6");
      }
      setNpc(null);
  };

  const handleClaimQuest = (id: string) => {
      const q = quests.find(qu => qu.id === id);
      if(q) {
          setQuests(prev => prev.map(q => q.id === id ? { ...q, rewardClaimed: true } : q));
          setGameState(prev => ({ ...prev, currency: prev.currency + q.rewardGold }));
          SoundEngine.playCoin();
          addNotification(`ÖDÜL +${q.rewardGold}G`, "#facc15");
      }
  };

  const handleBuyUpgrade = (type: keyof HomeUpgrades, cost: number) => {
      if(gameState.currency >= cost) { SoundEngine.playCoin(); setGameState(prev => ({ ...prev, currency: prev.currency - cost })); setHomeUpgrades(prev => ({ ...prev, [type]: true })); addNotification("EV GELİŞTİRİLDİ!", "#16a34a"); } else { addNotification("PARA YETERSİZ", "#dc2626"); }
  };

  const toggleDeviceMode = () => {
    Haptics.tap();
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        deviceMode: prev.settings?.deviceMode === 'shell' ? 'screen' : 'shell'
      }
    }));
  };

  const handlePet = () => {
    setGameState(p => ({ ...p, dragon: { ...p.dragon, happiness: Math.min(100, p.dragon.happiness + 5) } }));
    addNotification('❤️', '#f472b6');
    SoundEngine.playEat();
    Haptics.purr();
    checkQuestCompletion('PET');
  };

  const handleShellButtonA = () => {
    if (gameState.screen !== Screen.MAIN) {
      setGameState(p => ({ ...p, screen: Screen.MAIN }));
    } else {
      window.dispatchEvent(new CustomEvent('tamagotchi-action', { detail: 'TOGGLE_INVENTORY' }));
    }
  };

  const handleShellButtonB = () => {
    if (gameState.screen === Screen.START) {
      setGameState(prev => ({ ...prev, screen: Screen.HATCH }));
    } else if (gameState.screen !== Screen.MAIN) {
      setGameState(p => ({ ...p, screen: Screen.MAIN }));
    } else {
      handlePet();
    }
  };

  const handleShellButtonC = () => {
    if (gameState.screen !== Screen.MAIN) {
      setGameState(p => ({ ...p, screen: Screen.MAIN }));
    } else {
      handleAction({ type: 'CLEAN' });
    }
  };

  const renderActiveScreen = () => {
    if (gameState.screen === Screen.START) return <StartScreen onStart={() => setGameState(prev => ({ ...prev, screen: Screen.HATCH }))} onContinue={() => { 
        const s = localStorage.getItem('dragon_save_v2'); 
        if(s) { 
            const p = JSON.parse(s); 
            const targetScreen = p.gameState?.dragon?.stage === DragonStage.EGG ? Screen.HATCH : Screen.MAIN;
            setGameState({ ...p.gameState, screen: targetScreen }); 
            setHomeUpgrades(p.upgrades || {}); 
            setQuests(p.quests || []); 
            if(p.gameState?.settings?.muted) { SoundEngine.muted = true; setIsMuted(true); } 
        } 
    }} hasSave={hasSave} />;
    
    if (gameState.dragon.stage === DragonStage.EGG) return <HatchingScreen onHatchTick={() => setTimeout(() => { Haptics.evolve(); setGameState(prev => ({ ...prev, dragon: { ...prev.dragon, stage: DragonStage.BABY } })); }, 500)} />;
    if (gameState.screen === Screen.MARKET) return <MarketScreen gameState={gameState} upgrades={homeUpgrades} onBuy={(i:Item) => { if(gameState.currency>=i.price){ setGameState(p=>({...p,currency:p.currency-i.price,inventory:{...p.inventory,[i.id]:(p.inventory[i.id]||0)+1}})); addNotification("ALINDI","#facc15"); SoundEngine.playCoin();}}} onBuyUpgrade={handleBuyUpgrade} onNavigate={(s:Screen) => setGameState(p=>({...p,screen:s}))} />;
    if (gameState.screen === Screen.STATS) return <StatsScreen gameState={gameState} onNavigate={(s:Screen) => setGameState(p=>({...p,screen:s}))} />;
    if (gameState.screen === Screen.GARDEN) return <GardenScreen gameState={gameState} onNavigate={(s:Screen) => setGameState(p=>({...p,screen:s}))} onAction={handleAction} />;
    if (gameState.screen === Screen.ARENA) return <ArenaScreen gameState={gameState} onNavigate={(s:Screen) => setGameState(p=>({...p,screen:s}))} onCompleteBattle={(win:boolean) => { setGameState(p=>({...p,screen:Screen.MAIN, currency: p.currency + (win?50:10)})); addNotification(win?"ZAFER! +50G":"YENİLGİ +10G", win?"#facc15":"#ef4444"); if(win) checkQuestCompletion('BATTLE_PLAY'); }} />;

    return <MainGameScreen gameState={gameState} isMuted={isMuted} onToggleMute={() => { SoundEngine.muted = !SoundEngine.muted; setIsMuted(!isMuted); }} onRequestPerm={requestNotificationPermission} permissionGranted={permissionGranted} upgrades={homeUpgrades} npc={npc} onNpcClick={handleNpcClick} onAction={handleAction} onNavigate={(s:Screen) => setGameState(p=>({...p,screen:s}))} onPet={handlePet} notifications={notifications} onMiniGameComplete={handleMiniGameComplete} quests={quests} onClaimQuest={handleClaimQuest} addNotification={addNotification} />;
  };

  return (
    <TamagotchiShell
      deviceMode={gameState.settings?.deviceMode || 'screen'}
      onToggleDeviceMode={toggleDeviceMode}
      onButtonA={handleShellButtonA}
      onButtonB={handleShellButtonB}
      onButtonC={handleShellButtonC}
      buttonALabel={gameState.screen !== Screen.MAIN ? "GERİ" : "ÇANTA"}
      buttonBLabel={gameState.screen !== Screen.MAIN ? "ONAY" : "SEV"}
      buttonCLabel={gameState.screen !== Screen.MAIN ? "ÇIK" : "TEMİZLE"}
    >
      {renderActiveScreen()}
      {offlineSummary && (
        <OfflineSummaryModal summary={offlineSummary} onClose={() => setOfflineSummary(null)} />
      )}
    </TamagotchiShell>
  );
}

const MainGameScreen = ({ gameState, onAction, onNavigate, onPet, notifications, onMiniGameComplete, upgrades, npc, onNpcClick, quests, onClaimQuest, addNotification, isMuted, onToggleMute, onRequestPerm, permissionGranted }: any) => {
  const { dragon, weather } = gameState;
  const [showInventory, setShowInventory] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  
  const [dracoPos, setDracoPos] = useState({ x: 50, y: 50 });
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [activeToy, setActiveToy] = useState<{ id: string, x: number, y: number } | null>(null);
  
  const petDistanceRef = useRef(0);

  // Listen for Tamagotchi Shell physical buttons
  useEffect(() => {
    const handleShellEvent = (e: any) => {
      if (e.detail === 'TOGGLE_INVENTORY') {
        setShowInventory(prev => !prev);
      }
    };
    window.addEventListener('tamagotchi-action', handleShellEvent);
    return () => window.removeEventListener('tamagotchi-action', handleShellEvent);
  }, []);

  useEffect(() => {
      let animFrame: number;
      const updatePosition = () => {
          setDracoPos(prev => {
              const dx = targetPos.x - prev.x;
              const dy = targetPos.y - prev.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if(dist < 0.5) return prev;
              const speed = 0.5 + (dragon.energy > 50 ? 0.2 : 0);
              const moveX = (dx / dist) * speed;
              const moveY = (dy / dist) * speed;
              return { x: prev.x + moveX, y: prev.y + moveY };
          });
          if(activeToy) {
              const dist = Math.sqrt(Math.pow(activeToy.x - dracoPos.x, 2) + Math.pow(activeToy.y - dracoPos.y, 2));
              if(dist < 5) { setActiveToy(null); onPet(); SoundEngine.playCoin(); if (activeToy.id === 'flame_show') addNotification("HARİKA ŞOV!", "#f97316"); }
          }
          animFrame = requestAnimationFrame(updatePosition);
      };
      animFrame = requestAnimationFrame(updatePosition); return () => cancelAnimationFrame(animFrame);
  }, [targetPos, activeToy, dragon.energy]);

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      if (activeToy) { setActiveToy({ ...activeToy, x, y }); setTargetPos({ x, y }); } else { setTargetPos({ x, y }); }
  };

  const handlePointerPet = (e: React.PointerEvent) => {
    if (e.buttons > 0 || e.pointerType === 'touch') {
      petDistanceRef.current += Math.hypot(e.movementX || 0, e.movementY || 0);
      if (petDistanceRef.current > 35) {
        petDistanceRef.current = 0;
        onPet();
      }
    }
  };

  const activateToy = (toyId: string) => { setActiveToy({ id: toyId, x: 50 + (Math.random()*20-10), y: 50 }); setTargetPos({ x: 50 + (Math.random()*20-10), y: 50 }); setShowInventory(false); setShowMiniGame(false); };
  const getToyImage = (id: string) => { const item = ITEMS.find(i => i.id === id); return item ? item.image : 'BALL'; };
  const dx = targetPos.x - dracoPos.x;
  const dy = targetPos.y - dracoPos.y;
  const isMoving = Math.sqrt(dx*dx + dy*dy) > 0.5;

  return (
    <LcdScreen className="flex flex-col relative" isNight={dragon.isSleeping} upgrades={upgrades} onClick={handleScreenClick}>
      <Clouds />
      <WeatherOverlay weather={weather} />
      <FloatingTextOverlay items={notifications} />
      {npc && <button onClick={(e) => { e.stopPropagation(); onNpcClick(); }} className="absolute z-20 animate-bounce" style={{ left: `${npc.x}%`, top: `${npc.y}%`, transform: 'translate(-50%, -50%)' }}><ProceduralIcon type={npc.type} size={48} /><span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-white text-black px-1 rounded whitespace-nowrap shadow-pixel">{npc.message}</span></button>}
      {activeToy && <div className="absolute z-10 transition-all duration-300 ease-out" style={{ left: `${activeToy.x}%`, top: `${activeToy.y}%`, transform: 'translate(-50%, -50%)' }}><ProceduralIcon type={getToyImage(activeToy.id)} size={activeToy.id === 'flame_show' ? 48 : 24} className={activeToy.id === 'flame_show' ? 'animate-pulse' : 'animate-spin'} /></div>}
      <div className="absolute top-2 right-2 z-50 flex gap-2">
          {!permissionGranted && <button onClick={(e)=>{e.stopPropagation(); onRequestPerm();}} className="p-1.5 rounded bg-blue-500 text-white border border-white/20 active:scale-95"><span className="material-symbols-outlined text-sm">notifications</span></button>}
          <button onClick={(e) => { e.stopPropagation(); onToggleMute(); }} className={`p-1.5 rounded bg-black/50 text-white border border-white/20 hover:bg-black/70 active:scale-95 ${isMuted ? 'text-red-400' : 'text-green-400'}`}><span className="material-symbols-outlined text-sm">{isMuted ? 'volume_off' : 'volume_up'}</span></button>
      </div>
      <div className="flex justify-between items-start mb-4 relative z-30 pointer-events-none"><div className="flex flex-col gap-2 w-1/2"><StatBar icon="nutrition" value={dragon.hunger} /><StatBar icon="favorite" value={dragon.happiness} /></div><div className="flex flex-col gap-2 w-1/2 items-end"><StatBar icon="cleaning_services" value={dragon.hygiene} reverse /><StatBar icon="bolt" value={dragon.energy} reverse /></div></div>
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {Array.from({length: dragon.poops}).map((_, i) => <div key={i} className="absolute text-xl" style={{ bottom: '20%', left: `${20 + i*15}%` }}>💩</div>)}
        <div className="absolute transition-transform duration-75" style={{ left: `${dracoPos.x}%`, top: `${dracoPos.y}%`, width: '160px', height: '160px', transform: `translate(-50%, -50%)` }}>
          <div 
            onClick={(e) => { e.stopPropagation(); onPet(); }} 
            onPointerMove={handlePointerPet}
            className="w-full h-full cursor-pointer pointer-events-auto touch-none"
            title="Draco'yu parmağınla okşa!"
          >
            <ProceduralDragon stage={dragon.stage} type={dragon.type} mode={dragon.isSleeping ? 'sleepy' : 'idle'} accessory={dragon.equippedAccessory} direction={targetPos.x < dracoPos.x ? -1 : 1} isMoving={isMoving} />
          </div>
          {dragon.isSleeping ? (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2 py-0.5 rounded text-[9px] whitespace-nowrap shadow-pixel animate-pulse">
              💤 Zzz...
            </div>
          ) : dragon.hunger < 25 ? (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-2 py-0.5 rounded text-[8px] whitespace-nowrap shadow-pixel animate-bounce">
              🍖 Acıktım!
            </div>
          ) : dragon.hygiene < 30 ? (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-white px-2 py-0.5 rounded text-[8px] whitespace-nowrap shadow-pixel">
              🧼 Yıkanalım!
            </div>
          ) : dragon.happiness > 85 ? (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pink-600/90 text-white px-2 py-0.5 rounded text-[8px] whitespace-nowrap shadow-pixel">
              ❤️ Seni Seviyorum!
            </div>
          ) : null}
        </div>
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-2 z-40 pointer-events-auto">
          <div className="flex justify-between items-center bg-black/20 p-1 rounded backdrop-blur-sm">
            <div className="flex gap-2">
              <button onClick={(e) => {e.stopPropagation(); Haptics.tap(); onNavigate(Screen.STATS);}} className="hover:bg-black/10 p-1 rounded active:scale-95"><span className="material-symbols-outlined">bar_chart</span></button>
              <button onClick={(e) => {e.stopPropagation(); Haptics.tap(); onNavigate(Screen.MARKET);}} className="hover:bg-black/10 p-1 rounded active:scale-95"><span className="material-symbols-outlined">storefront</span></button>
              <button onClick={(e) => {e.stopPropagation(); Haptics.tap(); onNavigate(Screen.GARDEN);}} className="hover:bg-black/10 p-1 rounded text-green-300 active:scale-95"><span className="material-symbols-outlined">potted_plant</span></button>
              <button onClick={(e) => {e.stopPropagation(); Haptics.tap(); onNavigate(Screen.ARENA);}} className="hover:bg-black/10 p-1 rounded text-red-300 active:scale-95"><span className="material-symbols-outlined">swords</span></button>
              <button onClick={(e) => {e.stopPropagation(); Haptics.tap(); setShowQuests(true);}} className="hover:bg-black/10 p-1 rounded relative active:scale-95"><span className="material-symbols-outlined">assignment</span>{quests.some((q:any) => q.completed && !q.rewardClaimed) && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"/>}</button>
            </div>
            {activeToy && <div className="text-xs animate-pulse text-yellow-500 bg-black/50 px-2 rounded">OYUN MODU (Tıkla!)</div>}
          </div>
        <div className="grid grid-cols-4 gap-2">
          <button onClick={(e) => { e.stopPropagation(); Haptics.tap(); setShowInventory(true); }} className="flex flex-col items-center p-2 border-2 border-lcd-fg bg-lcd-bg shadow-pixel active:translate-y-1"><span className="material-symbols-outlined">backpack</span></button>
          <button onClick={(e) => { e.stopPropagation(); Haptics.tap(); setShowMiniGame(true); }} className="flex flex-col items-center p-2 border-2 border-lcd-fg bg-lcd-bg shadow-pixel active:translate-y-1"><span className="material-symbols-outlined">sports_esports</span></button>
          <button onClick={(e) => { e.stopPropagation(); Haptics.mediumTap(); onAction({ type: 'CLEAN' }); }} className="flex flex-col items-center p-2 border-2 border-lcd-fg bg-lcd-bg shadow-pixel active:translate-y-1"><span className="material-symbols-outlined">soap</span></button>
          <button onClick={(e) => { e.stopPropagation(); Haptics.tap(); onAction({ type: 'SLEEP' }); }} className="flex flex-col items-center p-2 border-2 border-lcd-fg bg-lcd-bg shadow-pixel active:translate-y-1"><span className="material-symbols-outlined">bedtime</span></button>
        </div>
      </div>
      {showInventory && <InventoryModal inventory={gameState.inventory} onClose={() => setShowInventory(false)} onSelect={(i: Item) => { if(i.type === 'TOY') { activateToy(i.id); } else { setShowInventory(false); onAction({ type: 'USE_ITEM', item: i }); if(i.type==='ACCESSORY') onAction({type:'EQUIP', item:i}); } }} />}
      {showMiniGame && <MiniGameModal onClose={() => setShowMiniGame(false)} onPlayToy={() => activateToy('ball')} onComplete={(res: 'WIN'|'LOSE'|'DRAW', game: MiniGameType) => { onMiniGameComplete(res, game); setShowMiniGame(false); }} />}
      {showQuests && <QuestModal quests={quests} onClaim={onClaimQuest} onClose={() => setShowQuests(false)} />}
    </LcdScreen>
  );
};