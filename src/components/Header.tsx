import React, { useState } from 'react';
import { formatNumber } from '../utils/format';
import { sound } from '../utils/sound';
import { Coins, Crown, Flame, Volume2, VolumeX, Sparkles, RotateCcw } from 'lucide-react';

interface HeaderProps {
  coins: number;
  goldenTokens: number;
  feverEnergy: number;
  isFeverMode: boolean;
  feverTimeRemaining: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetSave?: () => void;
  hasGodGambler?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  coins,
  goldenTokens,
  feverEnergy,
  isFeverMode,
  feverTimeRemaining,
  soundEnabled,
  onToggleSound,
  onResetSave,
  hasGodGambler = false,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <header className="relative z-10 w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/30 shadow-xl px-4 py-3 flex flex-col gap-2">
      {/* Top Bar: Currencies & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Coins */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/50 rounded-full px-3 py-1 shadow-inner shadow-amber-500/10">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-500/50">
              <Coins className="w-3.5 h-3.5 text-slate-950 font-bold animate-pulse" />
            </div>
            <span className="font-mono text-lg font-bold tracking-tight text-amber-300">
              {formatNumber(coins)}
            </span>
          </div>

          {/* Golden Tokens (Prestige) */}
          {goldenTokens > 0 && (
            <div className="flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/50 rounded-full px-2.5 py-1 shadow-inner" title="黄金转生代币">
              <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-mono text-sm font-bold text-purple-200">
                {formatNumber(goldenTokens)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onResetSave && (
            !confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="p-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition active:scale-95 cursor-pointer"
                title="重新开始游戏 (删档重练)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-red-950/95 border border-red-500 px-2 py-1 rounded-full shadow-lg animate-pulse">
                <span className="text-[10px] text-red-200 font-bold px-0.5">重开?</span>
                <button
                  onClick={() => {
                    onResetSave();
                    setConfirmReset(false);
                    sound.playClick();
                  }}
                  className="text-[11px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full hover:bg-red-500 active:scale-95 cursor-pointer"
                >
                  确定
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="text-[11px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full hover:bg-slate-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )
          )}

          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            className="p-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-500/50 transition active:scale-95 cursor-pointer"
            title={soundEnabled ? '关闭音效' : '开启音效'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Fever Bar / Golden Rush Indicator */}
      <div className="w-full bg-slate-950/90 rounded-xl p-2 border border-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs mb-1 font-sans">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            {isFeverMode ? (
              <span className="text-amber-400 flex items-center gap-1 animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                🔥 黄金狂热启动中！({Math.ceil(feverTimeRemaining)}秒)
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1">
                <Flame className={`w-3.5 h-3.5 ${feverEnergy >= 100 ? 'text-amber-400 animate-spin' : 'text-slate-500'}`} />
                狂热能量条 (中奖可充能)
              </span>
            )}
          </div>
          <span className="font-mono font-bold text-slate-300">
            {isFeverMode ? '100%必中 & 3倍速' : `${Math.floor(feverEnergy)}%`}
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800/80">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isFeverMode
                ? 'bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 animate-pulse shadow-lg shadow-amber-500/50'
                : 'bg-gradient-to-r from-amber-600 to-yellow-400'
            }`}
            style={{ width: `${isFeverMode ? (feverTimeRemaining / (hasGodGambler ? 30 : 15)) * 100 : feverEnergy}%` }}
          />
        </div>
      </div>
    </header>
  );
};
