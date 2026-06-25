import { GameState, WheelData } from '../types';
import { INITIAL_WHEELS } from '../data/gameData';

export const THEMES = [
  { level: 0, name: '木质', baseReward: 10, spinDuration: 1.5, jackpotChance: 0.02, costToEvolve: 0 },
  { level: 1, name: '霓虹', baseReward: 100, spinDuration: 2.0, jackpotChance: 0.03, costToEvolve: 500 },
  { level: 2, name: '钻石', baseReward: 1000, spinDuration: 2.5, jackpotChance: 0.04, costToEvolve: 15000 },
  { level: 3, name: '赛博', baseReward: 15000, spinDuration: 3.0, jackpotChance: 0.05, costToEvolve: 800000 },
  { level: 4, name: '量子', baseReward: 250000, spinDuration: 3.5, jackpotChance: 0.06, costToEvolve: 50000000 },
  { level: 5, name: '宇宙', baseReward: 5000000, spinDuration: 4.0, jackpotChance: 0.08, costToEvolve: 3000000000 }
];

/**
 * Applies theme/evolution values (baseReward, spinDuration, jackpotChance, name) to a wheel.
 */
export function applyThemeToWheel(wheel: WheelData): WheelData {
  const tLvl = wheel.themeLevel || 0;
  const theme = THEMES[tLvl] || THEMES[0];
  const slotNum = wheel.id.replace('wheel_', '');
  return {
    ...wheel,
    name: `${theme.name}轮盘 #${slotNum}`,
    baseReward: theme.baseReward,
    spinDuration: theme.spinDuration,
    jackpotChance: theme.jackpotChance,
  };
}

/**
 * Calculates the evolution/theme upgrade cost.
 */
export function getWheelEvolveCost(wheel: WheelData): number | null {
  const nextLvl = (wheel.themeLevel || 0) + 1;
  if (nextLvl >= THEMES.length) return null;
  return THEMES[nextLvl].costToEvolve;
}

/**
 * Calculates the individual sector size upgrade cost.
 */
export function getWheelSectorUpgradeCost(wheel: WheelData): number {
  const lvl = wheel.sectorSizeLevel || 0;
  return Math.round(80 * Math.pow(1.6, lvl));
}

/**
 * Calculates the global multiplier for all wheel earnings.
 * Adjusts global multipliers and prestige golden tokens to +1% per level to prevent extreme hyper-inflation.
 */
export function getGlobalMultiplier(s: GameState): number {
  const baseMult = 1 + (s.upgrades['up_global_mult'] || 0) * 0.01;
  const midasMult = s.relics['relic_midas'] ? 2.0 : 1.0;
  const prestigeMult = 1 + s.goldenTokens * 0.01;
  return baseMult * midasMult * prestigeMult;
}

/**
 * Calculates the actual win chance for a wheel, taking into account fever mode and individual sector upgrades.
 */
export function getWinChance(wheel: WheelData, s: GameState): number {
  if (s.isFeverMode) return 1.0;
  const upgradeBonus = (wheel.sectorSizeLevel || 0) * 0.04;
  return Math.min(0.85, wheel.winChance + upgradeBonus);
}

/**
 * Calculates the actual jackpot chance for a wheel.
 */
export function getJackpotChance(wheel: WheelData, s: GameState): number {
  if (s.isFeverMode) return 0;
  const upgradeBonus = (s.upgrades['up_jackpot_chance'] || 0) * 0.015;
  return wheel.jackpotChance + upgradeBonus;
}

/**
 * Calculates the actual spin duration for a wheel, incorporating dealer speeds, relics, and fever mode.
 */
export function getSpinDuration(wheel: WheelData, s: GameState): number {
  let dur = wheel.spinDuration;
  if (s.relics['relic_perpetual']) dur *= 0.7;
  if (s.isFeverMode) return dur / 3;
  if (wheel.autoDealerLevel > 0) {
    const dealerSpeedBonus = 1 + (wheel.autoDealerLevel - 1) * 0.10 + (s.upgrades['up_auto_speed'] || 0) * 0.12;
    dur /= dealerSpeedBonus;
  }
  return Math.max(0.3, dur);
}

/**
 * Calculates the dealer interval (autospin cooldown) in seconds.
 * Level 1 = 10s, Level 10 = 1s. Accelerated by auto speed upgrades.
 */
export function getDealerInterval(wheel: WheelData, s: GameState): number {
  const baseInterval = Math.max(1.0, 10 - (wheel.autoDealerLevel - 1) * 1.0);
  const speedBonus = 1 + (s.upgrades['up_auto_speed'] || 0) * 0.12;
  return Math.max(1.0, baseInterval / speedBonus);
}

/**
 * Calculates prestige golden tokens earned based on total coins earned.
 */
export function getPrestigeTokensEarned(totalCoinsEarned: number): number {
  return Math.max(0, Math.floor(Math.sqrt(totalCoinsEarned / 10000)));
}

/**
 * Calculates the upgrade cost of a wheel.
 */
export function getWheelUpgradeCost(wheel: WheelData): number {
  return Math.round((wheel.baseReward * 1.5 + 10) * Math.pow(1.15, wheel.level));
}

/**
 * Calculates the cost to hire a dealer for a wheel.
 */
export function getDealerHireCost(wheel: WheelData): number {
  return wheel.baseReward * 15 + 100;
}

/**
 * Calculates the cost to upgrade a dealer.
 */
export function getDealerUpgradeCost(wheel: WheelData): number {
  const hireCost = getDealerHireCost(wheel);
  return Math.round(hireCost * Math.pow(2.2, wheel.autoDealerLevel));
}

/**
 * Migrates a raw saved game state to the current standard GameState structure, supporting backwards compatibility.
 */
export function migrateSave(parsed: any): GameState {
  const wheels = INITIAL_WHEELS.map((initWheel) => {
    const savedWheel = parsed?.wheels?.find((w: any) => w.id === initWheel.id);
    let w = savedWheel ? { ...initWheel, ...savedWheel, isSpinning: false } : initWheel;
    
    // Set default values for the new features
    if (w.sectorSizeLevel === undefined) w.sectorSizeLevel = 0;
    if (w.themeLevel === undefined) w.themeLevel = 0;
    if (w.autoDealerCooldown === undefined) w.autoDealerCooldown = 0;
    if (w.autoDealerPaused === undefined) w.autoDealerPaused = false;
    
    // Reapply theme base values (ensures correct base rewards and names)
    w = applyThemeToWheel(w);
    
    return w;
  });

  return {
    coins: typeof parsed?.coins === 'number' ? parsed.coins : 50,
    goldenTokens: typeof parsed?.goldenTokens === 'number' ? parsed.goldenTokens : 0,
    feverEnergy: typeof parsed?.feverEnergy === 'number' ? parsed.feverEnergy : 0,
    isFeverMode: !!parsed?.isFeverMode,
    feverTimeRemaining: typeof parsed?.feverTimeRemaining === 'number' ? parsed.feverTimeRemaining : 0,
    wheels,
    upgrades: parsed?.upgrades || {},
    relics: parsed?.relics || {},
    soundEnabled: parsed?.soundEnabled !== false,
    lastSaveTime: typeof parsed?.lastSaveTime === 'number' ? parsed.lastSaveTime : Date.now(),
    saveVersion: parsed?.saveVersion || 3,
    stats: {
      totalSpins: parsed?.stats?.totalSpins || 0,
      totalWins: parsed?.stats?.totalWins || 0,
      totalJackpots: parsed?.stats?.totalJackpots || 0,
      totalCoinsEarned: parsed?.stats?.totalCoinsEarned || 0,
      feverActivations: parsed?.stats?.feverActivations || 0,
      prestigeCount: parsed?.stats?.prestigeCount || 0,
    },
  };
}

