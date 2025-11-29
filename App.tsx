
// src/App.tsx

import React, { useState, useEffect, useRef } from 'react';
import { GameState, Screen, DragonStage, Item, WeatherType } from './types';
import { ITEMS, INITIAL_GAME_STATE } from './constants';

// --- Types ---
interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

type MiniGameType =
  | 'NONE'
  | 'RPS'
  | 'MATH'
  | 'CATCH'
  | 'TAP'
  | 'FLAME_SHOW'
  | 'TARGET'
  | 'MEMORY';

type NpcType = 'MOUSE' | 'OWL' | 'JOKER';

interface NpcState {
  type: NpcType;
  message: string;
  x: number; // Yüzde konumu
  y: number;
}

interface HomeUpgrades {
  forest: boolean;
  cleanKit: boolean;
  weatherStation: boolean;
}

type DailyQuestId = 'WASH_ONCE' | 'WIN_MINIGAME' | 'HAPPY_80';

interface DailyQuest {
  id: DailyQuestId;
  text: string;
  completed: boolean;
  rewardClaimed: boolean;
}

// --- Pixel Art Data ---
const PIXEL_ART: Record<string, { grid: number[][]; palette: string[] }> = {
  EGG: {
    grid: [
      [0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 1, 2, 2, 2, 1, 0],
      [0, 1, 2, 2, 3, 2, 2, 1],
      [0, 1, 2, 3, 2, 3, 2, 1],
      [0, 1, 2, 2, 2, 2, 2, 1],
      [0, 1, 2, 2, 2, 2, 2, 1],
      [0, 0, 1, 2, 2, 2, 1, 0],
      [0, 0, 0, 1, 1, 1, 0, 0],
    ],
    palette: ['transparent', '#b91c1c', '#fecaca', '#f87171'],
  },
  APPLE: {
    grid: [
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 2, 2, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 3, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    palette: ['transparent', '#ef4444', '#166534', '#fca5a5'],
  },
  FISH: {
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 2, 2, 2, 1, 0],
      [1, 2, 2, 2, 2, 3, 1, 1],
      [0, 1, 1, 2, 2, 2, 1, 0],
      [0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    palette: ['transparent', '#1e3a8a', '#60a5fa', '#000000'],
  },
  STEAK: {
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0],
      [0, 1, 2, 2, 2, 1, 0, 0],
      [0, 1, 3, 2, 2, 2, 1, 0],
      [0, 1, 2, 3, 2, 2, 1, 0],
      [0, 0, 1, 1, 1, 1, 2, 1],
      [0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    palette: ['transparent', '#7f1d1d', '#b91c1c', '#fecaca'],
  },
  SALAD: {
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 0],
      [0, 1, 2, 1, 2, 1, 2, 1],
      [0, 1, 1, 2, 1, 2, 1, 1],
      [0, 0, 3, 3, 3, 3, 3, 0],
      [0, 0, 3, 3, 3, 3, 3, 0],
      [0, 0, 0, 3, 3, 3, 0, 0],
    ],
    palette: ['transparent', '#166534', '#4ade80', '#92400e'],
  },
  BALL: {
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 1, 2, 3, 3, 2, 1, 0],
      [1, 2, 3, 3, 3, 3, 2, 1],
      [1, 2, 3, 3, 3, 3, 2, 1],
      [0, 1, 2, 3, 3, 2, 1, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
    palette: ['transparent', '#7f1d1d', '#ef4444', '#f87171'],
  },
  PLUSH: {
    grid: [
      [0, 1, 0, 0, 0, 0, 1, 0],
      [1, 2, 1, 0, 0, 1, 2, 1],
      [1, 2, 2, 1, 1, 2, 2, 1],
      [0, 1, 2, 2, 2, 2, 1, 0],
      [0, 1, 2, 3, 3, 2, 1, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 1, 2, 1, 1, 2, 1, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
    ],
    palette: ['transparent', '#78350f', '#b45309', '#000000'],
  },
  CIRCUS_RING: {
    grid: [
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 1, 3, 0, 0, 3, 1, 0],
      [1, 2, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 2, 1],
      [0, 1, 3, 0, 0, 3, 1, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
    ],
    palette: ['transparent', '#b91c1c', '#f97316', '#facc15'],
  },
  HAT: {
    grid: [
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    palette: ['transparent', '#4338ca', '#facc15'],
  },
  GLASSES: {
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [1, 2, 1, 1, 1, 1, 2, 1],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    palette: ['transparent', '#000000', '#3b82f6'],
  },
  POTION: {
    grid: [
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 3, 1, 0, 0, 0],
      [0, 1, 3, 3, 3, 1, 0, 0],
      [0, 1, 3, 3, 3, 1, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0],
    ],
    palette: ['transparent', '#eab308', '#a16207', '#ec4899'],
  },
  STAR: {
    grid: [
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 2, 1, 0, 0],
      [0, 1, 1, 1, 2, 1, 1, 1],
      [0, 0, 1, 1, 2, 1, 1, 0],
      [0, 0, 0, 1, 2, 1, 0, 0],
      [0, 0, 1, 0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    palette: ['transparent', '#eab308', '#fef08a'],
  },
  MOUSE: {
    grid: [
        [0,2,0,0,0,0,2,0],
        [2,1,2,0,0,2,1,2],
        [2,1,1,2,2,1,1,2],
        [0,2,1,1,1,1,2,0],
        [0,0,1,3,3,1,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,0,0,1,1,0],
        [1,1,0,0,0,0,1,1],
    ],
    palette: ['transparent', '#9ca3af', '#4b5563', '#000']
  },
  OWL: {
    grid: [
        [0,1,0,0,0,0,1,0],
        [1,2,1,1,1,1,2,1],
        [1,2,3,2,2,3,2,1],
        [1,1,1,3,3,1,1,1],
        [0,1,2,2,2,2,1,0],
        [0,1,2,1,1,2,1,0],
        [0,0,3,0,0,3,0,0],
        [0,0,0,0,0,0,0,0],
    ],
    palette: ['transparent', '#78350f', '#92400e', '#fef3c7']
  },
  JOKER: {
    grid: [
        [0,1,0,1,0,1,0,1],
        [1,2,1,2,1,2,1,2],
        [0,1,3,3,3,3,1,0],
        [0,1,3,4,3,4,1,0],
        [0,1,3,3,5,3,1,0],
        [0,0,1,3,3,1,0,0],
        [0,1,1,2,2,1,1,0],
        [0,0,0,0,0,0,0,0],
    ],
    palette: ['transparent', '#db2777', '#facc15', '#ffffff', '#000', '#ef4444']
  }
};

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

// --- Procedural Dragon Logic ---
const BASE_DRAGON = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 3, 3, 1, 1, 1, 3, 3, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 3, 3, 1, 1, 1, 3, 3, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 2, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 4, 4, 4, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 4, 4, 4, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
function getDragonColors(val: number, mode: string, age: string, t: number = 0) {
    let body = '#ef4444', shadow = '#991b1b', eye = '#fbbf24', belly = '#fee2e2';
    if(age === 'baby') { body = '#f87171'; shadow = '#b91c1c'; }
    if(mode === 'rainbow') { const h = (t*100)%360; body = `hsl(${h}, 80%, 60%)`; }
    if(val===3) return eye; if(val===4) return belly; if(val===1) return body; if(val===2) return shadow;
    return null;
}
const ProceduralDragon = ({ stage, mode, accessory, className = '', animate = true, direction = 1 }: any) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);
    
    // Yön çevirme stili
    const flipStyle = direction === -1 ? { transform: 'scaleX(-1)' } : {};

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const baseSize = 16, scale = 4, logicalSize = baseSize * scale;
        canvas.width = logicalSize; canvas.height = logicalSize;
        const render = (ts: number) => {
            if(!animate) { ctx.clearRect(0,0,canvas.width,canvas.height); }
            const t = ts/1000;
            const offsetY = Math.sin(t*2)*0.5;
            ctx.clearRect(0,0,canvas.width,canvas.height);
            for(let by=0; by<16; by++) {
                for(let bx=0; bx<16; bx++) {
                    const val = BASE_DRAGON[by][bx];
                    if(val===0) continue;
                    const c = getDragonColors(val, mode, stage, t);
                    if(!c) continue;
                    for(let sy=0; sy<scale; sy++) for(let sx=0; sx<scale; sx++) {
                        ctx.fillStyle = c; ctx.fillRect(bx*scale+sx, by*scale+sy+offsetY, 1, 1);
                    }
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
    }, [stage, mode, animate, accessory]);
    return <canvas ref={canvasRef} className={`image-rendering-pixelated w-full h-full object-contain ${className}`} style={flipStyle} />;
};

// --- Components ---
const PixelButton = ({ children, onClick, className = '', disabled = false, variant = 'default' }: any) => {
    let s = 'bg-gray-200 border-4 border-gray-800 text-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100';
    if(variant === 'primary') s = 'bg-[#ef4444] border-4 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:brightness-110';
    return <button onClick={onClick} disabled={disabled} className={`relative font-pixel text-xs uppercase py-3 px-4 active:translate-y-1 ${s} ${className}`}>{children}</button>;
};

const LcdScreen = ({ children, className = '', isNight = false, onClick, upgrades }: any) => (
  <div className={`w-full h-full text-lcd-fg overflow-hidden relative font-pixel shadow-screen-inner transition-colors duration-1000 ${upgrades?.forest ? 'bg-[#3b5c3a]' : 'bg-lcd-bg'}`} onClick={onClick}>
    <div className="absolute inset-0 pointer-events-none opacity-20 z-10 mix-blend-multiply" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0, 0.5) 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
    <div className={`absolute inset-0 bg-[#0f172a] mix-blend-multiply pointer-events-none z-20 transition-opacity duration-1000 ${isNight ? 'opacity-90' : 'opacity-0'}`} />
    <div className={`relative z-0 h-full p-4 ${className}`}>{children}</div>
  </div>
);

const QuestModal = ({ quests, onClaim, onClose }: { quests: DailyQuest[], onClaim: (id: DailyQuestId) => void, onClose: () => void }) => (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-lcd-bg border-4 border-lcd-fg p-3 w-full max-w-[280px] shadow-pixel">
            <div className="flex justify-between items-center mb-2 border-b-2 border-lcd-fg pb-1">
                <h3 className="text-sm font-pixel">GÜNLÜK GÖREVLER</h3>
                <button onClick={onClose}>X</button>
            </div>
            <div className="space-y-2">
                {quests.map(q => (
                    <div key={q.id} className="border-2 border-black/20 p-2 flex justify-between items-center bg-white/10">
                        <div className="text-[10px]">
                            <div className={q.completed ? 'line-through opacity-50' : ''}>{q.text}</div>
                            <div className="text-[9px] text-green-700">{q.rewardClaimed ? 'Tamamlandı' : q.completed ? 'Ödül Hazır!' : 'Devam Ediyor'}</div>
                        </div>
                        <button disabled={!q.completed || q.rewardClaimed} onClick={() => onClaim(q.id)} className="text-[9px] border-2 border-black px-1 py-1 bg-yellow-400 disabled:opacity-30 disabled:bg-gray-400">
                             {q.rewardClaimed ? 'ALINDI' : 'AL (100G)'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- Game Logic Components ---

// 1. Rock Paper Scissors
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
        else if(
            (choice === 'TAŞ' && pc === 'MAKAS') ||
            (choice === 'KAĞIT' && pc === 'TAŞ') ||
            (choice === 'MAKAS' && pc === 'KAĞIT')
        ) res = 'WIN';
        
        setResult(res);
        setStatus('RESULT');
        
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
                    <div className={`text-2xl font-bold ${result==='WIN'?'text-green-400':result==='LOSE'?'text-red-400':'text-yellow-400'}`}>
                        {result === 'WIN' ? 'KAZANDIN!' : result === 'LOSE' ? 'KAYBETTİN' : 'BERABERE'}
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. Math Game
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
    
    const check = (val: number) => {
        if(question && val === question.a) onComplete('WIN', 'MATH');
        else onComplete('LOSE', 'MATH');
    };
    
    if(!question) return <div>Yükleniyor...</div>;
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-2xl font-bold">{question.q}</div>
            <div className="grid grid-cols-3 gap-2">
                {options.map((o,i) => (
                    <button key={i} onClick={()=>check(o)} className="border-2 border-white p-3 text-xl hover:bg-white/20">{o}</button>
                ))}
            </div>
        </div>
    );
};

// 3. Memory Game
const MemoryGame = ({ onComplete }: any) => {
    const [cards, setCards] = useState<{id:number, icon:string, flipped:boolean, matched:boolean}[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    
    useEffect(() => {
        const icons = ['APPLE', 'BALL', 'HAT', 'STAR'];
        const deck = [...icons, ...icons]
            .sort(() => Math.random() - 0.5)
            .map((icon, id) => ({ id, icon, flipped: false, matched: false }));
        setCards(deck);
    }, []);
    
    const handleCardClick = (id: number) => {
        if(flipped.length >= 2) return;
        const cardIndex = cards.findIndex(c=>c.id===id);
        if(cards[cardIndex].matched || cards[cardIndex].flipped) return;
        
        const newCards = [...cards];
        newCards[cardIndex].flipped = true;
        setCards(newCards);
        
        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);
        
        if(newFlipped.length === 2) {
            const c1 = newCards.find(c=>c.id===newFlipped[0]);
            const c2 = newCards.find(c=>c.id===newFlipped[1]);
            
            if(c1 && c2 && c1.icon === c2.icon) {
                // Match
                setTimeout(() => {
                    setCards(curr => {
                        const next = curr.map(c => (c.id === c1.id || c.id === c2.id) ? {...c, matched: true} : c);
                        if(next.every(c=>c.matched)) setTimeout(()=>onComplete('WIN', 'MEMORY'), 500);
                        return next;
                    });
                    setFlipped([]);
                }, 500);
            } else {
                // No Match
                setTimeout(() => {
                    setCards(curr => curr.map(c => (c.id === newFlipped[0] || c.id === newFlipped[1]) ? {...c, flipped: false} : c));
                    setFlipped([]);
                }, 1000);
            }
        }
    };
    
    return (
        <div className="grid grid-cols-4 gap-2">
            {cards.map(c => (
                <button key={c.id} onClick={()=>handleCardClick(c.id)} className={`w-10 h-10 border flex items-center justify-center bg-black/50 ${c.flipped || c.matched ? 'bg-white/20' : ''}`}>
                    {(c.flipped || c.matched) ? <ProceduralIcon type={c.icon} size={24} /> : '?'}
                </button>
            ))}
        </div>
    );
};

// 4. Target Game
const TargetGame = ({ onComplete }: any) => {
    const [pos, setPos] = useState({x:50, y:50});
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5);
    
    useEffect(() => {
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if(prev <= 1) {
                    clearInterval(t);
                    onComplete(score >= 3 ? 'WIN' : 'LOSE', 'TARGET');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [score]);
    
    const hit = () => {
        setScore(s => s+1);
        setPos({x: Math.random()*80+10, y: Math.random()*80+10});
    };
    
    return (
        <div className="relative w-full h-40 border border-white/20 bg-black/50 overflow-hidden">
            <div className="absolute top-1 left-1 text-xs">Süre: {timeLeft} | Skor: {score}</div>
            <button 
                onMouseDown={(e)=>{e.stopPropagation(); hit();}}
                className="absolute w-8 h-8 flex items-center justify-center bg-red-500 rounded-full animate-pulse"
                style={{left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)'}}
            >
                🎯
            </button>
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
            default: return null;
        }
    };

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 text-white p-4">
            <div className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-pixel text-yellow-500">
                        {activeGame === 'NONE' ? 'OYUN SEÇ' : activeGame}
                    </h2>
                    <button onClick={activeGame === 'NONE' ? onClose : () => setActiveGame('NONE')} className="text-xs border px-2">
                        {activeGame === 'NONE' ? 'X' : '< GERİ'}
                    </button>
                </div>

                {activeGame === 'NONE' ? (
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={onPlayToy} className="border border-yellow-500 p-3 text-yellow-500 animate-pulse flex flex-col items-center">
                            <span className="material-symbols-outlined mb-1">sports_soccer</span>
                            <span className="text-xs">TOP YAKALAMA</span>
                        </button>
                        <button onClick={()=>setActiveGame('RPS')} className="border border-gray-500 p-3 hover:bg-white/10 flex flex-col items-center">
                            <span className="text-lg">✊✋✌️</span>
                            <span className="text-xs">TAŞ KAĞIT MAKAS</span>
                        </button>
                        <button onClick={()=>setActiveGame('MATH')} className="border border-gray-500 p-3 hover:bg-white/10 flex flex-col items-center">
                            <span className="text-lg">1 + 2 = ?</span>
                            <span className="text-xs">MATEMATİK</span>
                        </button>
                        <button onClick={()=>setActiveGame('MEMORY')} className="border border-gray-500 p-3 hover:bg-white/10 flex flex-col items-center">
                            <span className="material-symbols-outlined mb-1">grid_view</span>
                            <span className="text-xs">HAFIZA</span>
                        </button>
                        <button onClick={()=>setActiveGame('TARGET')} className="border border-gray-500 p-3 hover:bg-white/10 flex flex-col items-center">
                            <span className="material-symbols-outlined mb-1">ads_click</span>
                            <span className="text-xs">HEDEF VUR</span>
                        </button>
                    </div>
                ) : (
                    <div className="border-2 border-gray-700 p-4 rounded bg-gray-900 min-h-[200px] flex items-center justify-center">
                        {renderGame()}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main App Logic ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>({ ...INITIAL_GAME_STATE, dragon: { ...INITIAL_GAME_STATE.dragon, name: 'DRACO' } });
  const [hasSave, setHasSave] = useState(false);
  const [notifications, setNotifications] = useState<FloatingText[]>([]);
  
  // State'ler
  const [npc, setNpc] = useState<NpcState | null>(null);
  const [homeUpgrades, setHomeUpgrades] = useState<HomeUpgrades>({ forest: false, cleanKit: false, weatherStation: false });
  const [quests, setQuests] = useState<DailyQuest[]>([
    { id: 'WASH_ONCE', text: 'Draco\'yu 1 kez yıka', completed: false, rewardClaimed: false },
    { id: 'WIN_MINIGAME', text: '1 mini oyun kazan', completed: false, rewardClaimed: false },
    { id: 'HAPPY_80', text: 'Mutluluğu 80+ yap', completed: false, rewardClaimed: false },
  ]);

  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dragon_save_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      setGameState(parsed.gameState);
      if(parsed.upgrades) setHomeUpgrades(parsed.upgrades);
      if(parsed.quests) setQuests(parsed.quests);
      setHasSave(true);
    }
  }, []);

  // --- NPC LOGIC ---
  useEffect(() => {
    const npcTimer = window.setInterval(() => {
      if (gameState.screen !== Screen.MAIN) return;
      if (npc) return;
      if (Math.random() < 0.1) { // Increased chance slightly for demo
        const types: NpcType[] = ['MOUSE', 'OWL', 'JOKER'];
        const t = types[Math.floor(Math.random() * types.length)];
        let msg = '';
        if (t === 'MOUSE') msg = 'Oynayalım mı?';
        if (t === 'OWL') msg = 'Hava güzel!';
        if (t === 'JOKER') msg = 'Sürpriz!';
        // Random position between 20% and 80%
        setNpc({ type: t, message: msg, x: 20 + Math.random() * 60, y: 30 + Math.random() * 40 });
      }
    }, 15000);
    return () => clearInterval(npcTimer);
  }, [gameState.screen, npc]);
  // ------------------------------------

  const addNotification = (text: string, color = '#21221d') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, text, x: 40 + Math.random() * 20 - 10, y: 40 + Math.random() * 20 - 10, color }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 1500);
  };

  const completeQuest = (id: DailyQuestId) => {
    setQuests((prev) =>
      prev.map((q) => {
          if (q.id === id && !q.completed) {
              addNotification("GÖREV TAMAMLANDI!", "#fbbf24");
              return { ...q, completed: true };
          }
          return q;
      }),
    );
  };

  useEffect(() => {
    if (gameState.screen === Screen.START) return;

    tickRef.current = window.setInterval(() => {
      setGameState((prev) => {
        if (prev.dragon.stage === DragonStage.EGG) return prev;
        
        const isSleeping = prev.dragon.isSleeping;
        const accessory = prev.dragon.equippedAccessory;
        
        let hungerDecay = isSleeping ? 0.05 : 0.2;
        let hygieneDecay = 0.05;

        if (homeUpgrades.forest) hungerDecay *= 0.9;
        if (homeUpgrades.cleanKit) hygieneDecay *= 0.6;

        const newHunger = Math.max(0, prev.dragon.hunger - hungerDecay);

        let newEnergy = isSleeping
          ? Math.min(100, prev.dragon.energy + 1.5)
          : Math.max(0, prev.dragon.energy - 0.1);

        let newHygiene = Math.max(0, prev.dragon.hygiene - hygieneDecay);

        let happinessDecay = 0.1;
        if (newHunger < 20) happinessDecay += 0.2;
        if (newHygiene < 40) happinessDecay += 0.2;
        if (accessory === 'glasses') happinessDecay *= 0.7;
        if (homeUpgrades.forest) happinessDecay *= 0.9;
        if (accessory === 'crown') happinessDecay *= 0.8;

        const newHappiness = Math.max(0, prev.dragon.happiness - (isSleeping ? 0 : happinessDecay));
        
        let newWeather = prev.weather;
        if (!homeUpgrades.weatherStation && Math.random() < 0.005) {
             newWeather = prev.weather === 'SUNNY' ? 'RAIN' : 'SUNNY';
        } else if (homeUpgrades.weatherStation) {
            newWeather = 'SUNNY'; 
        }
        
        // Random poop
        let newPoops = prev.dragon.poops;
        if(!isSleeping && newHunger < 80 && Math.random() < 0.002) {
            newPoops += 1;
        }

        return {
          ...prev,
          weather: newWeather,
          dragon: {
            ...prev.dragon,
            hunger: newHunger,
            energy: newEnergy,
            hygiene: newHygiene,
            happiness: newHappiness,
            poops: newPoops,
            age: prev.dragon.age + 0.01,
          },
        };
      });
      
      setGameState(curr => {
          if(curr.dragon.happiness >= 80) completeQuest('HAPPY_80');
          return curr;
      });

    }, 1000);

    const saveInterval = window.setInterval(() => {
      localStorage.setItem('dragon_save_v2', JSON.stringify({ gameState, upgrades: homeUpgrades, quests }));
    }, 30000);

    return () => {
        if(tickRef.current) clearInterval(tickRef.current);
        clearInterval(saveInterval);
    }
  }, [gameState.screen, homeUpgrades]);

  const handleAction = (action: any) => {
    const type = typeof action === 'string' ? action : action.type;
    setGameState((prev) => {
      const d = { ...prev.dragon };
      let inv = { ...prev.inventory };
      let currency = prev.currency;
      
      if (type === 'USE_ITEM') {
        const item = action.item as Item;
        if (inv[item.id] > 0) {
          // Eğer top ise miktar düşmüyoruz, oynanabilir bir eşya
          if(item.type !== 'TOY') {
             inv[item.id]--;
          }
          
          if(item.type === 'FOOD') {
              d.hunger = Math.min(100, d.hunger + (item.effect.hunger || 0));
              d.health = Math.min(100, d.health + (item.effect.health || 0));
              addNotification('YEDİ', '#16a34a');
          } else if(item.type === 'TOY') {
               // Toy logic handled in MainScreen via ActiveToy state
          }
          d.happiness = Math.min(100, d.happiness + (item.effect.happiness || 0));
          d.energy = Math.min(100, d.energy + (item.effect.energy || 0));
        }
      } else if (type === 'CLEAN') {
        d.hygiene = 100;
        if (d.poops > 0) {
          if (Math.random() < 0.2) {
            currency += 50;
            addNotification('ALTIN BULDUN!', '#facc15');
          } else {
            addNotification('TERTEMİZ!', '#0ea5e9');
          }
          completeQuest('WASH_ONCE');
        } else {
          addNotification('ZATEN TEMİZ', '#0ea5e9');
        }
        d.poops = 0;
      } else if (type === 'SLEEP') {
        d.isSleeping = !d.isSleeping;
      } else if (type === 'EQUIP') {
        const item = action.item as Item;
        if (d.equippedAccessory === item.id) {
          d.equippedAccessory = null;
          addNotification('ÇIKARDI', '#9ca3af');
        } else {
          d.equippedAccessory = item.id;
          d.happiness = Math.min(100, d.happiness + 5);
          addNotification('TAKTI', '#6366f1');
        }
      }
      return { ...prev, dragon: d, inventory: inv, currency };
    });
  };

  const handleMiniGameComplete = (result: 'WIN' | 'LOSE' | 'DRAW', game: MiniGameType) => {
    setGameState((prev) => {
      let bonusGold = 0;
      let mood = 0;
      let energyCost = 10;
      let xpGain = 10;

      if (result === 'WIN') { bonusGold = 50; mood = 20; xpGain = 20; } 
      else if (result === 'DRAW') { bonusGold = 20; mood = 10; xpGain = 10; } 
      else { bonusGold = 5; mood = 5; xpGain = 5; }

      if (prev.dragon.equippedAccessory === 'headphones') bonusGold = Math.floor(bonusGold * 1.3);
      if (prev.dragon.equippedAccessory === 'horn') xpGain = Math.floor(xpGain * 1.3);
      if (prev.dragon.equippedAccessory === 'crown') mood = Math.floor(mood * 1.2);

      const newHappiness = Math.min(100, prev.dragon.happiness + mood);
      if (result === 'WIN') completeQuest('WIN_MINIGAME');
      if (newHappiness >= 80) completeQuest('HAPPY_80');

      return {
        ...prev,
        currency: prev.currency + bonusGold,
        dragon: {
          ...prev.dragon,
          happiness: newHappiness,
          energy: Math.max(0, prev.dragon.energy - energyCost),
          xp: prev.dragon.xp + xpGain,
        },
      };
    });

    if (result === 'WIN') addNotification('KAZANDIN!', '#16a34a');
    else if (result === 'DRAW') addNotification('BERABERE', '#eab308');
    else addNotification('KAYBETTİN...', '#dc2626');
  };

  const handleNpcClick = () => {
      if(!npc) return;
      if(npc.type === 'MOUSE') {
          setGameState(prev => ({ ...prev, currency: prev.currency + 100 }));
          addNotification("+100 ALTIN", "#facc15");
      } else if(npc.type === 'OWL') {
          setGameState(prev => ({ ...prev, dragon: { ...prev.dragon, xp: prev.dragon.xp + 50 } }));
          addNotification("+50 XP", "#6366f1");
      } else if(npc.type === 'JOKER') {
          setGameState(prev => ({ ...prev, dragon: { ...prev.dragon, happiness: 100, energy: Math.max(0, prev.dragon.energy - 20) } }));
          addNotification("ŞAKA YAPTI!", "#ec4899");
      }
      setNpc(null);
  };

  const handleClaimQuest = (id: DailyQuestId) => {
      setQuests(prev => prev.map(q => q.id === id ? { ...q, rewardClaimed: true } : q));
      setGameState(prev => ({ ...prev, currency: prev.currency + 100 }));
      addNotification("GÖREV ÖDÜLÜ +100G", "#facc15");
  };

  const handleBuyUpgrade = (type: keyof HomeUpgrades, cost: number) => {
      if(gameState.currency >= cost) {
          setGameState(prev => ({ ...prev, currency: prev.currency - cost }));
          setHomeUpgrades(prev => ({ ...prev, [type]: true }));
          addNotification("EV GELİŞTİRİLDİ!", "#16a34a");
      } else {
          addNotification("PARA YETERSİZ", "#dc2626");
      }
  };

  if (gameState.screen === Screen.START) return <StartScreen onStart={() => setGameState(prev => ({ ...prev, screen: Screen.HATCH }))} onContinue={() => { const s = localStorage.getItem('dragon_save_v2'); if(s) { const p=JSON.parse(s); setGameState(p.gameState); setHomeUpgrades(p.upgrades); setQuests(p.quests); } }} hasSave={hasSave} />;
  if (gameState.dragon.stage === DragonStage.EGG) return <HatchingScreen onHatchTick={() => setTimeout(() => setGameState(prev => ({ ...prev, dragon: { ...prev.dragon, stage: DragonStage.BABY } })), 500)} />;
  if (gameState.screen === Screen.MARKET) return <MarketScreen gameState={gameState} upgrades={homeUpgrades} onBuy={(i:Item) => { if(gameState.currency>=i.price){ setGameState(p=>({...p,currency:p.currency-i.price,inventory:{...p.inventory,[i.id]:(p.inventory[i.id]||0)+1}})); addNotification("ALINDI","#facc15");}}} onBuyUpgrade={handleBuyUpgrade} onNavigate={(s:Screen) => setGameState(p=>({...p,screen:s}))} />;
  if (gameState.screen === Screen.STATS) return <StatsScreen gameState={gameState} onNavigate={(s:Screen) => setGameState(p=>({...p,screen:s}))} />;

  return (
      <MainGameScreen 
        gameState={gameState} 
        upgrades={homeUpgrades}
        npc={npc}
        onNpcClick={handleNpcClick}
        onAction={handleAction} 
        onNavigate={(s:Screen) => setGameState(p=>({...p,screen:s}))} 
        onPet={() => { setGameState(p => ({ ...p, dragon: { ...p.dragon, happiness: Math.min(100, p.dragon.happiness + 5) } })); addNotification('<3', '#f472b6'); }} 
        notifications={notifications} 
        onMiniGameComplete={handleMiniGameComplete}
        quests={quests}
        onClaimQuest={handleClaimQuest}
        addNotification={addNotification}
      />
  );
}

// --- Main Game Screen (Movement & Physics) ---
const MainGameScreen = ({ gameState, onAction, onNavigate, onPet, notifications, onMiniGameComplete, upgrades, npc, onNpcClick, quests, onClaimQuest, addNotification }: any) => {
  const { dragon, weather } = gameState;
  const [showInventory, setShowInventory] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  
  // Physics State
  const [dracoPos, setDracoPos] = useState({ x: 50, y: 50 }); // Percentage
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [activeToy, setActiveToy] = useState<{ id: string, x: number, y: number } | null>(null);
  
  // Game Loop for Movement
  useEffect(() => {
      let animFrame: number;
      const updatePosition = () => {
          setDracoPos(prev => {
              const dx = targetPos.x - prev.x;
              const dy = targetPos.y - prev.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              
              if(dist < 0.5) return prev; // Arrived
              
              const speed = 0.5 + (dragon.energy > 50 ? 0.2 : 0);
              const moveX = (dx / dist) * speed;
              const moveY = (dy / dist) * speed;
              
              return { x: prev.x + moveX, y: prev.y + moveY };
          });
          
          // Toy collision logic
          if(activeToy) {
              const dist = Math.sqrt(Math.pow(activeToy.x - dracoPos.x, 2) + Math.pow(activeToy.y - dracoPos.y, 2));
              if(dist < 5) { // caught it
                  setActiveToy(null);
                  onPet(); // Bonus happiness
                  
                  if (activeToy.id === 'flame_show') {
                      addNotification("HARİKA ŞOV!", "#f97316");
                  }
              }
          }

          animFrame = requestAnimationFrame(updatePosition);
      };
      animFrame = requestAnimationFrame(updatePosition);
      return () => cancelAnimationFrame(animFrame);
  }, [targetPos, activeToy, dragon.energy]);

  // Screen Click -> Move
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      if (activeToy) {
          // Move toy to new position
          setActiveToy({ ...activeToy, x, y });
          setTargetPos({ x, y });
      } else {
          // Just fly there
          setTargetPos({ x, y });
      }
  };

  const activateToy = (toyId: string) => {
      setActiveToy({ id: toyId, x: 50 + (Math.random()*20-10), y: 50 });
      setTargetPos({ x: 50 + (Math.random()*20-10), y: 50 });
      setShowInventory(false);
      setShowMiniGame(false);
  };
  
  // Helper to get image for active toy
  const getToyImage = (id: string) => {
      const item = ITEMS.find(i => i.id === id);
      return item ? item.image : 'BALL';
  };

  return (
    <LcdScreen className="flex flex-col relative" isNight={dragon.isSleeping} upgrades={upgrades} onClick={handleScreenClick}>
      <Clouds />
      <WeatherOverlay weather={weather} />
      <FloatingTextOverlay items={notifications} />

      {/* NPC */}
      {npc && (
          <button 
            onClick={(e) => { e.stopPropagation(); onNpcClick(); }}
            className="absolute z-20 animate-bounce"
            style={{ left: `${npc.x}%`, top: `${npc.y}%`, transform: 'translate(-50%, -50%)' }}
          >
              <ProceduralIcon type={npc.type} size={48} />
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-white text-black px-1 rounded whitespace-nowrap shadow-pixel">{npc.message}</span>
          </button>
      )}
      
      {/* Active Toy */}
      {activeToy && (
          <div className="absolute z-10 transition-all duration-300 ease-out" style={{ left: `${activeToy.x}%`, top: `${activeToy.y}%`, transform: 'translate(-50%, -50%)' }}>
               <ProceduralIcon 
                 type={getToyImage(activeToy.id)} 
                 size={activeToy.id === 'flame_show' ? 48 : 24} 
                 className={activeToy.id === 'flame_show' ? 'animate-pulse' : 'animate-spin'} 
               />
          </div>
      )}

      {/* HUD */}
      <div className="flex justify-between items-start mb-4 relative z-30 pointer-events-none">
        <div className="flex flex-col gap-2 w-1/2">
          <StatBar icon="nutrition" value={dragon.hunger} />
          <StatBar icon="favorite" value={dragon.happiness} />
        </div>
        <div className="flex flex-col gap-2 w-1/2 items-end">
          <StatBar icon="cleaning_services" value={dragon.hygiene} reverse />
          <StatBar icon="bolt" value={dragon.energy} reverse />
        </div>
      </div>

      {/* Draco Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
         {/* Poops */}
         {Array.from({length: dragon.poops}).map((_, i) => (
             <div key={i} className="absolute text-xl" style={{ bottom: '20%', left: `${20 + i*15}%` }}>💩</div>
         ))}
         
         <div 
            className="absolute transition-transform duration-75"
            style={{ 
                left: `${dracoPos.x}%`, 
                top: `${dracoPos.y}%`, 
                width: '160px', 
                height: '160px',
                transform: `translate(-50%, -50%)`
            }}
         >
            <div onClick={(e) => { e.stopPropagation(); onPet(); }} className="w-full h-full cursor-pointer pointer-events-auto">
                <ProceduralDragon 
                    stage={dragon.stage === DragonStage.ELDER ? 'old' : dragon.stage === DragonStage.BABY ? 'baby' : 'adult'} 
                    mode={dragon.isSleeping ? 'sleepy' : 'idle'} 
                    accessory={dragon.equippedAccessory} 
                    direction={targetPos.x < dracoPos.x ? -1 : 1}
                />
            </div>
            {dragon.isSleeping && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 rounded text-[10px]">Zzz...</div>}
         </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-2 z-40 pointer-events-auto">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
            <button onClick={(e) => {e.stopPropagation(); onNavigate(Screen.STATS);}} className="hover:bg-black/10 p-1 rounded"><span className="material-symbols-outlined">bar_chart</span></button>
            <button onClick={(e) => {e.stopPropagation(); onNavigate(Screen.MARKET);}} className="hover:bg-black/10 p-1 rounded"><span className="material-symbols-outlined">storefront</span></button>
            <button onClick={(e) => {e.stopPropagation(); setShowQuests(true);}} className="hover:bg-black/10 p-1 rounded relative">
                <span className="material-symbols-outlined">assignment</span>
                {quests.some((q:any) => q.completed && !q.rewardClaimed) && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"/>}
            </button>
            </div>
            {activeToy && <div className="text-xs animate-pulse text-yellow-500 bg-black/50 px-2 rounded">OYUN MODU (Tıkla!)</div>}
        </div>

        <div className="grid grid-cols-4 gap-2">
            <button onClick={(e) => { e.stopPropagation(); setShowInventory(true); }} className="flex flex-col items-center p-2 border-2 border-lcd-fg bg-lcd-bg shadow-pixel active:translate-y-1"><span className="material-symbols-outlined">backpack</span></button>
            <button onClick={(e) => { e.stopPropagation(); setShowMiniGame(true); }} className="flex flex-col items-center p-2 border-2 border-lcd-fg bg-lcd-bg shadow-pixel active:translate-y-1"><span className="material-symbols-outlined">sports_esports</span></button>
            <button onClick={(e) => { e.stopPropagation(); onAction({ type: 'CLEAN' }); }} className="flex flex-col items-center p-2 border-2 border-lcd-fg bg-lcd-bg shadow-pixel active:translate-y-1"><span className="material-symbols-outlined">soap</span></button>
            <button onClick={(e) => { e.stopPropagation(); onAction({ type: 'SLEEP' }); }} className="flex flex-col items-center p-2 border-2 border-lcd-fg bg-lcd-bg shadow-pixel active:translate-y-1"><span className="material-symbols-outlined">bedtime</span></button>
        </div>
      </div>

      {showInventory && <InventoryModal inventory={gameState.inventory} onClose={() => setShowInventory(false)} onSelect={(i) => { 
          if(i.type === 'TOY') { activateToy(i.id); } 
          else { setShowInventory(false); onAction({ type: 'USE_ITEM', item: i }); if(i.type==='ACCESSORY') onAction({type:'EQUIP', item:i}); }
      }} />}
      {showMiniGame && <MiniGameModal onClose={() => setShowMiniGame(false)} onPlayToy={() => activateToy('ball')} onComplete={(res, game) => { onMiniGameComplete(res, game); setShowMiniGame(false); }} />}
      {showQuests && <QuestModal quests={quests} onClaim={onClaimQuest} onClose={() => setShowQuests(false)} />}
    </LcdScreen>
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
                {['FOOD','TOY','ACCESSORY'].map(t => <button key={t} onClick={() => setSubTab(t)} className={`text-[10px] px-2 border ${subTab===t?'bg-gray-700':''}`}>{t}</button>)}
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

// Start Screen, Hatching Screen, StatBar, Clouds, WeatherOverlay, MiniGameModal, InventoryModal, StatsScreen
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
       
       <div className="text-[10px] text-gray-500 mt-4 font-pixel">v1.2.0 Pixel Edition</div>
    </div>
  </LcdScreen>
);
const HatchingScreen = ({ onHatchTick }: any) => {
    const [shake, setShake] = useState(false);
    return (
    <LcdScreen className="flex flex-col items-center justify-center">
        <div onClick={() => { setShake(true); onHatchTick(); setTimeout(()=>setShake(false),200); }} className={`cursor-pointer ${shake ? 'animate-bounce' : ''}`}>
            <ProceduralIcon type="EGG" size={64} />
            <div className="mt-4 text-center text-xs animate-pulse">DOKUN!</div>
        </div>
    </LcdScreen>
    );
};
const StatBar = ({ icon, value, reverse = false }: any) => (
    <div className={`flex items-center gap-1 w-full max-w-[120px] ${reverse ? 'flex-row-reverse' : ''}`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <div className="flex-1 h-4 border-2 border-lcd-fg p-[1px]"><div className="h-full bg-lcd-fg" style={{ width: `${Math.min(100, value)}%` }} /></div>
    </div>
);
const Clouds = () => <div className="absolute inset-0 pointer-events-none opacity-30"><div className="absolute top-10 left-10 w-20 h-8 bg-white blur-md animate-pulse"></div></div>;
const WeatherOverlay = ({ weather }: any) => weather === 'RAIN' ? <div className="absolute inset-0 bg-blue-500/20 pointer-events-none mix-blend-multiply" /> : null;
const FloatingTextOverlay = ({ items }: any) => <div className="absolute inset-0 pointer-events-none z-50">{items.map((i:any) => <div key={i.id} style={{left:`${i.x}%`, top:`${i.y}%`, color:i.color}} className="absolute font-bold text-xs animate-bounce">{i.text}</div>)}</div>;
const InventoryModal = ({ inventory, onSelect, onClose }: any) => {
    const items = ITEMS.filter(i => (inventory[i.id]||0)>0);
    return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
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
const StatsScreen = ({ gameState, onNavigate }: any) => (
    <div className="h-full bg-[#d4b4b4] border-8 border-black p-4 flex flex-col">
        <h2 className="text-center text-xl font-bold mb-4">{gameState.dragon.name}</h2>
        <div className="flex-1 flex flex-col items-center justify-center">
             <ProceduralIcon type="EGG" size={64} className="mb-4 mix-blend-multiply opacity-50"/> 
             <div className="text-sm">LVL: {gameState.dragon.evolutionStage}</div>
             <div className="text-sm">XP: {Math.floor(gameState.dragon.xp)}/{gameState.dragon.maxXp}</div>
        </div>
        <button onClick={()=>onNavigate(Screen.MAIN)} className="bg-black text-[#d4b4b4] p-3">GERİ</button>
    </div>
);
