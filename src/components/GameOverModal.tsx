import React from 'react';
import { Trophy, RotateCcw, ArrowRight, Sparkles, Flame } from 'lucide-react';
import { GameMode, GameState } from '../game/types';

interface GameOverModalProps {
  state: GameState;
  mode: GameMode;
  stageNum: number;
  totalStages: number;
  score: number;
  highScore: number;
  onNextStage: () => void;
  onRestart: () => void;
  onStartEndless: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  state,
  mode,
  stageNum,
  totalStages,
  score,
  highScore,
  onNextStage,
  onRestart,
  onStartEndless
}) => {
  if (state !== 'STAGE_CLEAR' && state !== 'GAME_OVER') return null;

  const isStageClear = state === 'STAGE_CLEAR';
  const isFinalWin = isStageClear || (state === 'GAME_OVER' && stageNum === totalStages && score > 3000);
  const isNewRecord = score >= highScore && score > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg bg-[#240d04] border-4 border-[#ff9100] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,145,0,0.4)] text-center text-white overflow-hidden">
        
        {/* Vintage Looney Tunes concentric background circles */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
          <div className="w-96 h-96 rounded-full border-8 border-red-600" />
          <div className="w-72 h-72 rounded-full border-8 border-orange-500 absolute" />
          <div className="w-48 h-48 rounded-full border-8 border-yellow-400 absolute" />
        </div>

        {/* Mascot Header Icon */}
        <div className="relative mb-4 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-4 border-white shadow-xl flex items-center justify-center text-4xl">
            {isFinalWin ? '🏆' : (isStageClear ? '🎉' : '💥')}
          </div>
        </div>

        {/* Title */}
        <h2 className="relative font-['Bangers'] text-4xl sm:text-5xl text-[#ffeb3b] tracking-wider drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)]">
          {isFinalWin
            ? "THAT'S ALL FOLKS!"
            : (isStageClear ? "STAGE CLEAR!" : "OUCH! CHASE FAILED!")}
        </h2>

        <p className="text-sm font-mono text-amber-200 mt-2 mb-6">
          {isFinalWin
            ? '🎊 恭喜！威利狼終於成功逮住了神出鬼沒的嗶嗶鳥！'
            : (isStageClear
                ? `🚀 成功在第 ${stageNum} 關捕獲嗶嗶鳥，準備迎戰下一關！`
                : '💨 嗶嗶鳥發出嘲弄的 Beep-Beep 聲逃離了視野！')}
        </p>

        {/* Stats Card */}
        <div className="bg-black/60 rounded-2xl border border-amber-600/40 p-4 mb-6 space-y-3 font-mono text-sm">
          <div className="flex justify-between items-center px-2">
            <span className="text-stone-400">最終得分 (SCORE):</span>
            <span className="text-2xl font-bold text-[#ffeb3b] tabular-nums">
              {score.toString().padStart(6, '0')}
            </span>
          </div>

          <div className="flex justify-between items-center px-2 border-t border-stone-800 pt-2">
            <span className="text-stone-400">歷史最高分 (RECORD):</span>
            <span className="text-lg font-bold text-amber-400 tabular-nums">
              {highScore.toString().padStart(6, '0')}
            </span>
          </div>

          {isNewRecord && (
            <div className="py-1 px-3 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-yellow-400/50 rounded-lg text-yellow-300 font-bold text-xs flex items-center justify-center gap-1.5 animate-pulse">
              <Sparkles size={14} />
              <span>新紀錄誕生！NEW HIGH SCORE!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isStageClear && stageNum < totalStages ? (
            <button
              onClick={onNextStage}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 font-['Bangers'] text-xl tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-white"
            >
              <span>挑戰第 {stageNum + 1} 關</span>
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={onRestart}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 font-['Bangers'] text-xl tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-white"
            >
              <RotateCcw size={20} />
              <span>再次挑戰追逐</span>
            </button>
          )}

          {mode === 'story' && (
            <button
              onClick={onStartEndless}
              className="py-3 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 font-mono text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all text-stone-200"
            >
              <Flame size={16} className="text-orange-500" />
              <span>試試無盡沙漠模式</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
