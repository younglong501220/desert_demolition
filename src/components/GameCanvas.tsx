import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { sound } from '../game/sound';

interface GameCanvasProps {
  engine: GameEngine;
  showCrt: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, showCrt }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const internalWidth = 800;
    const internalHeight = 420;
    canvas.width = internalWidth;
    canvas.height = internalHeight;

    const renderer = new GameRenderer(ctx, internalWidth, internalHeight);
    rendererRef.current = renderer;

    let animId: number;

    const loop = () => {
      engine.update();
      renderer.render(engine);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Keyboard handlers
    const keyMap: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyZ', 'KeyX', 'KeyC'].includes(e.code)) {
        e.preventDefault();
      }

      if (keyMap[e.code]) return; // Avoid key repeat spam
      keyMap[e.code] = true;

      // Ensure sound is active on first user interaction
      sound.enableAudio();

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.moveLeft(true);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.moveRight(true);
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        engine.jump();
      } else if (e.code === 'KeyZ') {
        engine.activateRocket(true);
      } else if (e.code === 'KeyX') {
        engine.deploySpring();
      } else if (e.code === 'KeyC') {
        engine.tossTnt();
      } else if (e.code === 'KeyP') {
        if (engine.state === 'PLAYING') engine.pause();
        else if (engine.state === 'PAUSED') engine.resume();
      } else if (e.code === 'KeyR') {
        engine.resetLevel(engine.currentLevelIndex, engine.mode);
        engine.setState('PLAYING');
      } else if (e.code === 'KeyM') {
        sound.setSfxEnabled(!sound.isSfxOn());
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keyMap[e.code] = false;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.moveLeft(false);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.moveRight(false);
      } else if (e.code === 'KeyZ') {
        engine.activateRocket(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine]);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border-4 border-[#ff9100] shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(255,145,0,0.3)] bg-black aspect-[800/420]">
      {/* HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block image-rendering-pixelated cursor-crosshair"
      />

      {/* Retro CRT Scanlines Effect Overlay (Toggleable) */}
      {showCrt && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-75 z-10" />
      )}

      {/* Screen Vignette & Bezel Reflection */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] z-10" />

      {/* Pause Screen Overlay */}
      {engine.state === 'PAUSED' && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white animate-in fade-in duration-150">
          <div className="text-5xl font-['Bangers'] tracking-wider text-[#ffeb3b] mb-2 drop-shadow-lg">
            GAME PAUSED
          </div>
          <p className="font-mono text-xs text-stone-300 mb-6">
            按下 [P] 鍵或點擊下方按鈕繼續追逐！
          </p>
          <button
            onClick={() => engine.resume()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white font-['Bangers'] text-xl tracking-wider shadow-lg hover:scale-105 transition-transform"
          >
            繼續追逐 (RESUME)
          </button>
        </div>
      )}
    </div>
  );
};
