import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, TabType, WheelData } from './types';
import { INITIAL_WHEELS, UPGRADES_LIST, RELICS_LIST } from './data/gameData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { WheelCard } from './components/WheelCard';
import { UpgradesTab } from './components/UpgradesTab';
import { DealersTab } from './components/DealersTab';
import { PrestigeTab } from './components/PrestigeTab';
import { OfflineModal } from './components/OfflineModal';
import { sound } from './utils/sound';
import { Dices, Sparkles } from 'lucide-react';
import {
  getGlobalMultiplier,
  getWinChance,
  getJackpotChance,
  getSpinDuration,
  getPrestigeTokensEarned,
  getWheelUpgradeCost,
  getDealerHireCost,
  getDealerUpgradeCost,
  getWheelSectorUpgradeCost,
  getWheelEvolveCost,
  getDealerInterval,
  applyThemeToWheel,
  migrateSave,
} from './game/formulas';

const SAVE_KEY = 'idle_wheel_tycoon_save_v1';
const TICK_RATE = 0.05; // 50ms = 20 FPS game loop

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return migrateSave(parsed);
        } catch {
          // fallback
        }
      }
    }
    return migrateSave(null);
  });

  const [activeTab, setActiveTab] = useState<TabType>('wheels');
  const [offlineReward, setOfflineReward] = useState<{ coins: number; seconds: number } | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    sound.enabled = state.soundEnabled;
  }, [state.soundEnabled]);

  useEffect(() => {
    const now = Date.now();
    const elapsedSecs = Math.floor((now - state.lastSaveTime) / 1000);

    if (elapsedSecs > 30) {
      const maxOfflineSecs = state.relics['relic_vault'] ? 86400 * 7 : 28800;
      const effectiveSecs = Math.min(elapsedSecs, maxOfflineSecs);
      
      let totalOfflineRatePerSec = 0;
      const globMult = getGlobalMultiplier(state);

      state.wheels.forEach((w) => {
        if (w.unlocked && w.autoDealerLevel > 0 && !w.autoDealerPaused) {
          const interval = getDealerInterval(w, state);
          const spinDur = getSpinDuration(w, state) + 0.35 + interval;
          const winCh = getWinChance(w, state);
          const jackCh = getJackpotChance(w, state);
          const expectedWinMult = 1 + 9 * jackCh;
          const expectedRewardPerSpin = w.baseReward * w.level * globMult * winCh * expectedWinMult;
          totalOfflineRatePerSec += expectedRewardPerSpin / spinDur;
        }
      });

      const vaultEfficiency = state.relics['relic_vault'] ? 1.0 : 0.5;
      const earned = Math.floor(totalOfflineRatePerSec * effectiveSecs * vaultEfficiency);

      if (earned > 0) {
        setOfflineReward({ coins: earned, seconds: effectiveSecs });
      }
    }
  }, []);

  const handleClaimOffline = (double: boolean) => {
    if (!offlineReward) return;
    const finalAmount = double ? offlineReward.coins * 2 : offlineReward.coins;
    setState((prev) => ({
      ...prev,
      coins: prev.coins + finalAmount,
      stats: {
        ...prev.stats,
        totalCoinsEarned: prev.stats.totalCoinsEarned + finalAmount,
      },
      lastSaveTime: Date.now(),
    }));
    setOfflineReward(null);
  };

  const startWheelSpin = useCallback((wheel: WheelData, s: GameState): WheelData => {
    const globMult = getGlobalMultiplier(s);
    const winCh = getWinChance(wheel, s);
    const jackCh = getJackpotChance(wheel, s);
    const isFever = s.isFeverMode;

    const isWin = Math.random() < winCh;
    const isJackpot = isWin && !isFever && Math.random() < jackCh;
    const multiplier = isJackpot ? 10 : (isFever ? 3 : 1);
    const reward = isWin ? Math.round(wheel.baseReward * wheel.level * globMult * multiplier) : 0;

    const totalSlices = 12;
    const winningSlicesCount = isFever ? 12 : Math.round(winCh * totalSlices);
    const hasJackpotSlice = !isFever && jackCh > 0;
    let targetAngle = 0;

    if (isFever) {
      targetAngle = 10 + Math.random() * 340;
    } else if (hasJackpotSlice) {
      if (isJackpot) {
        targetAngle = 4 + Math.random() * 22; // slice 0: 0~30
      } else if (isWin) {
        const winStart = 30;
        const winEnd = Math.min(330, 30 + winningSlicesCount * 30);
        targetAngle = winStart + 5 + Math.random() * Math.max(10, winEnd - winStart - 10);
      } else {
        const loseStart = Math.min(330, 30 + winningSlicesCount * 30);
        const loseEnd = 360;
        targetAngle = loseStart + 5 + Math.random() * Math.max(10, loseEnd - loseStart - 10);
      }
    } else {
      const winStart = 0;
      const winEnd = Math.min(330, winningSlicesCount * 30);
      if (isWin) {
        targetAngle = winStart + 5 + Math.random() * Math.max(10, winEnd - winStart - 10);
      } else {
        const loseStart = winEnd;
        const loseEnd = 360;
        targetAngle = loseStart + 5 + Math.random() * Math.max(10, loseEnd - loseStart - 10);
      }
    }

    const dur = getSpinDuration(wheel, s);
    const curMod = wheel.currentRotation % 360;
    const targetMod = (360 - targetAngle + 360) % 360;
    const delta = (targetMod - curMod + 360) % 360;
    const baseSpins = 360 * (dur > 1.2 ? 5 : 4);
    const nextRotation = wheel.currentRotation + baseSpins + delta;

    return {
      ...wheel,
      isSpinning: true,
      cooldown: dur,
      currentSpinDuration: dur,
      pendingReward: reward,
      pendingIsJackpot: isJackpot,
      currentRotation: nextRotation,
    };
  }, [getGlobalMultiplier, getWinChance, getJackpotChance, getSpinDuration]);

  const triggerSpin = useCallback((wheelId: string) => {
    setState((prev) => {
      const wheelIdx = prev.wheels.findIndex((w) => w.id === wheelId);
      if (wheelIdx === -1) return prev;
      const wheel = prev.wheels[wheelIdx];
      if (wheel.isSpinning || wheel.cooldown > 0 || !wheel.unlocked) return prev;

      sound.playTick();

      const nextWheels = [...prev.wheels];
      nextWheels[wheelIdx] = startWheelSpin(wheel, prev);

      return {
        ...prev,
        wheels: nextWheels,
        stats: { ...prev.stats, totalSpins: prev.stats.totalSpins + 1 },
      };
    });
  }, [startWheelSpin]);

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        let stateChanged = false;
        let nextCoins = prev.coins;
        let nextFeverEnergy = prev.feverEnergy;
        let nextIsFever = prev.isFeverMode;
        let nextFeverTime = prev.feverTimeRemaining;
        const nextStats = { ...prev.stats };

        if (nextIsFever) {
          nextFeverTime = Math.max(0, nextFeverTime - TICK_RATE);
          stateChanged = true;
          if (nextFeverTime <= 0) {
            nextIsFever = false;
            nextFeverEnergy = 0;
          }
        }

        const nextWheels = prev.wheels.map((wheel) => {
          if (!wheel.unlocked) return wheel;

          let w = { ...wheel };

          if (w.isSpinning) {
            stateChanged = true;
            w.cooldown -= TICK_RATE;

            if (w.cooldown <= 0) {
              w.isSpinning = false;
              w.cooldown = 0.35;

              const reward = w.pendingReward || 0;
              const isJackpot = w.pendingIsJackpot || false;

              if (reward > 0) {
                nextCoins += reward;
                nextStats.totalWins += 1;
                nextStats.totalCoinsEarned += reward;

                if (isJackpot) {
                  nextStats.totalJackpots += 1;
                  sound.playJackpot();
                } else {
                  sound.playWin(w.level > 5 ? 2 : 1);
                }

                if (!nextIsFever) {
                  const feverGain = 15 * (1 + (prev.upgrades['up_fever_charge'] || 0) * 0.25);
                  nextFeverEnergy = Math.min(100, nextFeverEnergy + feverGain);
                  if (nextFeverEnergy >= 100) {
                    nextIsFever = true;
                    nextFeverTime = prev.relics['relic_god_gambler'] ? 30 : 15;
                    nextStats.feverActivations += 1;
                    sound.playFever();
                  }
                }
              }
              w.pendingReward = 0;
              w.pendingIsJackpot = false;
            }
          } else if (w.cooldown > 0) {
            w.cooldown = Math.max(0, w.cooldown - TICK_RATE);
            stateChanged = true;
          } else if (w.autoDealerLevel > 0 && !w.autoDealerPaused) {
            if (w.autoDealerCooldown === undefined || w.autoDealerCooldown === null) {
              w.autoDealerCooldown = getDealerInterval(w, prev);
            }
            if (w.autoDealerCooldown > 0) {
              w.autoDealerCooldown = Math.max(0, w.autoDealerCooldown - TICK_RATE);
              stateChanged = true;
            } else {
              w = startWheelSpin(w, prev);
              nextStats.totalSpins += 1;
              w.autoDealerCooldown = getDealerInterval(w, prev);
              stateChanged = true;
            }
          }

          return w;
        });

        if (!stateChanged && nextCoins === prev.coins) return prev;

        return {
          ...prev,
          coins: nextCoins,
          feverEnergy: nextFeverEnergy,
          isFeverMode: nextIsFever,
          feverTimeRemaining: nextFeverTime,
          wheels: nextWheels,
          stats: nextStats,
        };
      });
    }, TICK_RATE * 1000);

    return () => clearInterval(timer);
  }, [startWheelSpin]);

  useEffect(() => {
    const saveTimer = setInterval(() => {
      if (typeof window !== 'undefined') {
        const toSave = { ...stateRef.current, lastSaveTime: Date.now() };
        localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
      }
    }, 5000);

    return () => clearInterval(saveTimer);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const toSave = { ...stateRef.current, lastSaveTime: Date.now() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleUnlockWheel = (wheelId: string) => {
    setState((prev) => {
      const target = prev.wheels.find((w) => w.id === wheelId);
      if (!target || target.unlocked || prev.coins < target.unlockCost) return prev;

      return {
        ...prev,
        coins: prev.coins - target.unlockCost,
        wheels: prev.wheels.map((w) => (w.id === wheelId ? { ...w, unlocked: true } : w)),
      };
    });
  };

  const handleUpgradeWheelLevel = (wheelId: string) => {
    setState((prev) => {
      const target = prev.wheels.find((w) => w.id === wheelId);
      if (!target || !target.unlocked) return prev;

      const cost = getWheelUpgradeCost(target);
      if (prev.coins < cost) return prev;

      return {
        ...prev,
        coins: prev.coins - cost,
        wheels: prev.wheels.map((w) => (w.id === wheelId ? { ...w, level: w.level + 1 } : w)),
      };
    });
  };

  const handleUpgradeWheelSector = (wheelId: string) => {
    setState((prev) => {
      const target = prev.wheels.find((w) => w.id === wheelId);
      if (!target || !target.unlocked) return prev;

      const lvl = target.sectorSizeLevel || 0;
      if (lvl >= 15) return prev;

      const cost = getWheelSectorUpgradeCost(target);
      if (prev.coins < cost) return prev;

      return {
        ...prev,
        coins: prev.coins - cost,
        wheels: prev.wheels.map((w) =>
          w.id === wheelId ? { ...w, sectorSizeLevel: lvl + 1 } : w
        ),
      };
    });
  };

  const handleEvolveWheel = (wheelId: string) => {
    setState((prev) => {
      const target = prev.wheels.find((w) => w.id === wheelId);
      if (!target || !target.unlocked) return prev;

      const cost = getWheelEvolveCost(target);
      if (cost === null || prev.coins < cost) return prev;

      const nextThemeLvl = (target.themeLevel || 0) + 1;

      return {
        ...prev,
        coins: prev.coins - cost,
        wheels: prev.wheels.map((w) => {
          if (w.id === wheelId) {
            const updated = { ...w, themeLevel: nextThemeLvl };
            return applyThemeToWheel(updated);
          }
          return w;
        }),
      };
    });
  };

  const handleToggleDealerPause = (wheelId: string) => {
    setState((prev) => ({
      ...prev,
      wheels: prev.wheels.map((w) =>
        w.id === wheelId ? { ...w, autoDealerPaused: !w.autoDealerPaused } : w
      ),
    }));
  };

  const handleBuyUpgrade = (upgradeId: string) => {
    setState((prev) => {
      const config = UPGRADES_LIST.find((u) => u.id === upgradeId);
      if (!config) return prev;
      const currentLv = prev.upgrades[upgradeId] || 0;
      if (currentLv >= config.maxLevel) return prev;

      const cost = Math.round(config.cost * Math.pow(config.costMultiplier, currentLv));
      if (prev.coins < cost) return prev;

      return {
        ...prev,
        coins: prev.coins - cost,
        upgrades: { ...prev.upgrades, [upgradeId]: currentLv + 1 },
      };
    });
  };

  const handleHireDealer = (wheelId: string) => {
    setState((prev) => {
      const target = prev.wheels.find((w) => w.id === wheelId);
      if (!target || !target.unlocked || target.autoDealerLevel > 0) return prev;

      const cost = getDealerHireCost(target);
      if (prev.coins < cost) return prev;

      return {
        ...prev,
        coins: prev.coins - cost,
        wheels: prev.wheels.map((w) => (w.id === wheelId ? { ...w, autoDealerLevel: 1 } : w)),
      };
    });
  };

  const handleUpgradeDealer = (wheelId: string) => {
    setState((prev) => {
      const target = prev.wheels.find((w) => w.id === wheelId);
      if (!target || !target.unlocked || target.autoDealerLevel === 0 || target.autoDealerLevel >= 10) return prev;

      const cost = getDealerUpgradeCost(target);
      if (prev.coins < cost) return prev;

      return {
        ...prev,
        coins: prev.coins - cost,
        wheels: prev.wheels.map((w) =>
          w.id === wheelId ? { ...w, autoDealerLevel: w.autoDealerLevel + 1 } : w
        ),
      };
    });
  };

  const handleBuyRelic = (relicId: string) => {
    setState((prev) => {
      const config = RELICS_LIST.find((r) => r.id === relicId);
      if (!config || prev.relics[relicId]) return prev;

      const cost = config.cost;
      if (prev.goldenTokens < cost) return prev;

      return {
        ...prev,
        goldenTokens: prev.goldenTokens - cost,
        relics: { ...prev.relics, [relicId]: true },
      };
    });
  };

  const handlePrestige = () => {
    setState((prev) => {
      const earnedTokens = getPrestigeTokensEarned(prev.stats.totalCoinsEarned);
      if (earnedTokens <= 0) return prev;

      return {
        ...prev,
        coins: 100,
        goldenTokens: prev.goldenTokens + earnedTokens,
        feverEnergy: 0,
        isFeverMode: false,
        feverTimeRemaining: 0,
        wheels: INITIAL_WHEELS,
        upgrades: {},
        stats: {
          ...prev.stats,
          totalCoinsEarned: 0,
          prestigeCount: prev.stats.prestigeCount + 1,
        },
      };
    });
  };

  const handleResetSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAVE_KEY);
    }
    setState(migrateSave(null));
  };

  const globMult = getGlobalMultiplier(state);

  return (
    <div className="w-full min-h-screen bg-slate-950 sm:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] sm:from-indigo-950 sm:via-slate-900 sm:to-slate-950 text-slate-100 flex justify-center items-start sm:py-8 overflow-x-hidden select-none pb-safe">
      {offlineReward && (
        <OfflineModal
          coinsEarned={offlineReward.coins}
          offlineSeconds={offlineReward.seconds}
          onClaim={handleClaimOffline}
        />
      )}

      {/* 手机竖屏完美模拟容器 */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[920px] sm:rounded-[36px] sm:shadow-[0_0_50px_rgba(0,0,0,0.85)] sm:border sm:border-slate-800/80 bg-slate-950 flex flex-col relative overflow-hidden">
        
        <Header
          coins={state.coins}
          goldenTokens={state.goldenTokens}
          feverEnergy={state.feverEnergy}
          isFeverMode={state.isFeverMode}
          feverTimeRemaining={state.feverTimeRemaining}
          soundEnabled={state.soundEnabled}
          onToggleSound={() => setState((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
          onResetSave={handleResetSave}
          hasGodGambler={!!state.relics['relic_god_gambler']}
        />

        <main className="flex-1 overflow-y-auto px-3 pt-3 flex flex-col gap-3 pb-24 scrollbar-thin">
          {activeTab === 'wheels' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Dices className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                  <span className="text-slate-300">
                    转动轮盘赚取金币！通过 <strong className="text-amber-300">扩张面积、升阶进化</strong> 自主创造海量流派，更有发牌员伴你狂飙。
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {state.wheels.map((wheel, idx) => {
                  const prevWheel = idx > 0 ? state.wheels[idx - 1] : null;
                  if (prevWheel && !prevWheel.unlocked) return null;

                  const upgradeCost = getWheelUpgradeCost(wheel);
                  const canUnlock = state.coins >= wheel.unlockCost;
                  const canUpgrade = state.coins >= upgradeCost && wheel.unlocked;

                  const actualWinChance = getWinChance(wheel, state);
                  const actualJackpotChance = getJackpotChance(wheel, state);
                  const actualSpinDuration = getSpinDuration(wheel, state);

                  return (
                    <WheelCard
                      key={wheel.id}
                      wheel={wheel}
                      globalMultiplier={globMult}
                      isFever={state.isFeverMode}
                      actualWinChance={actualWinChance}
                      actualJackpotChance={actualJackpotChance}
                      actualSpinDuration={actualSpinDuration}
                      canUnlock={canUnlock}
                      canUpgrade={canUpgrade}
                      upgradeCost={upgradeCost}
                      coins={state.coins}
                      onSpin={triggerSpin}
                      onUnlock={handleUnlockWheel}
                      onUpgradeLevel={handleUpgradeWheelLevel}
                      onUpgradeSector={handleUpgradeWheelSector}
                      onEvolve={handleEvolveWheel}
                      onToggleDealerPause={handleToggleDealerPause}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'upgrades' && (
            <UpgradesTab
              coins={state.coins}
              upgradesLevels={state.upgrades}
              onBuyUpgrade={handleBuyUpgrade}
            />
          )}

          {activeTab === 'dealers' && (
            <DealersTab
              wheels={state.wheels}
              coins={state.coins}
              onHireDealer={handleHireDealer}
              onUpgradeDealer={handleUpgradeDealer}
            />
          )}

          {activeTab === 'prestige' && (
            <PrestigeTab
              coins={state.coins}
              goldenTokens={state.goldenTokens}
              totalCoinsEarned={state.stats.totalCoinsEarned}
              unlockedRelics={state.relics}
              onPrestige={handlePrestige}
              onBuyRelic={handleBuyRelic}
              onResetSave={handleResetSave}
            />
          )}
        </main>

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          canPrestige={state.stats.totalCoinsEarned >= 10000}
        />
      </div>
    </div>
  );
}
