import React from 'react';
import { WheelData } from '../types';
import { WheelGraphic } from './WheelGraphic';
import { formatNumber } from '../utils/format';
import { sound } from '../utils/sound';
import { Lock, Zap, TrendingUp, Bot } from 'lucide-react';

interface WheelCardProps {
  wheel: WheelData;
  globalMultiplier: number;
  actualWinChance: number;
  isFever: boolean;
  canUnlock: boolean;
  canUpgrade: boolean;
  upgradeCost: number;
  onSpin: (id: string) => void;
  onUnlock: (id: string) => void;
  onUpgradeLevel: (id: string) => void;
}

export const WheelCard: React.FC<WheelCardProps> = ({
  wheel,
  globalMultiplier,
  actualWinChance,
  isFever,
  canUnlock,
  canUpgrade,
  upgradeCost,
  onSpin,
  onUnlock,
  onUpgradeLevel,
}) => {
  const currentReward = wheel.baseReward * wheel.level * globalMultiplier * (isFever ? 3 : 1);
  const winPercent = Math.round(actualWinChance * 100);

  // 未解锁状态
  if (!wheel.unlocked) {
    return (
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden shadow-lg min-h-[220px]">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center">
          <Lock className="w-8 h-8 text-amber-500/80" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-slate-300">{wheel.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">高杠杆赌桌，赚取海量财富！</p>
        </div>
        <button
          onClick={() => {
            if (canUnlock) {
              onUnlock(wheel.id);
              sound.playWin(3);
            }
          }}
          disabled={!canUnlock}
          className={`px-6 py-2.5 rounded-xl font-mono font-bold text-sm transition flex items-center gap-2 shadow-lg ${
            canUnlock
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-amber-500/20 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>立即解锁</span>
          <span className="bg-slate-950/20 px-2 py-0.5 rounded text-xs">
            💰 {formatNumber(wheel.unlockCost)}
          </span>
        </button>
      </div>
    );
  }

  const isSpinDisabled = wheel.isSpinning || wheel.cooldown > 0;

  return (
    <div className={`w-full bg-gradient-to-b from-slate-900 to-slate-950 border ${isFever ? 'border-amber-400/60 shadow-amber-500/20' : 'border-slate-800'} rounded-2xl p-3.5 flex flex-col gap-3 relative shadow-xl overflow-hidden transition-all`}>
      {/* 头部标题与胜率 */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-200 tracking-tight">{wheel.name}</span>
          {wheel.autoDealerLevel > 0 && (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
              <Bot className="w-3 h-3 animate-pulse" /> 自动发牌
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40 font-bold">
            中奖率: {winPercent}%
          </span>
        </div>
      </div>

      {/* 转盘与操作区 */}
      <div className="grid grid-cols-12 items-center gap-2 py-1">
        {/* 左侧轮盘图形 */}
        <div className="col-span-6 flex justify-center">
          <WheelGraphic
            rotation={wheel.currentRotation}
            isSpinning={wheel.isSpinning}
            spinDuration={wheel.currentSpinDuration}
            winChance={actualWinChance}
            jackpotChance={wheel.jackpotChance}
            level={wheel.level}
            isFever={isFever}
          />
        </div>

        {/* 右侧奖励与按钮 */}
        <div className="col-span-6 flex flex-col justify-center gap-2 pl-1">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 text-center">
            <span className="text-[10px] text-slate-400 block font-sans">中奖收益</span>
            <span className="font-mono text-base font-bold text-amber-300">
              +{formatNumber(currentReward)}
            </span>
          </div>

          <button
            onClick={() => {
              if (!isSpinDisabled) {
                onSpin(wheel.id);
              }
            }}
            disabled={isSpinDisabled && wheel.autoDealerLevel === 0}
            className={`w-full py-3 rounded-xl font-mono font-extrabold text-sm tracking-wider uppercase transition relative overflow-hidden shadow-md ${
              isSpinDisabled
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                : 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-amber-500/30 cursor-pointer animate-pulse'
            }`}
          >
            {wheel.isSpinning ? (
              <span className="flex items-center justify-center gap-1.5">
                <Zap className="w-4 h-4 animate-spin text-amber-300" />
                转动中...
              </span>
            ) : wheel.cooldown > 0 ? (
              <span>冷却中 {wheel.cooldown.toFixed(1)}秒</span>
            ) : (
              <span>🎲 启动转盘！</span>
            )}
          </button>
        </div>
      </div>

      {/* 底部升级栏 */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 mt-1">
        <div className="text-xs text-slate-400 font-mono">
          当前等级 <span className="text-white font-bold">Lv.{wheel.level}</span>
        </div>

        <button
          onClick={() => {
            if (canUpgrade) {
              onUpgradeLevel(wheel.id);
              sound.playClick();
            }
          }}
          disabled={!canUpgrade}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
            canUpgrade
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 active:scale-95 cursor-pointer'
              : 'bg-slate-800/60 text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>升级产出</span>
          <span className="opacity-80">({formatNumber(upgradeCost)})</span>
        </button>
      </div>
    </div>
  );
};
