import React from 'react';
import { Volume2, VolumeX, Music, BookOpen, Pause, Play, RotateCcw } from 'lucide-react';
import { sound } from '../game/sound';

interface ArcadeHUDProps {
  score: number;
  highScore: number;
  levelName: string;
  stageNum: number;
  distance: number;
  distancePercent: number;
  rocketFuel: number;
  tntCount: number;
  springsCount: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenManual: () => void;
  onRestart: () => void;
}

export const ArcadeHUD: React.FC<ArcadeHUDProps> = ({
  score,
  highScore,
  levelName,
  stageNum,
  distance,
  distancePercent,
  rocketFuel,
  tntCount,
  springsCount,
  isPaused,
  onTogglePause,
  onOpenManual,
  onRestart
}) => {
  const [sfxOn, setSfxOn] = React.useState(sound.isSfxOn());
  const [bgmOn, setBgmOn] = React.useState(sound.isBgmOn());

  const toggleSfx = () => {
    const next = !sfxOn;
    sound.setSfxEnabled(next);
    setSfxOn(next);
    if (next) sound.playPickup();
  };

  const toggleBgm = () => {
    const next = !bgmOn;
    sound.setBgmEnabled(next);
    setBgmOn(next);
  };

  const isClose = distance < 180;

  return (
    <header className="w-full bg-[#1b0a03]/90 border-b-2 border-[#ff9100] px-3 py-2 text-white shadow-lg backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
        
        {/* Zone 1: Brand & Stage Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-['Bangers'] tracking-wider text-lg md:text-xl text-[#ffeb3b] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            <span className="text-xl">🏜️</span>
            <span>DESERT DEMOLITION</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black/50 border border-[#ff9100]/40 font-mono text-[11px]">
            <span className="text-[#ffab00] font-bold">STAGE {stageNum}:</span>
            <span className="text-stone-300 truncate max-w-[140px]">{levelName}</span>
          </div>
        </div>

        {/* Zone 2: Distance Radar Track */}
        <div className="flex-1 min-w-[200px] max-w-sm mx-auto flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-mono px-1">
            <span className="text-stone-300 flex items-center gap-1">
              <span>🐺 威利狼</span>
            </span>
            <span className={`font-bold font-mono transition-colors ${isClose ? 'text-[#00e676] animate-pulse' : 'text-[#ffcc00]'}`}>
              {isClose ? '🎯 進入捕獲範圍！' : `距離: ${distance}m`}
            </span>
            <span className="text-[#00e5ff] flex items-center gap-1">
              <span>嗶嗶鳥 🐦</span>
            </span>
          </div>

          <div className="relative h-4 w-full bg-[#120501] border-2 border-[#ff9100] rounded-full overflow-hidden p-0.5 shadow-inner">
            {/* Fill gradient */}
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                isClose
                  ? 'bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500'
                  : 'bg-gradient-to-r from-amber-600 to-yellow-400'
              }`}
              style={{ width: `${distancePercent}%` }}
            />

            {/* Moving Coyote marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-2 text-xs transition-all pointer-events-none"
              style={{ left: `${Math.min(92, Math.max(8, distancePercent))}%` }}
            >
              🐺
            </div>
          </div>
        </div>

        {/* Zone 3: Score & ACME Arsenal */}
        <div className="flex items-center gap-3">
          {/* Rocket fuel meter */}
          <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-red-500/50">
            <span className="text-xs" title="火箭推進燃料 [Z]">🚀</span>
            <div className="w-14 h-2.5 bg-stone-800 rounded-full overflow-hidden border border-stone-600">
              <div
                className={`h-full transition-all duration-100 ${
                  rocketFuel > 30 ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-red-600 animate-pulse'
                }`}
                style={{ width: `${rocketFuel}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-amber-300 w-6 text-right tabular-nums">
              {Math.round(rocketFuel)}%
            </span>
          </div>

          {/* ACME Springs & TNT counters */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded border border-yellow-500/40 text-yellow-300" title="超級彈簧 [X]">
              <span>🦘</span>
              <span className="font-bold tabular-nums">x{springsCount}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded border border-red-500/40 text-red-300" title="ACME炸藥 [C]">
              <span>💣</span>
              <span className="font-bold tabular-nums">x{tntCount}</span>
            </div>
          </div>

          {/* Score display */}
          <div className="font-mono text-right flex flex-col">
            <span className="text-[10px] text-stone-400">SCORE</span>
            <span className="font-bold text-[#ffeb3b] text-sm tabular-nums tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {score.toString().padStart(6, '0')}
            </span>
          </div>

          {/* Controls & Modals */}
          <div className="flex items-center gap-1 pl-1 border-l border-white/20">
            <button
              onClick={toggleSfx}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${sfxOn ? 'text-amber-400' : 'text-stone-500'}`}
              title={sfxOn ? '關閉音效' : '開啟音效'}
            >
              {sfxOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={toggleBgm}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${bgmOn ? 'text-emerald-400' : 'text-stone-500'}`}
              title={bgmOn ? '關閉音樂' : '開啟音樂'}
            >
              <Music size={16} />
            </button>
            <button
              onClick={onOpenManual}
              className="p-1.5 rounded hover:bg-white/10 text-stone-300 transition-colors"
              title="ACME 說明手冊"
            >
              <BookOpen size={16} />
            </button>
            <button
              onClick={onTogglePause}
              className="p-1.5 rounded hover:bg-white/10 text-stone-300 transition-colors"
              title={isPaused ? '繼續遊戲' : '暫停'}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
