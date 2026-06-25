import React from 'react';
import { WheelData } from '../types';
import { WheelGraphic } from './WheelGraphic';
import { formatNumber } from '../utils/format';
import { sound } from '../utils/sound';
import { Lock, Zap, TrendingUp, Bot, Compass, ArrowUpCircle } from 'lucide-react';
import {
  getWheelSectorUpgradeCost,
  getWheelEvolveCost,
  THEMES
} from '../game/formulas';

interface WheelCardProps {
  wheel: WheelData;
  globalMultiplier: number;
  isFever: boolean;
  actualWinChance: number;
  actualJackpotChance: number;
  actualSpinDuration: number;
  canUnlock: boolean;
  canUpgrade: boolean;
  upgradeCost: number;
  coins: number;
  onSpin: (id: string) => void;
  onUnlock: (id: string) => void;
  onUpgradeLevel: (id: string) => void;
  onUpgradeSector: (id: string) => void;
  onEvolve: (id: string) => void;
  onToggleDealerPause: (id: string) => void;
}

export const WheelCard: React.FC<WheelCardProps> = ({
  wheel,
  globalMultiplier,
  isFever,
  actualWinChance,
  actualJackpotChance,
  actualSpinDuration,
  canUnlock,
  canUpgrade,
  upgradeCost,
  coins,
  onSpin,
  onUnlock,
  onUpgradeLevel,
  onUpgradeSector,
  onEvolve,
  onToggleDealerPause,
}) => {
  const currentReward = wheel.baseReward * wheel.level * globalMultiplier * (isFever ? 3 : 1);
  const winPercent = isFever ? 100 : Math.round(actualWinChance * 100);

  const sectorUpgradeCost = getWheelSectorUpgradeCost(wheel);
  const isSectorMax = (wheel.sectorSizeLevel || 0) >= 15;
  const canUpgradeSector = coins >= sectorUpgradeCost && !isSectorMax;

  const evolveCost = getWheelEvolveCost(wheel);
  const canEvolve = evolveCost !== null && coins >= evolveCost;
  const nextThemeName = evolveCost !== null ? THEMES[(wheel.themeLevel || 0) + 1]?.name : null;

  // 未解锁状态
  if (!wheel.unlocked) {
    return (
      <div id={`wheel-slot-locked-${wheel.id}`} className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden shadow-lg min-h-[220px]">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center">
          <Lock className="w-8 h-8 text-amber-500/80" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-slate-300">{wheel.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">高品质进阶轮盘，赢取超凡收益！</p>
        </div>
        <button
          id={`btn-unlock-${wheel.id}`}
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
          <span>解锁转盘槽位</span>
          <span className="bg-slate-950/20 px-2 py-0.5 rounded text-xs">
            💰 {formatNumber(wheel.unlockCost)}
          </span>
        </button>
      </div>
    );
  }

  const isSpinDisabled = wheel.isSpinning || wheel.cooldown > 0;

  return (
    <div id={`wheel-slot-${wheel.id}`} className={`w-full bg-gradient-to-b from-slate-900 to-slate-950 border ${isFever ? 'border-amber-400/60 shadow-amber-500/20' : 'border-slate-800'} rounded-2xl p-3.5 flex flex-col gap-3 relative shadow-xl overflow-hidden transition-all`}>
      {/* 头部标题与发牌员状态 */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-amber-400 tracking-tight">{wheel.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">Slot {wheel.id.replace('wheel_', '')}</span>
          </div>
          {wheel.autoDealerLevel > 0 && !wheel.isSpinning && wheel.cooldown <= 0 && !wheel.autoDealerPaused && (
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800/40">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span>自动派牌倒计时: <strong className="text-amber-300">{(wheel.autoDealerCooldown || 0).toFixed(1)}s</strong></span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {wheel.autoDealerLevel > 0 && (
            <button
              id={`btn-toggle-pause-${wheel.id}`}
              onClick={() => {
                onToggleDealerPause(wheel.id);
                sound.playClick();
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                wheel.autoDealerPaused
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              <Bot className="w-3 h-3 shrink-0" />
              {wheel.autoDealerPaused ? '已暂停' : '派牌中'}
            </button>
          )}
          <span className="text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40 font-bold text-xs font-mono">
            胜率: {winPercent}%
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
            spinDuration={actualSpinDuration}
            winChance={actualWinChance}
            jackpotChance={actualJackpotChance}
            level={wheel.level}
            isFever={isFever}
          />
        </div>

        {/* 右侧奖励与按钮 */}
        <div className="col-span-6 flex flex-col justify-center gap-2 pl-1">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 text-center">
            <span className="text-[10px] text-slate-400 block font-sans">基础收益</span>
            <span className="font-mono text-base font-bold text-amber-300">
              +{formatNumber(currentReward)}
            </span>
          </div>

          <button
            id={`btn-spin-${wheel.id}`}
            onClick={() => {
              if (!isSpinDisabled) {
                onSpin(wheel.id);
              }
            }}
            disabled={isSpinDisabled}
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
              <span>🎲 手动转盘</span>
            )}
          </button>
        </div>
      </div>

      {/* 三重独立升级控制器 */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80 mt-1">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">独立精控升级</span>
        <div className="grid grid-cols-3 gap-1.5">
          {/* 1. 升级产出 (等级升级) */}
          <button
            id={`btn-upgrade-reward-${wheel.id}`}
            onClick={() => {
              if (canUpgrade) {
                onUpgradeLevel(wheel.id);
                sound.playClick();
              }
            }}
            disabled={!canUpgrade}
            className={`p-2 rounded-xl text-center transition flex flex-col items-center justify-between gap-1 border h-[72px] ${
              canUpgrade
                ? 'bg-slate-900 border-amber-500/30 hover:border-amber-500/60 hover:bg-slate-800/60 cursor-pointer active:scale-95'
                : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] font-bold text-slate-300">产出升级</span>
            </div>
            <div className="text-[11px] font-bold text-slate-100 font-mono">
              Lv.{wheel.level}
            </div>
            <div className="text-[9px] font-mono text-amber-400/90 font-bold">
              💰 {formatNumber(upgradeCost)}
            </div>
          </button>

          {/* 2. 独立扩张面积胜率升级 */}
          <button
            id={`btn-upgrade-sector-${wheel.id}`}
            onClick={() => {
              if (canUpgradeSector) {
                onUpgradeSector(wheel.id);
                sound.playWin(1.5);
              }
            }}
            disabled={!canUpgradeSector}
            className={`p-2 rounded-xl text-center transition flex flex-col items-center justify-between gap-1 border h-[72px] ${
              canUpgradeSector
                ? 'bg-slate-900 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-slate-800/60 cursor-pointer active:scale-95'
                : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-bold text-slate-300">中奖面积</span>
            </div>
            <div className="text-[11px] font-bold text-slate-100 font-mono">
              {isSectorMax ? '已满级' : `Lv.${wheel.sectorSizeLevel || 0}/15`}
            </div>
            <div className="text-[9px] font-mono text-emerald-400 font-bold">
              {isSectorMax ? 'MAX' : `💰 ${formatNumber(sectorUpgradeCost)}`}
            </div>
          </button>

          {/* 3. 品阶升阶（进化）升级 */}
          <button
            id={`btn-evolve-${wheel.id}`}
            onClick={() => {
              if (canEvolve) {
                onEvolve(wheel.id);
                sound.playJackpot();
              }
            }}
            disabled={!canEvolve}
            className={`p-2 rounded-xl text-center transition flex flex-col items-center justify-between gap-1 border h-[72px] ${
              canEvolve
                ? 'bg-gradient-to-b from-slate-900 to-indigo-950/30 border-indigo-500/40 hover:border-indigo-400 hover:brightness-110 cursor-pointer active:scale-95 shadow-indigo-500/10'
                : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-1">
              <ArrowUpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[10px] font-bold text-slate-300">转盘品阶</span>
            </div>
            <div className="text-[11px] font-bold text-slate-100 font-mono truncate max-w-full">
              {nextThemeName ? `升至 ${nextThemeName}` : '极品天花板'}
            </div>
            <div className="text-[9px] font-mono text-indigo-300 font-bold">
              {evolveCost !== null ? `💰 ${formatNumber(evolveCost)}` : '已满阶'}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
