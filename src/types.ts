export interface WheelData {
  id: string;
  name: string;
  unlocked: boolean;
  unlockCost: number;
  level: number;
  winChance: number; // 0.25 to 0.85
  jackpotChance: number; // 0.02 to 0.20
  baseReward: number;
  spinDuration: number; // in seconds
  cooldown: number; // current remaining cooldown
  isSpinning: boolean;
  currentRotation: number; // degrees
  pendingReward?: number;
  pendingIsJackpot?: boolean;
  currentSpinDuration?: number;
  autoDealerLevel: number; // 0 = manual only, 1+ = auto spins
  autoSpeedMultiplier: number;
  autoDealerCooldown?: number; // dealer delay timer (seconds)
  autoDealerPaused?: boolean;  // toggle for dealer pausing
  sectorSizeLevel?: number;    // individual sector size upgrade level (max 15)
  themeLevel?: number;         // individual evolution/theme (0 to 5)
}

export interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  costMultiplier: number;
  level: number;
  maxLevel: number;
  category: 'wheel' | 'dealer' | 'global' | 'prestige';
  iconName: string;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  effectType: 'global_mult' | 'offline_rate' | 'fever_duration' | 'jackpot_boost';
  effectValue: number;
  iconName: string;
}

export interface GameStats {
  totalSpins: number;
  totalWins: number;
  totalJackpots: number;
  totalCoinsEarned: number;
  feverActivations: number;
  prestigeCount: number;
}

export interface GameState {
  coins: number;
  goldenTokens: number; // Prestige currency
  feverEnergy: number; // 0 to 100
  isFeverMode: boolean;
  feverTimeRemaining: number;
  lastSaveTime: number;
  soundEnabled: boolean;
  wheels: WheelData[];
  upgrades: Record<string, number>; // upgradeId -> level
  relics: Record<string, boolean>; // relicId -> unlocked
  stats: GameStats;
  saveVersion?: number;
}

export type TabType = 'wheels' | 'upgrades' | 'dealers' | 'prestige' | 'stats';
