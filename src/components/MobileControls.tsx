import React from 'react';
import { GameEngine } from '../game/engine';

interface MobileControlsProps {
  engine: GameEngine;
  tntCount: number;
  springsCount: number;
  rocketFuel: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  engine,
  tntCount,
  springsCount,
  rocketFuel
}) => {
  // Touch Handlers with preventDefault
  const bindHold = (onDown: () => void, onUp: () => void) => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        onDown();
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        onUp();
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        onDown();
      },
      onMouseUp: (e: React.MouseEvent) => {
        e.preventDefault();
        onUp();
      }
    };
  };

  const bindTap = (onTap: () => void) => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        onTap();
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        onTap();
      }
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-4 select-none touch-none">
      {/* Directional Pad */}
      <div className="flex items-center gap-2">
        <button
          {...bindHold(
            () => engine.moveLeft(true),
            () => engine.moveLeft(false)
          )}
          className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-b from-amber-700 to-amber-900 border-2 border-amber-400 active:bg-amber-500 text-white font-bold text-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="向左跑"
        >
          ◀
        </button>

        <button
          {...bindHold(
            () => engine.moveRight(true),
            () => engine.moveRight(false)
          )}
          className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-b from-amber-700 to-amber-900 border-2 border-amber-400 active:bg-amber-500 text-white font-bold text-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="向右跑"
        >
          ▶
        </button>
      </div>

      {/* Jump Button */}
      <div>
        <button
          {...bindTap(() => engine.jump())}
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-b from-yellow-500 to-amber-600 border-3 border-yellow-300 active:bg-yellow-300 text-black font-extrabold text-sm md:text-base flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform"
          aria-label="跳躍"
        >
          <span className="text-xl">⬆</span>
          <span>跳躍</span>
        </button>
      </div>

      {/* ACME Special Gadgets */}
      <div className="flex items-center gap-2">
        {/* Rocket Boost (Hold) */}
        <button
          {...bindHold(
            () => engine.activateRocket(true),
            () => engine.activateRocket(false)
          )}
          disabled={rocketFuel <= 5}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center border-2 shadow-lg active:scale-95 transition-transform ${
            rocketFuel > 5
              ? 'bg-gradient-to-b from-red-600 to-red-800 border-red-400 active:bg-red-400 text-white'
              : 'bg-stone-800 border-stone-600 text-stone-500 opacity-60'
          }`}
          aria-label="火箭鞋"
        >
          <span className="text-lg">🚀</span>
          <span className="text-[10px] font-bold">火箭 [Z]</span>
        </button>

        {/* Super Spring */}
        <button
          {...bindTap(() => engine.deploySpring())}
          disabled={springsCount <= 0}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center border-2 shadow-lg active:scale-95 transition-transform ${
            springsCount > 0
              ? 'bg-gradient-to-b from-amber-500 to-amber-700 border-amber-300 active:bg-amber-300 text-white'
              : 'bg-stone-800 border-stone-600 text-stone-500 opacity-60'
          }`}
          aria-label="彈簧"
        >
          <span className="text-lg">🦘</span>
          <span className="text-[10px] font-bold">彈簧 [X]</span>
        </button>

        {/* Toss TNT */}
        <button
          {...bindTap(() => engine.tossTnt())}
          disabled={tntCount <= 0}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center border-2 shadow-lg active:scale-95 transition-transform ${
            tntCount > 0
              ? 'bg-gradient-to-b from-rose-700 to-rose-900 border-rose-400 active:bg-rose-400 text-white'
              : 'bg-stone-800 border-stone-600 text-stone-500 opacity-60'
          }`}
          aria-label="TNT炸藥"
        >
          <span className="text-lg">💣</span>
          <span className="text-[10px] font-bold">炸藥 [C]</span>
        </button>
      </div>
    </div>
  );
};
