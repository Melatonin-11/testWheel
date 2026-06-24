import React from 'react';
import { Sparkles, DollarSign } from 'lucide-react';

interface WheelGraphicProps {
  rotation: number;
  isSpinning: boolean;
  spinDuration?: number;
  winChance: number; // e.g. 0.25 to 0.85
  jackpotChance: number;
  level: number;
  isFever: boolean;
}

export const WheelGraphic: React.FC<WheelGraphicProps> = ({
  rotation,
  isSpinning,
  spinDuration,
  winChance,
  jackpotChance,
  level,
  isFever,
}) => {
  const totalSlices = 12;
  // Calculate how many slices are winning
  const winningSlicesCount = isFever ? 12 : Math.round(winChance * totalSlices);
  const hasJackpotSlice = !isFever && jackpotChance > 0;
  
  // Slices: 0 to 11
  // Let's make slice 0 jackpot if jackpot chance is high enough
  // Slices 1 to winningSlicesCount are Green
  // Remaining are dark gray
  const slices = Array.from({ length: totalSlices }, (_, i) => {
    if (isFever) return 'fever';
    if (i === 0 && hasJackpotSlice) return 'jackpot';
    if (i < winningSlicesCount) return 'win';
    return 'lose';
  });

  return (
    <div className="relative w-36 h-36 mx-auto flex items-center justify-center select-none">
      {/* Outer Golden/Casino Rim */}
      <div className={`absolute inset-0 rounded-full border-4 ${isFever ? 'border-yellow-400 animate-ping' : 'border-amber-500/80'} shadow-lg shadow-amber-500/20 pointer-events-none z-10`} />
      
      {/* Wheel Decorative LED lights rim */}
      <div className="absolute -inset-1 rounded-full border border-amber-400/30 pointer-events-none flex items-center justify-center">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className={`absolute w-1.5 h-1.5 rounded-full ${isSpinning || isFever ? 'bg-amber-300 shadow-sm shadow-amber-300 animate-pulse' : 'bg-slate-700'}`}
            style={{
              transform: `rotate(${idx * 30}deg) translateY(-68px)`,
            }}
          />
        ))}
      </div>

      {/* Top Ticker / Pointer */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-md">
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-red-500" />
      </div>

      {/* Rotating Wheel Container */}
      <div
        className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? `transform ${spinDuration || 1.8}s cubic-bezier(0.1, 0.88, 0.15, 1)`
            : 'none',
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {slices.map((type, i) => {
            const startAngle = (i * 360) / totalSlices;
            const endAngle = ((i + 1) * 360) / totalSlices;

            // Convert polar to cartesian
            const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
            const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
            const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
            const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

            let fillColor = '#1e293b'; // slate-800 lose
            let strokeColor = '#0f172a'; // slate-900

            if (type === 'win') {
              fillColor = i % 2 === 0 ? '#10b981' : '#059669'; // emerald win
            } else if (type === 'jackpot') {
              fillColor = '#eab308'; // gold
            } else if (type === 'fever') {
              fillColor = i % 2 === 0 ? '#ef4444' : '#f59e0b'; // red/orange fever
            } else {
              fillColor = i % 2 === 0 ? '#334155' : '#1e293b'; // gray lose
            }

            return (
              <path
                key={i}
                d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Center Hub (Stationary cap outside rotating wheel) */}
      <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-amber-500 flex items-center justify-center shadow-md z-10 pointer-events-none">
        {isFever ? (
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
        ) : (
          <div className="flex flex-col items-center leading-none">
            <span className="text-[10px] font-mono font-bold text-amber-400">Lv.{level}</span>
          </div>
        )}
      </div>
    </div>
  );
};
