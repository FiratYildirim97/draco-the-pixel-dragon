// src/App.tsx
import React, { useEffect, useState } from "react";
import { INITIAL_GAME_STATE, ITEMS } from "./constants";
import { GameState, Item, Screen } from "./types";

// -----------------------------
// Yardımcı tipler
// -----------------------------
type MiniGameId = "RPS" | "MATH" | "CATCH" | "FLY" | "DODGE" | null;

// -----------------------------
// Basit pixel icon sistemi
// (constants.ts içindeki image key’leriyle uyumlu)
// -----------------------------
const PIXEL_ART: Record<string, { grid: number[][]; palette: string[] }> = {
  APPLE: {
    grid: [
      [0, 0, 2, 2, 2, 0, 0, 0],
      [0, 2, 1, 1, 1, 2, 0, 0],
      [2, 1, 1, 1, 1, 1, 2, 0],
      [2, 1, 1, 1, 1, 1, 2, 0],
      [2, 1, 1, 1, 1, 1, 2, 0],
      [0, 2, 1, 1, 1, 2, 0, 0],
      [0, 0, 2, 2, 2, 0, 0, 0],
      [0, 0, 0, 3, 0, 0, 0, 0],
    ],
    palette: ["transparent", "#f87171", "#b91c1c", "#5c940d"],
  },
  FISH: {
    grid: [
      [0, 0, 4, 4, 0, 0, 0, 0],
      [0, 4, 1, 1, 4, 0, 0, 0],
      [4, 1, 1, 1, 1, 4, 0, 0],
      [4, 1, 1, 1, 1, 4, 0, 0],
      [0, 4, 1, 1, 4, 0, 0, 0],
      [0, 0, 4, 4, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    palette: ["transparent", "#38bdf8", "#0369a1", "#4c1d95", "#0ea5e9"],
  },
  BALL: {
    grid: [
      [0, 2, 2, 2, 0],
      [2, 1, 1, 1, 2],
      [2, 1, 1, 1, 2],
      [2, 1, 1, 1, 2],
      [0, 2, 2, 2, 0],
    ],
    palette: ["transparent", "#ef4444", "#b91c1c"],
  },
  POTION: {
    grid: [
      [0, 0, 3, 3, 0, 0],
      [0, 3, 1, 1, 3, 0],
      [3, 1, 2, 2, 1, 3],
      [3, 1, 2, 2, 1, 3],
      [0, 3, 1, 1, 3, 0],
      [0, 0, 3, 3, 0, 0],
    ],
    palette: ["transparent", "#8b5cf6", "#a855f7", "#701a75"],
  },
  STEAK: {
    grid: [
      [0, 3, 3, 3, 0],
      [3, 1, 1, 1, 3],
      [3, 1, 1, 1, 3],
      [0, 3, 3, 3, 0],
    ],
    palette: ["transparent", "#a16207", "#78350f", "#92400e"],
  },
  SALAD: {
    grid: [
      [0, 4, 4, 4, 0],
      [4, 1, 1, 1, 4],
      [4, 1, 1, 1, 4],
      [0, 4, 4, 4, 0],
    ],
    palette: ["transparent", "#22c55e", "#15803d", "#3f6212", "#14532d"],
  },
  PLUSH: {
    grid: [
      [0, 2, 2, 2, 0],
      [2, 1, 3, 1, 2],
      [2, 3, 1, 3, 2],
      [2, 1, 3, 1, 2],
      [0, 2, 2, 2, 0],
    ],
    palette: ["transparent", "#eec263", "#000000", "#cd803d"],
  },
  HAT: {
    grid: [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    palette: ["transparent", "#4f46e5", "#facc15"],
  },
  GLASSES: {
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 0, 0, 0],
      [1, 2, 1, 1, 2, 1, 0, 0],
      [1, 1, 0, 1, 1, 0, 0, 0],
    ],
    palette: ["transparent", "#000000", "#60a5fa"],
  },
  EGG: {
    grid: [
      [0, 0, 1, 1, 0, 0],
      [0, 1, 2, 2, 1, 0],
      [1, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 1],
      [0, 1, 2, 2, 1, 0],
      [0, 0, 1, 1, 0, 0],
    ],
    palette: ["transparent", "#fecaca", "#b91c1c"],
  },
};

const ProceduralIcon: React.FC<{ type: string; size?: number }> = ({
  type,
  size = 32,
}) => {
  const art = PIXEL_ART[type];
  if (!art) return null;
  const h = art.grid.length;
  const w = art.grid[0].length;
  const pixel = size / Math.max(w, h);

  return (
    <div
      style={{
        position: "relative",
        width: w * pixel,
        height: h * pixel,
      }}
    >
      {art.grid.map((row, y) =>
        row.map((val, x) => {
          if (!val) return null;
          return (
            <div
              key={`${x}-${y}`}
              style={{
                position: "absolute",
                left: x * pixel,
                top: y * pixel,
                width: pixel,
                height: pixel,
                backgroundColor: art.palette[val],
              }}
            />
          );
        })
      )}
    </div>
  );
};

// -----------------------------
// Stat bar
// -----------------------------
const StatBar: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div className="flex items-center gap-2 text-xs w-full">
    <span className="w-16">{label}</span>
    <div className="flex-1 h-3 bg-black/40 border border-black">
      <div
        className="h-full bg-lime-400"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  </div>
);

// -----------------------------
// Draco görseli (emoji tabanlı)
// -----------------------------
const DragonView: React.FC<{ dragon: GameState["dragon"] }> = ({ dragon }) => {
  let face = "🐉";
  if (dragon.isSleeping) face = "💤🐉";
  else if (dragon.happiness > 80) face = "😄🐉";
  else if (dragon.happiness < 30) face = "😠🐉";

  const size =
    dragon.stage === 3 /*TEEN*/ || dragon.stage === 4 /*ADULT*/
      ? 80
      : dragon.stage === 5 /*ELDER*/
      ? 96
      : 64;

  return (
    <div className="flex items-center justify-center">
      <span style={{ fontSize: size }}>{face}</span>
    </div>
  );
};

// -----------------------------
// Mini oyun seçim menüsü
// -----------------------------
const MiniGameMenu: React.FC<{
  onSelect: (id: MiniGameId) => void;
  onClose: () => void;
}> = ({ onSelect, onClose }) => {
  const games: { id: MiniGameId; name: string; icon: string }[] = [
    { id: "RPS", name: "TAŞ KAĞIT MAKAS", icon: "✊📄✂️" },
    { id: "MATH", name: "MATEMATİK", icon: "🧠" },
    { id: "CATCH", name: "ELMA YAKALA", icon: "🍎" },
    { id: "FLY", name: "UÇUŞ", icon: "🕊️" },
    { id: "DODGE", name: "ENGEL KAÇ", icon: "💨" },
  ];

  return (
    <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center p-4 text-white">
      <h2 className="text-lg font-bold mb-4">Mini Oyun Seç</h2>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className="p-3 border-2 border-white bg-black hover:bg-white hover:text-black text-xs font-bold"
          >
            <div className="text-xl mb-1">{g.icon}</div>
            <div>{g.name}</div>
          </button>
        ))}
      </div>
      <button
        className="mt-4 px-3 py-2 text-xs border-2 border-white"
        onClick={onClose}
      >
        KAPAT
      </button>
    </div>
  );
};

// -----------------------------
// Ana oyun alanı (LCD ekran)
// -----------------------------
const LcdScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full h-full bg-[#111827] text-[#e5e7eb] p-3 flex flex-col gap-2">
    {children}
  </div>
);

// -----------------------------
// Başlangıç ekranı
// -----------------------------
const StartScreen: React.FC<{
  onStart: () => void;
  onContinue: () => void;
  hasSave: boolean;
}> = ({ onStart, onContinue, hasSave }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white gap-6 p-4 text-center">
    <h1 className="text-3xl font-bold text-red-500">
      Draco the Pixel Dragon
    </h1>
    <p className="text-sm opacity-80">
      Dijital ejderhanı besle, oynat, büyüt. 🐉
    </p>
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <button
        onClick={onStart}
        className="py-3 bg-red-600 hover:bg-red-500 font-bold"
      >
        Yeni Oyun
      </button>
      <button
        onClick={onContinue}
        disabled={!hasSave}
        className="py-3 bg-gray-700 hover:bg-gray-600 font-bold disabled:opacity-40"
      >
        Devam Et
      </button>
    </div>
  </div>
);

// -----------------------------
// Ana Uygulama Bileşeni
// -----------------------------
const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    ...INITIAL_GAME_STATE,
    dragon: {
      ...INITIAL_GAME_STATE.dragon,
      name: "DRACO",
    },
  }));
  const [hasSave, setHasSave] = useState(false);
  const [showMiniMenu, setShowMiniMenu] = useState(false);
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameId>(null);
  const [miniGameMessage, setMiniGameMessage] = useState<string | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showMarket, setShowMarket] = useState(false);

  // Save yükleme
  useEffect(() => {
    const saved = localStorage.getItem("dragon_save");
    if (saved) setHasSave(true);
  }, []);

  // Oyun sırasında periyodik azalma/artış (her 1 sn)
  useEffect(() => {
    if (gameState.screen === Screen.START) return;

    const id = window.setInterval(() => {
      setGameState((prev) => {
        const d = { ...prev.dragon };

        // uyuyorsa enerji artışı, açlık yavaş azalsın
        if (d.isSleeping) {
          d.energy = Math.min(100, d.energy + 1.5);
          d.hunger = Math.max(0, d.hunger - 0.05);
        } else {
          d.energy = Math.max(0, d.energy - 0.2);
          d.hunger = Math.max(0, d.hunger - 0.3);
        }

        d.hygiene = Math.max(0, d.hygiene - 0.1);
        if (d.hygiene < 50 && Math.random() < 0.05) {
          d.poops += 1;
        }

        let happinessDecay = 0.15;
        if (d.hunger < 30) happinessDecay += 0.2;
        if (d.hygiene < 40) happinessDecay += 0.2;

        d.happiness = Math.max(0, d.happiness - happinessDecay);

        // Basit XP -> evrim
        d.xp += 0.1;
        if (d.xp >= d.maxXp) {
          d.xp = 0;
          d.evolutionStage += 1;
          d.maxXp = Math.floor(d.maxXp * 1.4);
          d.stage = d.stage + 1;
        }

        d.age = d.age + 0.01;

        return {
          ...prev,
          dragon: d,
        };
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [gameState.screen]);

  // Oyun state’ini localStorage’a kaydet
  useEffect(() => {
    if (gameState.screen !== Screen.START) {
      localStorage.setItem("dragon_save", JSON.stringify(gameState));
    }
  }, [gameState]);

  // Yardımcı: dragon’u update et
  const updateDragon = (fn: (d: GameState["dragon"]) => GameState["dragon"]) => {
    setGameState((prev) => ({
      ...prev,
      dragon: fn(prev.dragon),
    }));
  };

  // Envanterden item kullanma
  const handleUseItem = (item: Item) => {
    setGameState((prev) => {
      const amount = prev.inventory[item.id] || 0;
      if (amount <= 0) return prev;

      const newInv = { ...prev.inventory, [item.id]: amount - 1 };
      const d = { ...prev.dragon };

      d.hunger = Math.min(100, d.hunger + (item.effect.hunger || 0));
      d.happiness = Math.min(100, d.happiness + (item.effect.happiness || 0));
      d.energy = Math.min(100, d.energy + (item.effect.energy || 0));
      d.health = Math.min(100, d.health + (item.effect.health || 0));

      return { ...prev, inventory: newInv, dragon: d };
    });

    // İksir ise özel mesaj
    if (item.id.includes("potion")) {
      setMiniGameMessage("✨ Draco güçlendi!");
    }
  };

  // Marketten satın alma
  const handleBuy = (item: Item) => {
    setGameState((prev) => {
      if (prev.currency < item.price) return prev;
      const newInv = {
        ...prev.inventory,
        [item.id]: (prev.inventory[item.id] || 0) + 1,
      };
      return {
        ...prev,
        currency: prev.currency - item.price,
        inventory: newInv,
      };
    });
  };

  // Temizlik
  const handleClean = () => {
    updateDragon((d) => ({
      ...d,
      hygiene: 100,
      poops: 0,
      happiness: Math.min(100, d.happiness + 5),
    }));
  };

  // Uyku
  const handleSleepToggle = () => {
    updateDragon((d) => ({
      ...d,
      isSleeping: !d.isSleeping,
    }));
  };

  // Sevip okşama
  const handlePet = () => {
    updateDragon((d) => ({
      ...d,
      happiness: Math.min(100, d.happiness + 5),
    }));
  };

  // Mini oyun sonucu (ortak ödül mekanizması)
  const rewardFromMiniGame = (result: "WIN" | "LOSE" | "DRAW") => {
    setGameState((prev) => {
      const d = { ...prev.dragon };
      let currencyGain = 0;
      let xpGain = 0;
      let happyGain = 0;

      if (result === "WIN") {
        currencyGain = 30;
        xpGain = 10;
        happyGain = 15;
      } else if (result === "DRAW") {
        currencyGain = 10;
        xpGain = 5;
        happyGain = 5;
      } else {
        currencyGain = 3;
        xpGain = 2;
        happyGain = 0;
      }

      d.xp += xpGain;
      d.happiness = Math.min(100, d.happiness + happyGain);

      return {
        ...prev,
        dragon: d,
        currency: prev.currency + currencyGain,
      };
    });
  };

  // Mini oyunların içerik UI’si
  const renderMiniGame = () => {
    if (!activeMiniGame) return null;

    if (activeMiniGame === "RPS") {
      const options = ["TAŞ", "KAĞIT", "MAKAS"];
      const beats: Record<string, string> = {
        TAŞ: "MAKAS",
        KAĞIT: "TAŞ",
        MAKAS: "KAĞIT",
      };

      const onChoice = (choice: string) => {
        const cpu = options[Math.floor(Math.random() * 3)];
        let res: "WIN" | "LOSE" | "DRAW" = "DRAW";
        if (choice !== cpu) {
          res = beats[choice] === cpu ? "WIN" : "LOSE";
        }
        setMiniGameMessage(`Sen: ${choice} | Draco: ${cpu} → ${res}`);
        rewardFromMiniGame(res);
        setActiveMiniGame(null);
      };

      return (
        <div className="mt-2 border border-white/30 p-2 text-xs">
          <div className="font-bold mb-1">TAŞ KAĞIT MAKAS</div>
          <div className="flex gap-2">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => onChoice(o)}
                className="flex-1 py-1 border border-white/40 hover:bg-white hover:text-black"
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeMiniGame === "MATH") {
      const a = 2 + Math.floor(Math.random() * 5);
      const b = 1 + Math.floor(Math.random() * 5);
      const answer = a + b;
      const options = [answer, answer + 1, answer - 1, answer + 2].sort(
        () => Math.random() - 0.5
      );

      const onPick = (val: number) => {
        const res: "WIN" | "LOSE" = val === answer ? "WIN" : "LOSE";
        setMiniGameMessage(`${a} + ${b} = ${val} → ${res}`);
        rewardFromMiniGame(res === "WIN" ? "WIN" : "LOSE");
        setActiveMiniGame(null);
      };

      return (
        <div className="mt-2 border border-white/30 p-2 text-xs">
          <div className="font-bold mb-1">
            MATEMATİK: {a} + {b} = ?
          </div>
          <div className="grid grid-cols-2 gap-2">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => onPick(o)}
                className="py-1 border border-white/40 hover:bg-white hover:text-black"
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeMiniGame === "CATCH") {
      // Basit: her tıklamada WIN
      const onCatch = () => {
        setMiniGameMessage("🍎 Draco elmayı yakaladı! WIN");
        rewardFromMiniGame("WIN");
        setActiveMiniGame(null);
      };
      return (
        <div className="mt-2 border border-white/30 p-2 text-xs flex flex-col items-center">
          <div className="font-bold mb-1">ELMA YAKALA</div>
          <button
            onClick={onCatch}
            className="mt-1 px-4 py-2 border border-white bg-black hover:bg-white hover:text-black flex items-center gap-2"
          >
            <ProceduralIcon type="APPLE" size={20} />
            Yakala!
          </button>
        </div>
      );
    }

    if (activeMiniGame === "FLY") {
      const onFly = () => {
        setMiniGameMessage("🕊️ Draco gökyüzünde uçtu! WIN");
        rewardFromMiniGame("WIN");
        setActiveMiniGame(null);
      };
      return (
        <div className="mt-2 border border-white/30 p-2 text-xs">
          <div className="font-bold mb-1">UÇUŞ OYUNU</div>
          <button
            onClick={onFly}
            className="px-4 py-2 border border-white bg-black hover:bg-white hover:text-black"
          >
            Uçur
          </button>
        </div>
      );
    }

    if (activeMiniGame === "DODGE") {
      const onDodge = () => {
        const success = Math.random() > 0.4;
        const res: "WIN" | "LOSE" = success ? "WIN" : "LOSE";
        setMiniGameMessage(
          success ? "💨 Engelden kaçtı! WIN" : "💥 Çarptı! LOSE"
        );
        rewardFromMiniGame(res);
        setActiveMiniGame(null);
      };
      return (
        <div className="mt-2 border border-white/30 p-2 text-xs">
          <div className="font-bold mb-1">ENGEL KAÇ</div>
          <button
            onClick={onDodge}
            className="px-4 py-2 border border-white bg-black hover:bg-white hover:text-black"
          >
            Kaç!
          </button>
        </div>
      );
    }

    return null;
  };

  // Ekran: başlangıç mı, oyun mu?
  if (gameState.screen === Screen.START) {
    return (
      <StartScreen
        onStart={() =>
          setGameState({
            ...INITIAL_GAME_STATE,
            dragon: { ...INITIAL_GAME_STATE.dragon, name: "DRACO" },
            screen: Screen.MAIN,
          })
        }
        onContinue={() => {
          const saved = localStorage.getItem("dragon_save");
          if (!saved) return;
          try {
            const parsed = JSON.parse(saved);
            setGameState(parsed);
          } catch {
            /* ignore */
          }
        }}
        hasSave={hasSave}
      />
    );
  }

  const dragon = gameState.dragon;

  // Market / inventory filtreleri
  const foodItems = ITEMS.filter((i) => i.type === "FOOD");
  const toyItems = ITEMS.filter((i) => i.type === "TOY");
  const accessoryItems = ITEMS.filter((i) => i.type === "ACCESSORY");

  return (
    <LcdScreen>
      {/* Üst bar */}
      <div className="flex justify-between items-center text-xs mb-1">
        <div>
          <div className="font-bold">DRACO</div>
          <div className="opacity-70">
            Level {dragon.evolutionStage} • Yaş {dragon.age.toFixed(1)}
          </div>
        </div>
        <div className="text-right">
          <div>Altın: {gameState.currency}</div>
        </div>
      </div>

      {/* Stat barları */}
      <div className="grid grid-cols-2 gap-1 mb-2 text-[10px]">
        <StatBar label="Açlık" value={dragon.hunger} />
        <StatBar label="Mutluluk" value={dragon.happiness} />
        <StatBar label="Temizlik" value={dragon.hygiene} />
        <StatBar label="Enerji" value={dragon.energy} />
      </div>

      {/* Orta alan: Draco + mini oyunlar */}
      <div className="flex-1 flex flex-col border border-white/20 p-2 relative overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div
            className="cursor-pointer"
            onClick={() => {
              if (!dragon.isSleeping) handlePet();
            }}
          >
            <DragonView dragon={dragon} />
          </div>
        </div>

        {/* Mini oyunlar burada gösteriliyor */}
        {renderMiniGame()}

        {/* Mini oyun seçme menüsü overlay */}
        {showMiniMenu && (
          <MiniGameMenu
            onSelect={(id) => {
              setActiveMiniGame(id);
              setShowMiniMenu(false);
              setMiniGameMessage(null);
            }}
            onClose={() => setShowMiniMenu(false)}
          />
        )}

        {/* Mesaj alanı */}
        {miniGameMessage && (
          <div className="mt-2 text-[10px] border-t border-white/20 pt-1">
            {miniGameMessage}
          </div>
        )}
      </div>

      {/* En alt butonlar */}
      <div className="mt-2 grid grid-cols-4 gap-1 text-[10px]">
        <button
          onClick={() => setShowInventory((v) => !v)}
          className="py-2 border border-white/40 hover:bg-white hover:text-black"
        >
          ÇANTA
        </button>
        <button
          onClick={() => setShowMiniMenu(true)}
          className="py-2 border border-white/40 hover:bg-white hover:text-black"
        >
          OYUNLAR
        </button>
        <button
          onClick={handleClean}
          className="py-2 border border-white/40 hover:bg-white hover:text-black"
        >
          TEMİZLE
        </button>
        <button
          onClick={handleSleepToggle}
          className={`py-2 border border-white/40 ${
            dragon.isSleeping ? "bg-purple-600" : "hover:bg-white hover:text-black"
          }`}
        >
          {dragon.isSleeping ? "UYANIŞ" : "UYU"}
        </button>
      </div>

      {/* Çanta paneli */}
      {showInventory && (
        <div className="mt-2 border border-white/30 p-2 text-[10px] bg-black/40">
          <div className="flex justify-between mb-1">
            <span className="font-bold">ÇANTA</span>
            <button onClick={() => setShowInventory(false)}>Kapat</button>
          </div>

          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-auto">
            {ITEMS.map((item) => {
              const amount = gameState.inventory[item.id] || 0;
              if (amount <= 0) return null;
              return (
                <button
                  key={item.id}
                  onClick={() => handleUseItem(item)}
                  className="border border-white/30 p-1 flex flex-col items-center hover:bg-white hover:text-black"
                >
                  <ProceduralIcon type={item.image} size={20} />
                  <span className="mt-1 text-[9px] text-center">
                    {item.name}
                  </span>
                  <span className="mt-1 font-bold">x{amount}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowMarket((v) => !v)}
            className="mt-2 w-full py-1 border border-white/40 hover:bg-white hover:text-black"
          >
            {showMarket ? "Market Kapat" : "Markete Git"}
          </button>
        </div>
      )}

      {/* Market paneli */}
      {showInventory && showMarket && (
        <div className="mt-2 border border-amber-300/60 p-2 text-[10px] bg-black/60">
          <div className="font-bold mb-1 text-amber-300">MARKET</div>
          <div className="text-[9px] mb-1 opacity-80">
            Yiyecek, oyuncak ve aksesuarları satın al.
          </div>

          <div className="mb-1 font-semibold">Yiyecekler</div>
          <div className="grid grid-cols-3 gap-1 mb-2">
            {foodItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleBuy(item)}
                className="border border-white/30 p-1 flex flex-col items-center hover:bg-white hover:text-black"
              >
                <ProceduralIcon type={item.image} size={18} />
                <span className="text-[9px] text-center mt-1">
                  {item.name}
                </span>
                <span className="text-[9px] mt-1">{item.price} G</span>
              </button>
            ))}
          </div>

          <div className="mb-1 font-semibold">Oyuncaklar</div>
          <div className="grid grid-cols-3 gap-1 mb-2">
            {toyItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleBuy(item)}
                className="border border-white/30 p-1 flex flex-col items-center hover:bg-white hover:text-black"
              >
                <ProceduralIcon type={item.image} size={18} />
                <span className="text-[9px] text-center mt-1">
                  {item.name}
                </span>
                <span className="text-[9px] mt-1">{item.price} G</span>
              </button>
            ))}
          </div>

          <div className="mb-1 font-semibold">Aksesuarlar</div>
          <div className="grid grid-cols-3 gap-1">
            {accessoryItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleBuy(item)}
                className="border border-white/30 p-1 flex flex-col items-center hover:bg-white hover:text-black"
              >
                <ProceduralIcon type={item.image} size={18} />
                <span className="text-[9px] text-center mt-1">
                  {item.name}
                </span>
                <span className="text-[9px] mt-1">{item.price} G</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </LcdScreen>
  );
};

export default App;
