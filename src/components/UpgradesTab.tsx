import React from 'react';
import { UPGRADES_LIST } from '../data/gameData';
import { formatNumber } from '../utils/format';
import { sound } from '../utils/sound';
import { Coins, PieChart, Sparkles, Flame, Zap, Check } from 'lucide-react';

interface UpgradesTabProps {
  coins: number;
  upgradesLevels: Record<string, number>;
  onBuyUpgrade: (id: string) => void;
}

export const UpgradesTab: React.FC<UpgradesTabProps> = ({
  coins,
  upgradesLevels,
  onBuyUpgrade,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coins': return <Coins className="w-5 h-5 text-amber-400" />;
      case 'PieChart': return <PieChart className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-yellow-300" />;
      case 'Flame': return <Flame className="w-5 h-5 text-red-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-blue-400" />;
      default: return <Coins className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-3 pb-24 pt-2">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
        <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
          <span>🛠️ 科技与规则强化</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          升级你的轮盘机制，扩大绿色中奖区面积、提升全局金币倍率以及暴击概率，实现滚雪球式的财富爆炸。
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {UPGRADES_LIST.map((item) => {
          const level = upgradesLevels[item.id] || 0;
          const isMax = level >= item.maxLevel;
          const currentCost = Math.round(item.cost * Math.pow(item.costMultiplier, level));
          const canAfford = coins >= currentCost && !isMax;

          return (
            <div
              key={item.id}
              className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-inner">
                  {getIcon(item.iconName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-200 truncate">{item.name}</h3>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50">
                      {isMax ? '已满级' : `Lv.${level}/${item.maxLevel}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{item.description}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (canAfford) {
                    onBuyUpgrade(item.id);
                    sound.playWin(1.5);
                  }
                }}
                disabled={!canAfford}
                className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs transition shrink-0 flex flex-col items-center justify-center min-w-[80px] shadow-md ${
                  isMax
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 cursor-default'
                    : canAfford
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-amber-500/20 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                {isMax ? (
                  <span className="flex items-center gap-1 font-sans font-bold">
                    <Check className="w-3.5 h-3.5" /> 已满级
                  </span>
                ) : (
                  <>
                    <span className="text-[10px] font-sans text-slate-950/80 block leading-none">研制升级</span>
                    <span className="mt-0.5">💰 {formatNumber(currentCost)}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
