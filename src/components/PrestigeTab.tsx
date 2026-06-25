import React, { useState } from 'react';
import { Relic } from '../types';
import { RELICS_LIST } from '../data/gameData';
import { formatNumber } from '../utils/format';
import { sound } from '../utils/sound';
import { Crown, Sparkles, AlertTriangle, ShieldCheck, RotateCcw } from 'lucide-react';

interface PrestigeTabProps {
  coins: number;
  goldenTokens: number;
  totalCoinsEarned: number;
  unlockedRelics: Record<string, boolean>;
  onPrestige: () => void;
  onBuyRelic: (relicId: string) => void;
  onResetSave?: () => void;
}

export const PrestigeTab: React.FC<PrestigeTabProps> = ({
  goldenTokens,
  totalCoinsEarned,
  unlockedRelics,
  onPrestige,
  onBuyRelic,
  onResetSave,
}) => {
  const [confirmPrestige, setConfirmPrestige] = useState(false);
  const [confirmHardReset, setConfirmHardReset] = useState(false);

  const potentialTokens = Math.max(0, Math.floor(Math.sqrt(totalCoinsEarned / 10000)));
  const canPrestigeNow = potentialTokens > 0;

  return (
    <div className="flex flex-col gap-4 pb-24 pt-2">
      {/* 转生横幅介绍 */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-purple-950 border border-purple-500/50 rounded-2xl p-5 shadow-xl relative overflow-hidden text-center">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="w-12 h-12 mx-auto rounded-full bg-purple-900/80 border border-purple-400 flex items-center justify-center shadow-lg mb-2">
          <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
        </div>

        <h2 className="text-lg font-extrabold text-white tracking-tight">
          离岸资本转生 (重置与变强)
        </h2>
        <p className="text-xs text-purple-200/80 mt-1 max-w-sm mx-auto">
          将现有赌场产业高价变卖给离岸投资财团。转生将重置金币与转盘等级，并清空本轮累计产出，根据本轮赚取的总金币发放珍贵的 <strong className="text-yellow-400 font-bold">黄金转生代币</strong>（每个代币永久 +20% 金币加成！）。
        </p>

        <div className="mt-4 bg-slate-950/60 border border-purple-800/50 rounded-xl p-3 flex items-center justify-around">
          <div>
            <span className="text-[10px] font-sans text-purple-300/70 block">现有转生代币</span>
            <span className="font-mono text-lg font-bold text-yellow-400">👑 {formatNumber(goldenTokens)}</span>
          </div>
          <div className="h-8 w-px bg-purple-800/40" />
          <div>
            <span className="text-[10px] font-sans text-purple-300/70 block">本次变卖可得</span>
            <span className="font-mono text-lg font-bold text-emerald-400">+{formatNumber(potentialTokens)}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (canPrestigeNow) {
              if (!confirmPrestige) {
                setConfirmPrestige(true);
                sound.playClick();
              } else {
                onPrestige();
                sound.playJackpot();
                setConfirmPrestige(false);
              }
            }
          }}
          disabled={!canPrestigeNow}
          className={`w-full mt-4 py-3.5 rounded-xl font-mono font-extrabold text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-lg ${
            canPrestigeNow
              ? confirmPrestige
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white animate-bounce shadow-red-500/50 cursor-pointer'
                : 'bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white hover:brightness-110 active:scale-95 shadow-purple-500/30 cursor-pointer animate-pulse'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {!canPrestigeNow
              ? '生涯累计赚满 10K 金币后可转生'
              : confirmPrestige
              ? `确认变卖转生？(点击确认 +${potentialTokens}代币)`
              : `立即变卖产业 (+${potentialTokens} 代币)`}
          </span>
        </button>

        {confirmPrestige && (
          <button
            onClick={() => setConfirmPrestige(false)}
            className="text-xs text-slate-400 hover:text-white underline mt-1 cursor-pointer"
          >
            取消转生
          </button>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-amber-300/70 mt-2 font-sans">
          <AlertTriangle className="w-3 h-3" />
          <span>提示：转生将重置金币与转盘等级。圣物与代币加成永久保留。</span>
        </div>
      </div>

      {/* 圣物商城 */}
      <div className="flex flex-col gap-2.5">
        <div className="px-1 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-300 tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" /> 传世圣物陈列馆
          </h3>
          <span className="text-xs font-mono text-yellow-400">👑 {formatNumber(goldenTokens)} 代币可用</span>
        </div>

        {RELICS_LIST.map((relic: Relic) => {
          const isUnlocked = unlockedRelics[relic.id] === true;
          const canAfford = goldenTokens >= relic.cost && !isUnlocked;

          return (
            <div
              key={relic.id}
              className={`border rounded-2xl p-3.5 flex items-center justify-between gap-3 transition shadow-lg ${
                isUnlocked
                  ? 'bg-purple-950/30 border-purple-500/50 shadow-purple-950/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${
                  isUnlocked ? 'bg-purple-900/50 border-purple-400 text-yellow-300' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  <Crown className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-200 truncate">{relic.name}</h4>
                    {isUnlocked && (
                      <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded">
                        已拥有
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{relic.description}</p>
                </div>
              </div>

              {!isUnlocked ? (
                <button
                  onClick={() => {
                    if (canAfford) {
                      onBuyRelic(relic.id);
                      sound.playWin(3);
                    }
                  }}
                  disabled={!canAfford}
                  className={`px-3.5 py-2 rounded-xl font-mono font-bold text-xs shrink-0 transition shadow-md ${
                    canAfford
                      ? 'bg-yellow-400 text-slate-950 hover:bg-yellow-300 active:scale-95 shadow-yellow-400/20 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <span>👑 {relic.cost}</span>
                </button>
              ) : (
                <div className="text-emerald-400 text-xs font-mono font-bold shrink-0 px-2">
                  ✓ 已激活
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 危险区：重新开始游戏 */}
      {onResetSave && (
        <div className="mt-6 pt-6 border-t border-red-500/30 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
            <RotateCcw className="w-4 h-4" />
            <span>重新开始游戏 (删档重练)</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-xs">
            遇到了瓶颈或想重新体验开局？删档将彻底清空当前所有金币、转盘等级、转生代币与圣物！
          </p>
          {!confirmHardReset ? (
            <button
              onClick={() => setConfirmHardReset(true)}
              className="mt-1 px-4 py-2 bg-red-950/80 border border-red-600/60 text-red-300 hover:bg-red-900/80 hover:text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              删档重新开始
            </button>
          ) : (
            <div className="flex items-center gap-2 mt-1 animate-pulse">
              <button
                onClick={() => {
                  onResetSave();
                  setConfirmHardReset(false);
                  sound.playClick();
                }}
                className="px-4 py-2 bg-red-600 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-red-600/40 hover:bg-red-500 active:scale-95 cursor-pointer"
              >
                确认删除存档重来！
              </button>
              <button
                onClick={() => setConfirmHardReset(false)}
                className="px-3 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs cursor-pointer"
              >
                取消
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
