'use client';

import React from 'react';

export interface QuotaBar150Props {
  current: number;
  max: number;
  baseColor?: string;
  heightClass?: string;
  showScaleTicks?: boolean;
  notchLabel?: string;
  className?: string;
}

export const QuotaBar150: React.FC<QuotaBar150Props> = ({
  current,
  max,
  baseColor = 'bg-amber-500',
  heightClass = 'h-2',
  showScaleTicks = false,
  notchLabel = '100%',
  className = '',
}) => {
  const safeMax = max > 0 ? max : 100;
  const safeCurrent = Math.max(0, current);
  const ratio = safeCurrent / safeMax;
  const isOver = ratio > 1.0;

  // 150% scale: 100% (ratio=1.0) sits exactly at (100 / 150) * 100% = 66.67%
  const baseWidthPct = Math.min(66.67, (Math.min(ratio, 1.0) / 1.5) * 100);
  const excessWidthPct = isOver
    ? Math.min(33.33, ((Math.min(ratio, 1.5) - 1.0) / 1.5) * 100)
    : 0;

  return (
    <div className={`w-full ${className}`}>
      {/* 150% Gauge Track */}
      <div
        className={`relative w-full bg-slate-100 ${heightClass} rounded-full overflow-hidden flex`}
        title={`Tiêu thụ: ${safeCurrent.toLocaleString('vi-VN')} / Định mức: ${safeMax.toLocaleString('vi-VN')} (${Math.round(ratio * 100)}%)`}
      >
        {/* Base Segment: 0% up to min(ratio, 100%) */}
        <div
          className={`h-full transition-all duration-300 ${baseColor}`}
          style={{ width: `${baseWidthPct}%` }}
        />

        {/* Excess Segment: beyond 100% up to 150% (Prominent RED with pulse) */}
        {isOver && (
          <div
            className="h-full bg-red-600 transition-all duration-300 animate-pulse"
            style={{ width: `${excessWidthPct}%` }}
          />
        )}

        {/* 100% Standard Quota Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-700/80 z-10"
          style={{ left: '66.67%' }}
          title={`Mức định mức 100% (${safeMax.toLocaleString('vi-VN')})`}
        />
      </div>

      {/* Scale Tick Labels */}
      {showScaleTicks && (
        <div className="relative w-full h-3 text-[9px] font-mono text-slate-400 select-none mt-0.5">
          <span className="absolute left-0">0%</span>
          <span
            className="absolute -translate-x-1/2 font-bold text-slate-600 flex items-center gap-0.5"
            style={{ left: '66.67%' }}
          >
            <span className="text-slate-400">|</span> {notchLabel}
          </span>
          <span className="absolute right-0 text-red-500 font-semibold">150%</span>
        </div>
      )}
    </div>
  );
};
