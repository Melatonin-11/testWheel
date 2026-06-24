import React from 'react';
import { formatNumber, formatTime } from '../utils/format';
import { sound } from '../utils/sound';
import { Coins, Vault, Sparkles } from 'lucide-react';

interface OfflineModalProps {
  coinsEarned: number;
  offlineSeconds: number;
  onClaim: (double: boolean) => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({
  coinsEarned,
  offlineSeconds,
  onClaim,
}) => {
  if (coinsEarned <= 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        {/* 背景光晕 */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Vault className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight">
          欢迎回来，大富豪！
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          在您离开的 <span className="text-amber-300 font-mono font-bold">{formatTime(offlineSeconds)}</span> 里，您的自动发牌员依然在日夜不停地转动赌桌。
        </p>

        {/* 金币框 */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 my-6 shadow-inner flex flex-col items-center">
          <span className="text-[10px] font-sans text-slate-500 tracking-wider">金库累积离线收益</span>
          <div className="flex items-center gap-2 mt-1">
            <Coins className="w-6 h-6 text-amber-400 animate-bounce" />
            <span className="font-mono text-3xl font-extrabold text-amber-300">
              +{formatNumber(coinsEarned)}
            </span>
          </div>
        </div>

        {/* 领取按钮 */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClaim(true);
              sound.playJackpot();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-mono font-extrabold text-sm tracking-wider shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>VIP 双倍暴击领取 (2倍)</span>
          </button>

          <button
            onClick={() => {
              onClaim(false);
              sound.playWin();
            }}
            className="w-full py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-mono text-xs font-bold hover:bg-slate-800 hover:text-white transition active:scale-95 cursor-pointer"
          >
            正常领取 ({formatNumber(coinsEarned)})
          </button>
        </div>
      </div>
    </div>
  );
};
