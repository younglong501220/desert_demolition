import React, { useState, useEffect, useMemo } from 'react';
import { GameEngine } from './game/engine';
import { ArcadeHUD } from './components/ArcadeHUD';
import { GameCanvas } from './components/GameCanvas';
import { MobileControls } from './components/MobileControls';
import { AcmeManualModal } from './components/AcmeManualModal';
import { GameOverModal } from './components/GameOverModal';
import { sound } from './game/sound';
import { Play, Sparkles, Tv, HelpCircle, Flame, Trophy } from 'lucide-react';
import { LEVELS } from './game/levels';
import { GameState } from './game/types';

export default function App() {
  const engine = useMemo(() => new GameEngine(), []);

  const [gameState, setGameState] = useState<GameState>(engine.state);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(engine.highScore);
  const [distance, setDistance] = useState<number>(engine.getDistanceToRoadRunner());
  const [distancePercent, setDistancePercent] = useState<number>(50);
  const [rocketFuel, setRocketFuel] = useState<number>(100);
  const [tntCount, setTntCount] = useState<number>(3);
  const [springsCount, setSpringsCount] = useState<number>(3);
  const [showManual, setShowManual] = useState<boolean>(false);
  const [showCrt, setShowCrt] = useState<boolean>(true);

  useEffect(() => {
    engine.onStateChange = (st) => setGameState(st);
    engine.onScoreChange = (sc) => {
      setScore(sc);
      setHighScore(engine.highScore);
    };
    engine.onDistanceChange = (dist, pct) => {
      setDistance(dist);
      setDistancePercent(pct);
    };
    engine.onInventoryChange = (fuel, tnt, springs) => {
      setRocketFuel(fuel);
      setTntCount(tnt);
      setSpringsCount(springs);
    };
  }, [engine]);

  const handleStartStory = () => {
    sound.enableAudio();
    engine.startStoryGame();
  };

  const handleStartEndless = () => {
    sound.enableAudio();
    engine.startEndlessGame();
  };

  const handleRestart = () => {
    sound.enableAudio();
    if (engine.mode === 'story') {
      engine.startStoryGame();
    } else {
      engine.startEndlessGame();
    }
  };

  const handleNextStage = () => {
    sound.enableAudio();
    engine.nextLevel();
  };

  const handleTogglePause = () => {
    if (gameState === 'PLAYING') engine.pause();
    else if (gameState === 'PAUSED') engine.resume();
  };

  const currentLevel = engine.getCurrentLevel();

  return (
    <div className="min-h-screen bg-[#140602] text-stone-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Top Arcade HUD (Visible in play / pause / game over) */}
      <ArcadeHUD
        score={score}
        highScore={highScore}
        levelName={engine.mode === 'endless' ? '無盡沙漠狂奔' : currentLevel.title}
        stageNum={engine.mode === 'endless' ? 99 : currentLevel.id}
        distance={distance}
        distancePercent={distancePercent}
        rocketFuel={rocketFuel}
        tntCount={tntCount}
        springsCount={springsCount}
        isPaused={gameState === 'PAUSED'}
        onTogglePause={handleTogglePause}
        onOpenManual={() => setShowManual(true)}
        onRestart={handleRestart}
      />

      {/* Main Game Stage Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-6xl w-full mx-auto">
        
        {gameState === 'MENU' ? (
          /* Title Screen / Main Menu */
          <div className="w-full max-w-4xl bg-[#1e0a03]/90 border-4 border-[#ff9100] rounded-3xl p-6 md:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(255,145,0,0.3)] text-center my-auto animate-in fade-in zoom-in-95 duration-300">
            
            {/* Poster / Hero Banner */}
            <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl max-h-72 aspect-[16/9] mx-auto bg-black">
              <img
                src="/src/assets/images/coyote_title_poster_1790691095041.jpg"
                alt="Desert Demolition Wile E. Coyote and Road Runner"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                  SEGA GENESIS 16-BIT CLASSIC HOMAGE
                </span>
                <h1 className="font-['Bangers'] text-3xl sm:text-5xl text-[#ffeb3b] tracking-wider drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)]">
                  DESERT DEMOLITION: 防爆沙漠
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 font-mono">
                  威利狼與嗶嗶鳥大追逐 · ACME 極限軍火裝備 · 卡通懸崖滯空物理
                </p>
              </div>
            </div>

            {/* Mode Select Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-6">
              <button
                onClick={handleStartStory}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 border-2 border-yellow-400 shadow-xl flex items-center justify-center gap-3 font-['Bangers'] text-2xl tracking-wider text-white active:scale-95 transition-all group"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform">🚀</span>
                <div className="text-left">
                  <div>冒險追逐模式</div>
                  <div className="text-xs font-mono text-amber-200 font-normal">三段特色峽谷與機關 (STORY)</div>
                </div>
              </button>

              <button
                onClick={handleStartEndless}
                className="p-4 rounded-2xl bg-gradient-to-br from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 border-2 border-rose-400 shadow-xl flex items-center justify-center gap-3 font-['Bangers'] text-2xl tracking-wider text-white active:scale-95 transition-all group"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform">🔥</span>
                <div className="text-left">
                  <div>無盡沙漠模式</div>
                  <div className="text-xs font-mono text-rose-200 font-normal">無限隨機地形與極限飆速 (ENDLESS)</div>
                </div>
              </button>
            </div>

            {/* Quick Controls Cheat Sheet */}
            <div className="bg-black/60 rounded-xl p-3 max-w-xl mx-auto border border-amber-600/30 text-xs font-mono text-stone-300 mb-6 flex flex-wrap justify-center gap-x-4 gap-y-1">
              <span><b>[←/→]</b> 移動</span>
              <span><b>[空白鍵/↑]</b> 跳躍</span>
              <span><b>[Z]</b> 火箭推進鞋</span>
              <span><b>[X]</b> 彈簧跳</span>
              <span><b>[C]</b> 投擲TNT</span>
              <span><b>[P]</b> 暫停</span>
            </div>

            {/* Footer Toolbar */}
            <div className="flex items-center justify-center gap-4 text-xs font-mono text-amber-300">
              <button
                onClick={() => setShowManual(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/70 border border-amber-500/40 transition-colors"
              >
                <HelpCircle size={15} />
                <span>ACME 產品手冊與物理說明</span>
              </button>

              <button
                onClick={() => setShowCrt(!showCrt)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                  showCrt ? 'bg-amber-950/60 border-amber-500 text-amber-300' : 'bg-black/40 border-stone-600 text-stone-400'
                }`}
              >
                <Tv size={15} />
                <span>CRT 復古掃描線: {showCrt ? '開' : '關'}</span>
              </button>
            </div>

          </div>
        ) : (
          /* Active Game View */
          <div className="w-full flex flex-col items-center gap-3">
            {/* Canvas Viewport */}
            <GameCanvas engine={engine} showCrt={showCrt} />

            {/* Keyboard Shortcuts Hint Bar (Desktop) */}
            <div className="hidden md:flex items-center justify-between w-full max-w-5xl px-3 py-1.5 bg-black/50 rounded-lg border border-stone-800 text-[11px] font-mono text-stone-400">
              <div className="flex items-center gap-3">
                <span><b>[←/→]</b> 奔跑</span>
                <span><b>[空白鍵]</b> 跳躍</span>
                <span className="text-red-400 font-bold"><b>[Z]</b> 火箭推進</span>
                <span className="text-yellow-400 font-bold"><b>[X]</b> 超級彈簧</span>
                <span className="text-rose-400 font-bold"><b>[C]</b> 丟炸藥</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCrt(!showCrt)}
                  className="hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  <Tv size={13} />
                  <span>CRT: {showCrt ? 'ON' : 'OFF'}</span>
                </button>
                <span><b>[P]</b> 暫停</span>
                <span><b>[R]</b> 重啟</span>
              </div>
            </div>

            {/* Touch / Mobile Controls (Visible on mobile & tablet) */}
            <div className="w-full block md:hidden">
              <MobileControls
                engine={engine}
                tntCount={tntCount}
                springsCount={springsCount}
                rocketFuel={rocketFuel}
              />
            </div>
          </div>
        )}

      </main>

      {/* ACME Instruction & Cartoon Physics Manual Modal */}
      <AcmeManualModal isOpen={showManual} onClose={() => setShowManual(false)} />

      {/* Game Over / Stage Victory Modal */}
      <GameOverModal
        state={gameState}
        mode={engine.mode}
        stageNum={currentLevel.id}
        totalStages={LEVELS.length}
        score={score}
        highScore={highScore}
        onNextStage={handleNextStage}
        onRestart={handleRestart}
        onStartEndless={handleStartEndless}
      />

      {/* Bottom Footer */}
      <footer className="w-full bg-[#120501] border-t border-stone-800/80 py-2.5 px-4 text-center text-[11px] font-mono text-stone-500">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>DESERT DEMOLITION © ACME CORPORATION · ALL GAGS RESERVED</span>
          <div className="flex items-center gap-3 text-stone-400">
            <span>BEEP-BEEP! 💨</span>
            <span>·</span>
            <span>PURE WEB AUDIO & CANVAS 2D</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
