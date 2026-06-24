import React from 'react';
import { TabType } from '../types';
import { sound } from '../utils/sound';
import { Dices, TrendingUp, Bot, Crown } from 'lucide-react';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  canPrestige: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  canPrestige,
}) => {
  const navItems = [
    { id: 'wheels' as TabType, label: '转盘大厅', icon: Dices, badge: false },
    { id: 'upgrades' as TabType, label: '规则升级', icon: TrendingUp, badge: false },
    { id: 'dealers' as TabType, label: '发牌员', icon: Bot, badge: false },
    { id: 'prestige' as TabType, label: '离岸转生', icon: Crown, badge: canPrestige },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                sound.playClick();
              }}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition relative active:scale-90 cursor-pointer ${
                isActive
                  ? 'text-amber-400 bg-amber-500/10 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                )}
              </div>
              <span className="text-[11px] font-sans mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-amber-400 rounded-full shadow-sm shadow-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
