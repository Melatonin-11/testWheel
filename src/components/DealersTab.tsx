import React from 'react';
import { WheelData } from '../types';
import { formatNumber } from '../utils/format';
import { sound } from '../utils/sound';
import { Bot, Lock, Check } from 'lucide-react';

interface DealersTabProps {
  wheels: WheelData[];
  coins: number;
  onHireDealer: (wheelId: string, cost: number) => void;
  onUpgradeDealer: (wheelId: string, cost: number) => void;
}

export const DealersTab: React.FC<DealersTabProps> = ({
  wheels,
  coins,
  onHireDealer,
  onUpgradeDealer,
}) => {
  return (
    <div className="flex flex-col gap-3 pb-24 pt-2">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
        <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span>🤖 VIP 智能发牌员 (全自动代肝)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          为各个转盘桌雇佣专属荷官！他们会在轮盘冷却一结束时立刻为您自动转动，解放双手，离线状态下也能24小时持续为您赚钱。
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {wheels.map((wheel, index) => {
          if (!wheel.unlocked) {
            return (
              <div
                key={wheel.id}
                className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-400">未解锁转盘 #{index + 1}</h3>
                    <p className="text-xs text-slate-600">请先在转盘大厅解锁该赌桌</p>
                  </div>
                </div>
              </div>
            );
          }

          const isHired = wheel.autoDealerLevel > 0;
          const level = wheel.autoDealerLevel;
          const hireCost = wheel.baseReward * 15 + 100;
          const upgradeCost = Math.round(hireCost * Math.pow(2.2, level));
          const canAffordHire = coins >= hireCost && !isHired;
          const canAffordUpgrade = coins >= upgradeCost && isHired && level < 10;

          return (
            <div
              key={wheel.id}
              className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg relative overflow-hidden"
            >
              {isHired && (
                <div className="absolute top-0 right-0 bg-emerald-500/20 border-b border-l border-emerald-500/40 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-bl-xl">
                  已启用自动
                </div>
              )}

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${
                  isHired ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  <Bot className={`w-6 h-6 ${isHired ? 'animate-bounce' : ''}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-slate-200 truncate">{wheel.name} 专属荷官</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isHired
                      ? `自动运转中 (手速加成: +${(level - 1) * 10}%)`
                      : '自动帮您无缝转动此轮盘'}
                  </p>
                </div>
              </div>

              {!isHired ? (
                <button
                  onClick={() => {
                    if (canAffordHire) {
                      onHireDealer(wheel.id, hireCost);
                      sound.playJackpot();
                    }
                  }}
                  disabled={!canAffordHire}
                  className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs transition shrink-0 shadow-md ${
                    canAffordHire
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 active:scale-95 cursor-pointer shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <span className="text-[10px] font-sans block leading-none opacity-90">雇佣荷官</span>
                  <span className="mt-0.5">💰 {formatNumber(hireCost)}</span>
                </button>
              ) : level >= 10 ? (
                <button disabled className="px-3 py-2 bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 rounded-xl font-mono text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 速度已满级
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (canAffordUpgrade) {
                      onUpgradeDealer(wheel.id, upgradeCost);
                      sound.playWin(2);
                    }
                  }}
                  disabled={!canAffordUpgrade}
                  className={`px-3 py-2 rounded-xl font-mono font-bold text-xs transition shrink-0 shadow-md ${
                    canAffordUpgrade
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 active:scale-95 cursor-pointer'
                      : 'bg-slate-800 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <span className="text-[10px] font-sans block leading-none text-slate-400">速度 Lv.{level}</span>
                  <span className="mt-0.5 block">+{formatNumber(upgradeCost)}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
