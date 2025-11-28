// src/App.tsx

import React, { useState, useEffect, useRef } from 'react';
import { GameState, Screen, DragonStage, Item, WeatherType } from './types';
import { ITEMS, INITIAL_GAME_STATE } from './constants';

// --- Types for Visual Effects ---
interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

// --- Mini game type ---
type MiniGameType = 'NONE' | 'RPS' | 'MATH' | 'CATCH' | 'TAP' | 'FLAME_SHOW';

// --- Pixel Art Data (8x8 or 10x10 grids) ---
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
    palette: ['transparent', '#b91c1c', '#fecaca', '#f87171'], // Kırmızı yumurta
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
};

const ProceduralIcon = ({
  type,
  size = 32,
  className = '',
}: {
  type: string;
  size?: number;
  className?: string;
}) => {
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
          ctx.fillRect(
            x * pixelSize,
            y * pixelSize,
            pixelSize,
            pixelSize,
          );
        }
      }
    }
  }, [type, size]);

  return (
    <canvas
      ref={canvasRef}
      className={`image-rendering-pixelated ${className}`}
      style={{ width: size, height: size }}
    />
  );
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

function getDragonColors(
  val: number,
  mode: string,
  age: string,
  t: number = 0,
) {
  const isAngry = mode === 'angry';
  const isSleepy = mode === 'sleepy';
  const isExcited =
    mode === 'excited' ||
    mode === 'play' ||
    mode === 'playing' ||
    mode === 'fetch';
  const isHappy = mode === 'happy' || mode === 'feeding';
  const isRainbow = mode === 'rainbow';

  let body = '#ef4444';
  let shadow = '#991b1b';
  let eye = '#fbbf24';
  let belly = '#fee2e2';

  if (age === 'baby') {
    body = '#f87171';
    shadow = '#b91c1c';
    eye = '#fcd34d';
    belly = '#fef2f2';
  } else if (age === 'old') {
    body = '#7f1d1d';
    shadow = '#450a0a';
    eye = '#d97706';
    belly = '#9ca3af';
  }

  if (isRainbow) {
    const hue = (t * 100) % 360;
    body = `hsl(${hue}, 80%, 60%)`;
    shadow = `hsl(${hue}, 90%, 30%)`;
    belly = `hsl(${(hue + 180) % 360}, 90%, 90%)`;
    eye = '#ffffff';
  } else if (isAngry) {
    body = '#7f1d1d';
    shadow = '#000000';
    eye = '#ff0000';
    belly = '#7f1d1d';
  } else if (isSleepy) {
    body = '#f87171';
    eye = '#9ca3af';
    belly = '#f3f4f6';
  } else if (isExcited) {
    body = '#fca5a5';
    eye = '#fde047';
  } else if (isHappy) {
    body = '#ef4444';
  }

  if (val === 3) return eye;
  if (val === 4) return belly;
  if (val === 1) return body;
  if (val === 2) return shadow;
  return null;
}

const ProceduralDragon = ({
  stage,
  mode,
  accessory,
  className = '',
  animate = true,
}: {
  stage: 'baby' | 'adult' | 'old';
  mode: string;
  accessory?: string | null;
  className?: string;
  animate?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseSize = 16;
    const scale = 4;
    const logicalSize = baseSize * scale;
    const pixelSize = 1;

    canvas.width = logicalSize;
    canvas.height = logicalSize;

    const headLogicalX = 8 * scale;
    const headLogicalY = 5 * scale;

    const drawRect = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    };

    const drawAccessory = (type: string, offsetY: number) => {
      if (type === 'hat') {
        const hatColor = '#6366f1';
        const hatBand = '#fbbf24';
        const hx = headLogicalX - 3 * scale;
        const hy = headLogicalY - 5 * scale + offsetY;

        for (let i = 0; i < 6; i++) {
          const w = (i + 1) * scale;
          const cx = headLogicalX - w / 2;
          ctx.fillStyle = hatColor;
          ctx.fillRect(cx, hy + i * scale, w, scale);
        }

        ctx.fillStyle = hatColor;
        ctx.fillRect(
          headLogicalX - 5 * scale,
          hy + 5 * scale,
          10 * scale,
          scale,
        );

        ctx.fillStyle = hatBand;
        ctx.fillRect(
          headLogicalX - 3 * scale,
          hy + 4 * scale,
          6 * scale,
          scale,
        );
      } else if (type === 'glasses') {
        const gx = headLogicalX - 4 * scale;
        const gy = headLogicalY + 1 * scale + offsetY;
        ctx.fillStyle = '#000000';
        ctx.fillRect(gx, gy, 3 * scale, 2 * scale);
        ctx.fillRect(gx + 5 * scale, gy, 3 * scale, 2 * scale);
        ctx.fillRect(
          gx + 3 * scale,
          gy + 0.5 * scale,
          2 * scale,
          0.5 * scale,
        );
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(gx + scale, gy + 0.5 * scale, scale, scale);
        ctx.fillRect(
          gx + 6 * scale,
          gy + 0.5 * scale,
          scale,
          scale,
        );
      }
    };

    const drawDragonBody = (t: number) => {
      let baseAmp = mode === 'sleepy' ? 0.3 : 0.7;
      if (stage === 'baby') baseAmp *= 1.3;
      if (stage === 'old') baseAmp *= 0.4;

      let subtleBob = Math.sin(t * 2) * baseAmp;

      if (
        mode === 'playing' ||
        mode === 'excited' ||
        mode === 'play' ||
        mode === 'fetch'
      ) {
        subtleBob = Math.abs(Math.sin(t * 15)) * 4;
      }

      if (mode === 'fly') {
        subtleBob = Math.sin(t * 8) * 2;
      }

      const offsetY = subtleBob;

      for (let by = 0; by < baseSize; by++) {
        for (let bx = 0; bx < baseSize; bx++) {
          const val = BASE_DRAGON[by][bx];
          if (val === 0) continue;
          const color = getDragonColors(val, mode, stage, t);
          if (!color) continue;

          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              const lx = bx * scale + sx;
              const ly = by * scale + sy + offsetY;
              drawRect(lx, ly, color);
            }
          }
        }
      }

      if (accessory) {
        drawAccessory(accessory, offsetY);
      }
    };

    const render = (timestamp: number) => {
      if (!animate) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDragonBody(0);
        return;
      }

      const t = timestamp / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawDragonBody(t);

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(frameRef.current);
  }, [stage, mode, animate, accessory]);

  return (
    <canvas
      ref={canvasRef}
      className={`image-rendering-pixelated w-full h-full object-contain ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

// --- Utility Components ---

const PixelButton = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'default',
}: any) => {
  const baseStyles =
    'relative font-pixel text-xs sm:text-sm uppercase py-3 px-4 transition-transform active:translate-y-1 disabled:opacity-50 disabled:active:translate-y-0 select-none';
  let colorStyles =
    'bg-gray-200 border-4 border-gray-800 text-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100';
  if (variant === 'primary') {
    colorStyles =
      'bg-[#ef4444] border-4 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:brightness-110';
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${colorStyles} ${className}`}
    >
      {children}
    </button>
  );
};

const LcdScreen = ({
  children,
  className = '',
  isNight = false,
  onClick,
}: any) => {
  return (
    <div
      className="w-full h-full bg-lcd-bg text-lcd-fg overflow-hidden relative font-pixel shadow-screen-inner transition-colors duration-1000"
      onClick={onClick}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-20 z-10 mix-blend-multiply"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0, 0.5) 1px, transparent 1px)',
          backgroundSize: '6px 6px',
        }}
      />
      <div
        className={`absolute inset-0 bg-[#0f172a] mix-blend-multiply pointer-events-none z-20 transition-opacity duration-1000 ${
          isNight ? 'opacity-90' : 'opacity-0'
        }`}
      />
      <div className={`relative z-0 h-full p-4 ${className}`}>
        {children}
      </div>
    </div>
  );
};

const FloatingTextOverlay = ({ items }: { items: FloatingText[] }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-xs font-bold animate-bounce-pixel whitespace-nowrap"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            color: item.color,
            textShadow: '2px 2px 0px #000',
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

const Clouds = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-50 overflow-hidden">
      <div
        className="absolute top-[10%] left-[-20%] animate-[shiver_20s_linear_infinite] w-20 h-10 bg-white/40 rounded-full blur-sm"
        style={{ animationDuration: '30s' }}
      />
      <div
        className="absolute top-[30%] left-[-20%] animate-[shiver_25s_linear_infinite] w-32 h-12 bg-white/30 rounded-full blur-md"
        style={{ animationDuration: '45s', animationDelay: '2s' }}
      />
      <div
        className="absolute top-[5%] left-[-20%] animate-[shiver_35s_linear_infinite] w-16 h-8 bg-white/50 rounded-full blur-sm"
        style={{ animationDuration: '60s', animationDelay: '10s' }}
      />
    </div>
  );
};

const WeatherOverlay = ({ weather }: { weather: WeatherType }) => {
  if (weather === 'SUNNY') return null;
  return (
    <div className="absolute inset-0 z-10 pointer-events-none opacity-40 mix-blend-multiply overflow-hidden">
      <div
        className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] animate-[shiver_0.5s_linear_infinite]"
        style={{
          backgroundImage:
            'linear-gradient(15deg, transparent 95%, #0ea5e9 95%, #0ea5e9 96%, transparent 96%)',
          backgroundSize: '20px 20px',
          transform: 'rotate(20deg)',
        }}
      />
    </div>
  );
};

// --- Mini Games Modal (5 oyun) ---

const MiniGameModal = ({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (result: 'WIN' | 'LOSE' | 'DRAW', game: MiniGameType) => void;
}) => {
  const [selectedGame, setSelectedGame] =
    useState<MiniGameType>('NONE');
  const [step, setStep] = useState<'CHOICE' | 'THINKING' | 'RESULT'>(
    'CHOICE',
  );
  const [result, setResult] = useState<string | null>(null);

  // Math game
  const [mathQ] = useState({
    text: '2 + 3 = ?',
    ans: 5,
    options: [4, 5, 6, 3],
  });

  // Catch game
  const [catchScore, setCatchScore] = useState(0);
  const [catchTarget, setCatchTarget] = useState({ top: 50, left: 50 });
  const [catchTime, setCatchTime] = useState(10);
  const catchInterval = useRef<number | null>(null);

  // Tap game
  const [tapCount, setTapCount] = useState(0);
  const [tapTime, setTapTime] = useState(8);
  const tapInterval = useRef<number | null>(null);

  // RPS
  const handleRPS = (choice: 'ROCK' | 'PAPER' | 'SCISSORS') => {
    setStep('THINKING');
    setTimeout(() => {
      const opts: ('ROCK' | 'PAPER' | 'SCISSORS')[] = [
        'ROCK',
        'PAPER',
        'SCISSORS',
      ];
      const cpu = opts[Math.floor(Math.random() * 3)];
      let res: 'WIN' | 'LOSE' | 'DRAW' = 'DRAW';
      if (choice !== cpu) {
        if (
          (choice === 'ROCK' && cpu === 'SCISSORS') ||
          (choice === 'PAPER' && cpu === 'ROCK') ||
          (choice === 'SCISSORS' && cpu === 'PAPER')
        ) {
          res = 'WIN';
        } else {
          res = 'LOSE';
        }
      }
      setResult(res);
      setStep('RESULT');
      setTimeout(() => {
        onComplete(res, 'RPS');
      }, 1200);
    }, 1000);
  };

  const handleMath = (val: number) => {
    const res: 'WIN' | 'LOSE' =
      val === mathQ.ans ? 'WIN' : 'LOSE';
    setResult(res);
    setStep('RESULT');
    setTimeout(() => {
      onComplete(res, 'MATH');
    }, 800);
  };

  useEffect(() => {
    if (selectedGame === 'CATCH') {
      setCatchScore(0);
      setCatchTime(10);
      setCatchTarget({ top: 50, left: 50 });
      if (catchInterval.current) {
        clearInterval(catchInterval.current);
      }
      catchInterval.current = window.setInterval(() => {
        setCatchTime((t) => {
          if (t <= 1) {
            if (catchInterval.current) {
              clearInterval(catchInterval.current);
            }
            const res: 'WIN' | 'LOSE' =
              catchScore >= 5 ? 'WIN' : 'LOSE';
            onComplete(res, 'CATCH');
            return 0;
          }
          return t - 1;
        });
        setCatchTarget({
          top: 10 + Math.random() * 80,
          left: 10 + Math.random() * 80,
        });
      }, 800);
    }
    return () => {
      if (catchInterval.current) {
        clearInterval(catchInterval.current);
      }
    };
  }, [selectedGame, catchScore, onComplete]);

  const handleCatchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCatchScore((s) => s + 1);
  };

  useEffect(() => {
    if (selectedGame === 'TAP') {
      setTapCount(0);
      setTapTime(8);
      if (tapInterval.current) {
        clearInterval(tapInterval.current);
      }
      tapInterval.current = window.setInterval(() => {
        setTapTime((t) => {
          if (t <= 1) {
            if (tapInterval.current) {
              clearInterval(tapInterval.current);
            }
            const res: 'WIN' | 'LOSE' =
              tapCount >= 15 ? 'WIN' : 'LOSE';
            onComplete(res, 'TAP');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (tapInterval.current) {
        clearInterval(tapInterval.current);
      }
    };
  }, [selectedGame, tapCount, onComplete]);

  const handleTap = () => {
    setTapCount((c) => c + 1);
  };

  const startFlameShow = () => {
    setStep('THINKING');
    setResult(null);
    setTimeout(() => {
      setResult('WIN');
      setStep('RESULT');
      setTimeout(() => {
        onComplete('WIN', 'FLAME_SHOW');
      }, 1200);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-lcd-bg border-4 border-lcd-fg p-3 w-full max-w-[300px] shadow-pixel relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xs font-bold"
        >
          X
        </button>

        {selectedGame === 'NONE' && (
          <div className="flex flex-col gap-2 text-center">
            <h3 className="text-sm font-pixel mb-2 border-b-2 border-lcd-fg pb-2">
              OYUN MERKEZİ
            </h3>
            <button
              onClick={() => {
                setSelectedGame('RPS');
                setStep('CHOICE');
                setResult(null);
              }}
              className="border-2 border-lcd-fg p-2 text-xs hover:bg-black/10"
            >
              TAŞ KAĞIT MAKAS
            </button>
            <button
              onClick={() => {
                setSelectedGame('MATH');
                setStep('CHOICE');
                setResult(null);
              }}
              className="border-2 border-lcd-fg p-2 text-xs hover:bg-black/10"
            >
              MATEMATİK DEHASI
            </button>
            <button
              onClick={() => {
                setSelectedGame('CATCH');
                setStep('CHOICE');
                setResult(null);
              }}
              className="border-2 border-lcd-fg p-2 text-xs hover:bg-black/10"
            >
              ELMA YAKALAMA
            </button>
            <button
              onClick={() => {
                setSelectedGame('TAP');
                setStep('CHOICE');
                setResult(null);
              }}
              className="border-2 border-lcd-fg p-2 text-xs hover:bg-black/10"
            >
              HIZLI TIKLAMA
            </button>
            <button
              onClick={() => {
                setSelectedGame('FLAME_SHOW');
                setStep('CHOICE');
                setResult(null);
              }}
              className="border-2 border-red-700 p-2 text-xs hover:bg-red-200/40 bg-red-100/40"
            >
              DRACO&apos;S FLAME SHOW 🔥
            </button>
          </div>
        )}

        {selectedGame === 'RPS' && (
          <div className="text-center">
            <h3 className="text-sm font-pixel mb-2">
              TAŞ KAĞIT MAKAS
            </h3>
            {step === 'CHOICE' && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleRPS('ROCK')}
                  className="border-2 border-black bg-white px-2 py-1 text-xs"
                >
                  TAŞ
                </button>
                <button
                  onClick={() => handleRPS('PAPER')}
                  className="border-2 border-black bg-white px-2 py-1 text-xs"
                >
                  KAĞIT
                </button>
                <button
                  onClick={() => handleRPS('SCISSORS')}
                  className="border-2 border-black bg-white px-2 py-1 text-xs"
                >
                  MAKAS
                </button>
              </div>
            )}
            {step === 'THINKING' && (
              <div className="mt-4 text-xs">Draco düşünüyor...</div>
            )}
            {step === 'RESULT' && (
              <div className="mt-4 text-lg font-bold">{result}</div>
            )}
          </div>
        )}

        {selectedGame === 'MATH' && (
          <div className="text-center">
            <h3 className="text-sm font-pixel mb-2">
              MATEMATİK DEHASI
            </h3>
            <div className="mb-2 text-xs">Soru: {mathQ.text}</div>
            <div className="grid grid-cols-2 gap-2">
              {mathQ.options.map((o) => (
                <button
                  key={o}
                  onClick={() => handleMath(o)}
                  className="border-2 border-black bg-white px-2 py-1 text-xs"
                >
                  {o}
                </button>
              ))}
            </div>
            {step === 'RESULT' && (
              <div className="mt-3 text-lg font-bold">{result}</div>
            )}
          </div>
        )}

        {selectedGame === 'CATCH' && (
          <div className="text-center">
            <h3 className="text-sm font-pixel mb-2">
              ELMA YAKALAMA
            </h3>
            <div className="flex justify-between text-[10px] mb-1">
              <span>Süre: {catchTime}</span>
              <span>Skor: {catchScore}/5</span>
            </div>
            <div className="h-40 border-2 border-black relative bg-white/10 overflow-hidden">
              <button
                onClick={handleCatchClick}
                className="absolute w-8 h-8 flex items-center justify-center text-xl transition-all duration-300"
                style={{
                  top: `${catchTarget.top}%`,
                  left: `${catchTarget.left}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <ProceduralIcon type="APPLE" size={28} />
              </button>
            </div>
          </div>
        )}

        {selectedGame === 'TAP' && (
          <div className="text-center">
            <h3 className="text-sm font-pixel mb-2">
              HIZLI TIKLAMA
            </h3>
            <div className="mb-1 text-[10px]">
              {tapTime} sn içinde 15 kez tıkla!
            </div>
            <div className="mb-2 text-xs">
              Tıklama: {tapCount}/15
            </div>
            <button
              onClick={handleTap}
              className="border-4 border-black bg-yellow-300 px-4 py-3 text-xs font-bold active:translate-y-1 shadow-pixel"
            >
              TIKLA!
            </button>
          </div>
        )}

        {selectedGame === 'FLAME_SHOW' && (
          <div className="text-center">
            <h3 className="text-sm font-pixel mb-2">
              DRACO&apos;S FLAME SHOW 🔥
            </h3>
            <p className="text-[10px] mb-3">
              Draco sahneye çıkıyor! Alev halkalarını
              izleyip gösteriyi başlat.
            </p>
            {step === 'CHOICE' && (
              <button
                onClick={startFlameShow}
                className="border-4 border-red-700 bg-red-500 text-white px-3 py-2 text-xs font-bold shadow-pixel active:translate-y-1"
              >
                ALEV GÖSTERİSİNİ BAŞLAT
              </button>
            )}
            {step === 'THINKING' && (
              <div className="mt-3 text-xs animate-pulse">
                Draco derin nefes alıyor...
              </div>
            )}
            {step === 'RESULT' && (
              <div className="mt-3 text-xs">
                <div className="text-lg font-bold text-red-600 mb-1">
                  MUHTEŞEM! 🔥
                </div>
                <div className="text-[10px]">
                  Draco alev halkalarıyla mini bir sahne
                  şovu yaptı!
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Inventory Modal ---

const InventoryModal = ({
  inventory,
  onSelect,
  onClose,
}: {
  inventory: Record<string, number>;
  onSelect: (item: Item) => void;
  onClose: () => void;
}) => {
  const [tab, setTab] = useState<'FOOD' | 'TOY' | 'ACCESSORY'>(
    'FOOD',
  );
  const filteredItems = ITEMS.filter(
    (item) => item.type === tab,
  );

  const visibleItems = filteredItems.filter(
    (i) => (inventory[i.id] || 0) > 0,
  );

  return (
    <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-lcd-bg border-4 border-lcd-fg p-2 w-full max-w-[280px] shadow-pixel h-[350px] flex flex-col">
        <div className="flex justify-between items-center mb-2 border-b-2 border-lcd-fg pb-1">
          <h3 className="text-sm font-pixel">ÇANTA</h3>
          <button
            onClick={onClose}
            className="text-xs hover:bg-black/10 px-1 font-bold"
          >
            X
          </button>
        </div>

        <div className="flex gap-1 mb-2">
          <button
            onClick={() => setTab('FOOD')}
            className={`text-[10px] px-2 py-1 border-2 border-black ${
              tab === 'FOOD'
                ? 'bg-black text-white'
                : 'bg-transparent'
            }`}
          >
            Yiyecek
          </button>
          <button
            onClick={() => setTab('TOY')}
            className={`text-[10px] px-2 py-1 border-2 border-black ${
              tab === 'TOY'
                ? 'bg-black text-white'
                : 'bg-transparent'
            }`}
          >
            Oyuncak
          </button>
          <button
            onClick={() => setTab('ACCESSORY')}
            className={`text-[10px] px-2 py-1 border-2 border-black ${
              tab === 'ACCESSORY'
                ? 'bg-black text-white'
                : 'bg-transparent'
            }`}
          >
            Aksesuar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 content-start">
          {visibleItems.length === 0 ? (
            <div className="col-span-2 text-center text-xs opacity-50 py-4">
              Boş...
            </div>
          ) : (
            visibleItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="flex flex-col items-center p-2 border-2 border-lcd-fg/50 hover:bg-black/10 active:translate-y-1 transition-all"
              >
                <div className="w-8 h-8 mb-1">
                  <ProceduralIcon
                    type={item.image}
                    size={32}
                  />
                </div>
                <span className="text-[10px]">
                  {item.name}
                </span>
                <span className="text-[10px] font-bold">
                  x{inventory[item.id]}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- Character Component ---

const DragonCharacter = ({
  dragon,
  onClick,
  overrideMode,
}: {
  dragon: GameState['dragon'];
  onClick: (e: React.MouseEvent) => void;
  overrideMode?: string | null;
}) => {
  let visualStage: 'baby' | 'adult' | 'old' = 'baby';
  if (dragon.stage === DragonStage.ELDER) {
    visualStage = 'old';
  } else if (
    dragon.stage === DragonStage.ADULT ||
    dragon.stage === DragonStage.TEEN
  ) {
    visualStage = 'adult';
  } else {
    visualStage = 'baby';
  }

  let scale = 1;
  if (visualStage === 'baby') scale = 0.9;
  if (visualStage === 'adult') scale = 1.1;
  if (visualStage === 'old') scale = 1.0;

  let mode = 'idle';
  let emote: string | null = null;

  if (overrideMode) {
    mode = overrideMode;
  } else {
    if (dragon.isSleeping) {
      mode = 'sleepy';
    } else if (dragon.hunger < 30) {
      mode = 'angry';
      emote = '🍔';
    } else if (dragon.happiness < 30) {
      mode = 'angry';
      emote = '💔';
    } else if (dragon.happiness > 80) {
      mode = 'happy';
      emote = '💖';
    }
  }

  return (
    <div
      className="w-full h-full cursor-pointer flex items-center justify-center relative"
      onClick={onClick}
    >
      <div
        className="w-full h-full transition-all duration-500 origin-bottom active:scale-95"
        style={{ transform: `scale(${scale})` }}
      >
        <ProceduralDragon
          stage={visualStage}
          mode={mode}
          accessory={dragon.equippedAccessory}
        />
      </div>
      {emote && (
        <div className="absolute -top-4 right-2 bg-white border-2 border-black p-1 text-lg animate-bounce-pixel shadow-pixel z-10">
          {emote}
        </div>
      )}
    </div>
  );
};

// --- Screens ---

const StartScreen = ({
  onStart,
  onContinue,
  hasSave,
}: {
  onStart: () => void;
  onContinue: () => void;
  hasSave: boolean;
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 bg-pixel-dark text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[#7f1d1d] mix-blend-multiply" />
      <div className="relative z-10 text-center space-y-2 bg-pixel-dark/90 p-6 border-4 border-white shadow-pixel backdrop-blur-sm">
        <h1 className="text-2xl sm:text-4xl leading-tight text-shadow-pixel tracking-tighter text-[#ef4444]">
          DRACO THE
          <br />
          PIXEL DRAGON
        </h1>
      </div>
      <div className="relative z-10 flex flex-col w-full max-w-xs gap-4">
        <PixelButton
          onClick={onStart}
          className="w-full"
          variant="primary"
        >
          YENİ OYUN
        </PixelButton>
        <PixelButton
          onClick={onContinue}
          disabled={!hasSave}
          className="w-full"
        >
          DEVAM ET
        </PixelButton>
      </div>
    </div>
  );
};

const HatchingScreen = ({
  onHatchTick,
}: {
  onHatchTick: () => void;
}) => {
  const [cracks, setCracks] = useState(0);

  const handleClick = () => {
    setCracks((prev) => prev + 1);
    onHatchTick();
  };

  return (
    <LcdScreen className="flex flex-col items-center justify-between py-8">
      <div className="text-center space-y-2">
        <h2 className="text-sm">YUMURTA</h2>
      </div>
      <div
        className="relative w-48 h-48 flex items-center justify-center cursor-pointer active:scale-95 transition-transform animate-wobble"
        onClick={handleClick}
      >
        <div
          className={`transform scale-[4] ${
            cracks > 0 ? 'animate-shiver' : ''
          }`}
        >
          <ProceduralIcon type="EGG" size={48} />
        </div>
        <div className="absolute -bottom-8 left-0 w-full text-center text-xs animate-pulse font-bold mt-4">
          DOKUN!
        </div>
      </div>
    </LcdScreen>
  );
};

const StatBar = ({
  icon,
  value,
  reverse = false,
}: {
  icon: string;
  value: number;
  reverse?: boolean;
}) => {
  return (
    <div
      className={`flex items-center gap-1 w-full max-w-[120px] ${
        reverse ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <span className="material-symbols-outlined text-lg">
        {icon}
      </span>
      <div className="flex-1 h-4 border-2 border-lcd-fg p-[1px]">
        <div
          className="h-full bg-lcd-fg"
          style={{
            width: `${Math.min(100, value)}%`,
            backgroundImage:
              'linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.2) 50%)',
            backgroundSize: '4px 100%',
          }}
        />
      </div>
    </div>
  );
};

const MainGameScreen = ({
  gameState,
  onAction,
  onNavigate,
  onPet,
  notifications,
  onMiniGameComplete,
  onRequestNotify,
  hasNotifyPermission,
}: {
  gameState: GameState;
  onAction: (action: any) => void;
  onNavigate: (s: Screen) => void;
  onPet: () => void;
  notifications: FloatingText[];
  onMiniGameComplete: (
    result: 'WIN' | 'LOSE' | 'DRAW',
    game: MiniGameType,
  ) => void;
  onRequestNotify: () => void;
  hasNotifyPermission: boolean;
}) => {
  const { dragon, weather } = gameState;
  const [showInventory, setShowInventory] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [actionAnimation, setActionAnimation] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (actionAnimation) {
      const timer = setTimeout(
        () => setActionAnimation(null),
        2000,
      );
      return () => clearTimeout(timer);
    }
  }, [actionAnimation]);

  const handleScreenClick = (e: React.MouseEvent) => {
    if (dragon.isSleeping) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(15, Math.min(85, x));
    const clampedY = Math.max(30, Math.min(75, y));
    setPosition({ x: clampedX, y: clampedY });
  };

  const handleItemSelect = (item: Item) => {
    setShowInventory(false);
    if (item.type === 'FOOD') {
      onAction({ type: 'USE_ITEM', item });
      if (item.id.includes('potion')) {
        setActionAnimation('rainbow');
      } else {
        setActionAnimation('feeding');
      }
    } else if (item.type === 'TOY') {
      onAction({ type: 'USE_ITEM', item });
      setActionAnimation('playing');
    } else if (item.type === 'ACCESSORY') {
      onAction({ type: 'EQUIP', item });
    }
  };

  return (
    <LcdScreen
      className="flex flex-col relative"
      isNight={dragon.isSleeping}
      onClick={handleScreenClick}
    >
      <Clouds />
      <WeatherOverlay weather={weather} />
      <FloatingTextOverlay items={notifications} />

      {/* HUD */}
      <div className="flex justify-between items-start mb-4 relative z-30 pointer-events-none">
        <div className="flex flex-col gap-2 w-1/2">
          <StatBar icon="nutrition" value={dragon.hunger} />
          <StatBar icon="favorite" value={dragon.happiness} />
        </div>
        <div className="flex flex-col gap-2 w-1/2 items-end">
          <StatBar
            icon="cleaning_services"
            value={dragon.hygiene}
            reverse
          />
          <StatBar
            icon="bolt"
            value={dragon.energy}
            reverse
          />
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative z-0 overflow-hidden">
        <div
          className="absolute w-48 h-48 transition-all duration-700 ease-in-out"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <DragonCharacter
            dragon={dragon}
            onClick={(e) => {
              e.stopPropagation();
              onPet();
            }}
            overrideMode={actionAnimation}
          />
        </div>

        {Array.from({ length: dragon.poops }).map((_, i) => (
          <span
            key={i}
            className="absolute bottom-4 text-2xl font-pixel animate-bounce z-20"
            style={{ right: `${20 + i * 24}px` }}
          >
            💩
          </span>
        ))}

        {dragon.isSleeping && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs animate-pulse bg-black/50 px-2 py-1">
            Uyuyor...
          </div>
        )}
      </div>

      {/* Üst küçük butonlar */}
      <div className="flex justify-between items-center mt-1 px-1 relative z-30 pointer-events-auto mb-1">
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(Screen.STATS);
            }}
            disabled={dragon.isSleeping}
            className="hover:bg-black/10 p-1 rounded"
          >
            <span className="material-symbols-outlined">
              bar_chart
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(Screen.MARKET);
            }}
            disabled={dragon.isSleeping}
            className="hover:bg-black/10 p-1 rounded"
          >
            <span className="material-symbols-outlined">
              storefront
            </span>
          </button>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestNotify();
          }}
          className={`hover:bg-black/10 p-1 rounded ${
            hasNotifyPermission
              ? 'text-black opacity-50'
              : 'text-red-600 animate-bounce'
          }`}
        >
          <span className="material-symbols-outlined">
            {hasNotifyPermission
              ? 'notifications_active'
              : 'notifications_off'}
          </span>
        </button>
      </div>

      {/* Alt kontrol butonları */}
      <div className="grid grid-cols-4 gap-2 mt-1 relative z-30 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowInventory(true);
          }}
          disabled={dragon.isSleeping}
          className="flex flex-col items-center p-2 border-2 border-lcd-fg hover:bg-black/10 active:translate-y-1 bg-lcd-bg"
        >
          <span className="material-symbols-outlined">
            backpack
          </span>
          <span className="text-[10px] mt-1 hidden sm:block">
            ÇANTA
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMiniGame(true);
          }}
          disabled={dragon.isSleeping || dragon.energy < 10}
          className="flex flex-col items-center p-2 border-2 border-lcd-fg hover:bg-black/10 active:translate-y-1 bg-lcd-bg disabled:opacity-50"
        >
          <span className="material-symbols-outlined">
            sports_esports
          </span>
          <span className="text-[10px] mt-1 hidden sm:block">
            OYUNLAR
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction({ type: 'CLEAN' });
          }}
          disabled={dragon.isSleeping}
          className="flex flex-col items-center p-2 border-2 border-lcd-fg hover:bg-black/10 active:translate-y-1 bg-lcd-bg"
        >
          <span className="material-symbols-outlined">soap</span>
          <span className="text-[10px] mt-1 hidden sm:block">
            TEMİZLE
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction({ type: 'SLEEP' });
          }}
          className={`flex flex-col items-center p-2 border-2 border-lcd-fg hover:bg-black/10 active:translate-y-1 transition-all ${
            dragon.isSleeping ? 'bg-black text-white' : 'bg-lcd-bg'
          }`}
        >
          <span className="material-symbols-outlined">
            bedtime
          </span>
          <span className="text-[10px] mt-1 hidden sm:block">
            UYKU
          </span>
        </button>
      </div>

      {showInventory && (
        <InventoryModal
          inventory={gameState.inventory}
          onClose={() => setShowInventory(false)}
          onSelect={handleItemSelect}
        />
      )}

      {showMiniGame && (
        <MiniGameModal
          onClose={() => setShowMiniGame(false)}
          onComplete={(res, game) => {
            onMiniGameComplete(res, game);
            setShowMiniGame(false);
          }}
        />
      )}
    </LcdScreen>
  );
};

const MarketScreen = ({
  gameState,
  onBuy,
  onNavigate,
}: {
  gameState: GameState;
  onBuy: (item: Item) => void;
  onNavigate: (s: Screen) => void;
}) => {
  const [tab, setTab] = useState<'FOOD' | 'TOY' | 'ACCESSORY'>(
    'FOOD',
  );
  const filteredItems = ITEMS.filter(
    (item) => item.type === tab,
  );

  return (
    <div className="h-full bg-[#0D0D0D] text-[#C2D5C4] font-pixel p-4 flex flex-col border-4 border-gray-600">
      <div className="flex justify-between items-center border-b-4 border-[#C2D5C4] pb-4 mb-4">
        <h1 className="text-sm text-[#facc15]">PAZAR</h1>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#facc15]">
            monetization_on
          </span>
          <span>{gameState.currency}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setTab('FOOD')}
          className={`px-2 py-2 text-xs border-2 border-[#C2D5C4] ${
            tab === 'FOOD'
              ? 'bg-[#C2D5C4] text-black'
              : 'text-[#C2D5C4]'
          }`}
        >
          Yiyecek
        </button>
        <button
          onClick={() => setTab('TOY')}
          className={`px-2 py-2 text-xs border-2 border-[#C2D5C4] ${
            tab === 'TOY'
              ? 'bg-[#C2D5C4] text-black'
              : 'text-[#C2D5C4]'
          }`}
        >
          Oyuncak
        </button>
        <button
          onClick={() => setTab('ACCESSORY')}
          className={`px-2 py-2 text-xs border-2 border-[#C2D5C4] ${
            tab === 'ACCESSORY'
              ? 'bg-[#C2D5C4] text-black'
              : 'text-[#C2D5C4]'
          }`}
        >
          Aksesuar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-4 pr-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="border-4 border-[#C2D5C4] p-2 flex flex-col gap-2 relative bg-[#111]"
          >
            <div className="bg-[#1a1a1a] aspect-square w-full flex items-center justify-center border-2 border-[#C2D5C4]/30">
              <div className="w-full h-full p-2 flex items-center justify-center">
                <ProceduralIcon
                  type={item.image}
                  size={48}
                />
              </div>
            </div>
            <div className="text-[10px] leading-tight h-5 truncate text-center mt-1">
              {item.name}
            </div>
            <div className="flex justify-between items-center mt-auto border-t border-[#C2D5C4]/20 pt-2">
              <span className="text-xs text-[#facc15]">
                {item.price} G
              </span>
              <button
                onClick={() => onBuy(item)}
                disabled={gameState.currency < item.price}
                className="bg-[#C2D5C4] text-[#0D0D0D] px-2 py-1 text-[10px] hover:bg-white disabled:opacity-50 transition-all font-bold"
              >
                {gameState.currency < item.price ? 'YOK' : 'AL'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t-4 border-[#C2D5C4] flex justify-center">
        <button
          onClick={() => onNavigate(Screen.MAIN)}
          className="text-xs hover:text-white p-2 animate-pulse"
        >
          &lt; ANA EKRANA DÖN
        </button>
      </div>
    </div>
  );
};

const StatsScreen = ({
  gameState,
  onNavigate,
}: {
  gameState: GameState;
  onNavigate: (s: Screen) => void;
}) => {
  const { dragon } = gameState;
  let visualStage: 'baby' | 'adult' | 'old' = 'baby';
  if (dragon.stage === DragonStage.ELDER) {
    visualStage = 'old';
  } else if (
    dragon.stage === DragonStage.ADULT ||
    dragon.stage === DragonStage.TEEN
  ) {
    visualStage = 'adult';
  }

  return (
    <div className="h-full bg-[#d4b4b4] text-black font-retro text-xl p-4 flex flex-col border-8 border-black relative">
      <div className="flex justify-between items-center border-b-4 border-black pb-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined">
            pets
          </span>
          <span>{dragon.name}</span>
        </div>
        <div className="flex items-center gap-2 text-lg">
          <span>LVL {dragon.evolutionStage}</span>
          <span className="material-symbols-outlined">
            signal_cellular_alt
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="w-32 h-32 border-4 border-black bg-[#8a9980] p-2">
          <ProceduralDragon
            stage={visualStage}
            mode="idle"
            accessory={dragon.equippedAccessory}
            className="mix-blend-multiply"
          />
        </div>
        <div className="w-full max-w-[200px] border-4 border-black mt-2 p-[2px] bg-black/10 relative h-8">
          <div
            className="h-full bg-black"
            style={{
              width: `${Math.min(
                100,
                (dragon.xp / dragon.maxXp) * 100,
              )}%`,
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#9EAE94] mix-blend-difference">
            XP: {Math.floor(dragon.xp)}/{dragon.maxXp}
          </span>
        </div>
        <div className="text-xs text-center mt-2 font-pixel opacity-70">
          {dragon.stage}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-lg">
        <div className="flex justify-between border-b-2 border-black/20">
          <span>GÜÇ</span>
          <span>{dragon.stats.str}</span>
        </div>
        <div className="flex justify-between border-b-2 border-black/20">
          <span>DAY</span>
          <span>{dragon.stats.vit}</span>
        </div>
        <div className="flex justify-between border-b-2 border-black/20">
          <span>ZEKA</span>
          <span>{dragon.stats.int}</span>
        </div>
        <div className="flex justify-between border-b-2 border-black/20">
          <span>CEV</span>
          <span>{dragon.stats.agi}</span>
        </div>
      </div>

      <div className="mt-auto text-sm text-center opacity-70 mb-2">
        YAŞ: {Math.floor(dragon.age)} GÜN
      </div>

      <button
        onClick={() => onNavigate(Screen.MAIN)}
        className="w-full py-4 bg-black text-[#d4b4b4] text-center hover:opacity-90 active:scale-95 transition-transform border-4 border-transparent hover:border-white"
      >
        GERİ DÖN
      </button>
    </div>
  );
};

// --- Root App ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    ...INITIAL_GAME_STATE,
    dragon: {
      ...INITIAL_GAME_STATE.dragon,
      name: 'DRACO',
    },
  });

  const [hasSave, setHasSave] = useState(false);
  const [notifications, setNotifications] = useState<FloatingText[]>(
    [],
  );
  const [hasNotifyPermission, setHasNotifyPermission] =
    useState(false);

  const tickRef = useRef<number | null>(null);
  const lastNotificationTime = useRef<number>(0);

  // Load save + notification permission
  useEffect(() => {
    const saved = localStorage.getItem('dragon_save');
    if (saved) {
      setHasSave(true);
    }
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      setHasNotifyPermission(true);
    }
  }, []);

  const requestNotify = async () => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setHasNotifyPermission(true);
      addNotification('BİLDİRİMLER AÇIK', '#16a34a');
    }
  };

  const trySendNotification = (title: string, body: string) => {
    if (typeof window === 'undefined') return;
    if (!hasNotifyPermission) return;
    const now = Date.now();
    if (now - lastNotificationTime.current < 600000) return;
    if (document.visibilityState === 'hidden') {
      new Notification(title, { body });
      lastNotificationTime.current = now;
    }
  };

  const addNotification = (text: string, color = '#21221d') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [
      ...prev,
      {
        id,
        text,
        x: 40 + Math.random() * 20 - 10,
        y: 40 + Math.random() * 20 - 10,
        color,
      },
    ]);
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== id),
      );
    }, 1500);
  };

  useEffect(() => {
    if (gameState.screen === Screen.START) return;

    tickRef.current = window.setInterval(() => {
      setGameState((prev) => {
        if (prev.dragon.stage === DragonStage.EGG) {
          return prev;
        }

        const isSleeping = prev.dragon.isSleeping;
        const accessory = prev.dragon.equippedAccessory;

        const hungerDecay = isSleeping ? 0.05 : 0.2;
        const newHunger = Math.max(
          0,
          prev.dragon.hunger - hungerDecay,
        );

        let newEnergy = isSleeping
          ? Math.min(100, prev.dragon.energy + 1.5)
          : Math.max(0, prev.dragon.energy - 0.1);

        let newHygiene = Math.max(
          0,
          prev.dragon.hygiene - 0.05,
        );
        let newPoops = prev.dragon.poops;
        if (
          newHygiene < 60 &&
          prev.dragon.poops === 0 &&
          Math.random() < 0.05
        ) {
          newPoops++;
        }

        let happinessDecay = 0.1;
        if (newHunger < 20) happinessDecay += 0.2;
        if (newHygiene < 40) happinessDecay += 0.2;
        if (accessory === 'glasses') {
          happinessDecay *= 0.7;
        }

        const newHappiness = Math.max(
          0,
          prev.dragon.happiness -
            (isSleeping ? 0 : happinessDecay),
        );

        let newSleeping = isSleeping;
        if (isSleeping && newEnergy >= 100) {
          newSleeping = false;
        }

        let newStage = prev.dragon.stage;
        let newEvolutionStage = prev.dragon.evolutionStage;
        let newMaxXp = prev.dragon.maxXp;
        let newXp = prev.dragon.xp;

        if (accessory === 'hat') {
          newXp += 0.05;
        }

        if (newXp >= newMaxXp) {
          newXp -= newMaxXp;
          newEvolutionStage++;
          newMaxXp = Math.floor(newMaxXp * 1.5);
          if (newEvolutionStage === 3) {
            newStage = DragonStage.TEEN;
          }
          if (newEvolutionStage === 5) {
            newStage = DragonStage.ADULT;
          }
          if (newEvolutionStage === 8) {
            newStage = DragonStage.ELDER;
          }
        }

        let newWeather = prev.weather;
        if (Math.random() < 0.005) {
          newWeather =
            prev.weather === 'SUNNY' ? 'RAIN' : 'SUNNY';
        }

        if (newHunger < 30) {
          trySendNotification(
            'Draco Acıktı!',
            'Ejderhanın karnı gurulduyor!',
          );
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
            isSleeping: newSleeping,
            xp: newXp,
            maxXp: newMaxXp,
            evolutionStage: newEvolutionStage,
            stage: newStage,
            age: prev.dragon.age + 0.01,
          },
        };
      });
    }, 1000);

    const saveInterval = window.setInterval(() => {
      localStorage.setItem(
        'dragon_save',
        JSON.stringify(gameState),
      );
    }, 30000);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
      }
      clearInterval(saveInterval);
    };
  }, [gameState.screen, hasNotifyPermission, gameState]);

  const handleAction = (action: any) => {
    const type = typeof action === 'string' ? action : action.type;

    setGameState((prev) => {
      const d = { ...prev.dragon };
      let inv = { ...prev.inventory };
      let currency = prev.currency;

      if (type === 'USE_ITEM') {
        const item = action.item as Item;
        if (inv[item.id] > 0) {
          inv[item.id]--;
          d.hunger = Math.min(
            100,
            d.hunger + (item.effect.hunger || 0),
          );
          d.happiness = Math.min(
            100,
            d.happiness + (item.effect.happiness || 0),
          );
          d.energy = Math.min(
            100,
            d.energy + (item.effect.energy || 0),
          );
          d.health = Math.min(
            100,
            d.health + (item.effect.health || 0),
          );
          if (item.type === 'TOY') {
            d.energy = Math.max(0, d.energy - 5);
          }
          addNotification(
            item.type === 'FOOD' ? 'YEDİ' : 'OYNADI',
            '#16a34a',
          );
        }
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
      } else if (type === 'PLAY') {
        if (d.energy < 20) {
          addNotification('ÇOK YORGUN!', '#dc2626');
          return prev;
        }
        d.happiness = Math.min(100, d.happiness + 15);
        d.energy = Math.max(0, d.energy - 15);
        d.xp += 5;
        addNotification('MUTLU!', '#eab308');
      } else if (type === 'CLEAN') {
        d.hygiene = 100;
        if (d.poops > 0) {
          if (Math.random() < 0.2) {
            currency += 50;
            addNotification('ALTIN BULDUN!', '#facc15');
          } else {
            addNotification('TERTEMİZ!', '#0ea5e9');
          }
        } else {
          addNotification('ZATEN TEMİZ', '#0ea5e9');
        }
        d.poops = 0;
      } else if (type === 'SLEEP') {
        d.isSleeping = !d.isSleeping;
      }

      return { ...prev, dragon: d, inventory: inv, currency };
    });
  };

  const handleMiniGameComplete = (
    result: 'WIN' | 'LOSE' | 'DRAW',
    game: MiniGameType,
  ) => {
    setGameState((prev) => {
      let bonusGold = 0;
      let mood = 0;
      let energyCost = 10;
      let xpGain = 10;

      if (result === 'WIN') {
        bonusGold = 50;
        mood = 20;
        xpGain = 20;
      } else if (result === 'DRAW') {
        bonusGold = 20;
        mood = 10;
        xpGain = 10;
      } else {
        bonusGold = 5;
        mood = 5;
        xpGain = 5;
      }

      if (game === 'FLAME_SHOW') {
        bonusGold += 20;
        xpGain += 10;
      }

      return {
        ...prev,
        currency: prev.currency + bonusGold,
        dragon: {
          ...prev.dragon,
          happiness: Math.min(
            100,
            prev.dragon.happiness + mood,
          ),
          energy: Math.max(
            0,
            prev.dragon.energy - energyCost,
          ),
          xp: prev.dragon.xp + xpGain,
        },
      };
    });

    if (result === 'WIN') {
      addNotification('KAZANDIN!', '#16a34a');
    } else if (result === 'DRAW') {
      addNotification('BERABERE', '#eab308');
    } else {
      addNotification('KAYBETTİN...', '#dc2626');
    }
  };

  const handleBuy = (item: Item) => {
    setGameState((prev) => {
      if (prev.currency < item.price) {
        addNotification('PARA YETERSİZ', '#dc2626');
        return prev;
      }
      const newInv = {
        ...prev.inventory,
        [item.id]: (prev.inventory[item.id] || 0) + 1,
      };
      addNotification('SATIN ALINDI', '#facc15');
      return {
        ...prev,
        currency: prev.currency - item.price,
        inventory: newInv,
      };
    });
  };

  const handleHatch = () => {
    setGameState((prev) => ({
      ...prev,
      dragon: { ...prev.dragon, stage: DragonStage.BABY },
    }));
    addNotification('DOĞDU!', '#ef4444');
  };

  if (gameState.screen === Screen.START) {
    return (
      <StartScreen
        onStart={() =>
          setGameState((prev) => ({
            ...prev,
            screen: Screen.HATCH,
          }))
        }
        onContinue={() => {
          const saved = localStorage.getItem('dragon_save');
          if (saved) {
            setGameState(JSON.parse(saved));
          }
        }}
        hasSave={hasSave}
      />
    );
  }

  if (gameState.dragon.stage === DragonStage.EGG) {
    return (
      <HatchingScreen
        onHatchTick={() => {
          if (Math.random() > 0.8) {
            setTimeout(handleHatch, 500);
          }
        }}
      />
    );
  }

  if (gameState.screen === Screen.MARKET) {
    return (
      <MarketScreen
        gameState={gameState}
        onBuy={handleBuy}
        onNavigate={(s) =>
          setGameState((prev) => ({ ...prev, screen: s }))
        }
      />
    );
  }

  if (gameState.screen === Screen.STATS) {
    return (
      <StatsScreen
        gameState={gameState}
        onNavigate={(s) =>
          setGameState((prev) => ({ ...prev, screen: s }))
        }
      />
    );
  }

  return (
    <MainGameScreen
      gameState={gameState}
      onAction={handleAction}
      onNavigate={(s) =>
        setGameState((prev) => ({ ...prev, screen: s }))
      }
      onPet={() => {
        setGameState((prev) => ({
          ...prev,
          dragon: {
            ...prev.dragon,
            happiness: Math.min(
              100,
              prev.dragon.happiness + 5,
            ),
          },
        }));
        addNotification('SEVİLDİ <3', '#f472b6');
      }}
      notifications={notifications}
      onMiniGameComplete={handleMiniGameComplete}
      onRequestNotify={requestNotify}
      hasNotifyPermission={hasNotifyPermission}
    />
  );
}
