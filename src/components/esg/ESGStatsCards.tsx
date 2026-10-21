'use client';

import React from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import { Zap, Flame, Droplet, AlertTriangle, ArrowUpDown } from 'lucide-react';

export const ESGStatsCards: React.FC = () => {
  const {
    scopedTotals,
    unitPreferences,
    toggleUnit,
    isLiveStreaming,
    currentRoleConfig,
  } = useESGSimulation();

  // Thresholds from role config
  const powerLimitKWh = currentRoleConfig.thresholds.powerDanger;
  const co2LimitKg = currentRoleConfig.thresholds.co2Danger;
  const waterLimitM3 = currentRoleConfig.thresholds.waterDanger;

  // Ratios and Percentages
  const powerRatio = scopedTotals.powerKWh / powerLimitKWh;
  const powerPct = (powerRatio * 100).toFixed(1);

  const co2Ratio = scopedTotals.co2Kg / co2LimitKg;
  const co2Pct = (co2Ratio * 100).toFixed(1);

  const waterRatio = scopedTotals.waterM3 / waterLimitM3;
  const waterPct = (waterRatio * 100).toFixed(1);

  // Format Power
  const isMWh = unitPreferences.power === 'MWh';
  const powerDisplay = isMWh
    ? (scopedTotals.powerKWh / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : scopedTotals.powerKWh.toLocaleString('vi-VN');
  const powerUnit = isMWh ? 'MWh' : 'kWh';
  const powerLimitDisplay = isMWh
    ? `${(powerLimitKWh / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} MWh`
    : `${powerLimitKWh.toLocaleString('vi-VN')} kWh`;

  // Format CO2
  const isTon = unitPreferences.co2 === 'ton';
  const co2Display = isTon
    ? (scopedTotals.co2Kg / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : scopedTotals.co2Kg.toLocaleString('vi-VN');
  const co2Unit = isTon ? 'tấn CO2e' : 'kg CO2e';
  const co2LimitDisplay = isTon
    ? `${(co2LimitKg / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} tấn`
    : `${co2LimitKg.toLocaleString('vi-VN')} kg`;

  // Format Water
  const isLiter = unitPreferences.water === 'liter';
  const waterDisplay = isLiter
    ? (scopedTotals.waterM3 * 1000).toLocaleString('vi-VN')
    : scopedTotals.waterM3.toLocaleString('vi-VN');
  const waterUnit = isLiter ? 'Lít' : 'm³';
  const waterLimitDisplay = isLiter
    ? `${(waterLimitM3 * 1000).toLocaleString('vi-VN')} L`
    : `${waterLimitM3.toLocaleString('vi-VN')} m³`;

  const getStatusBadge = (ratio: number, pct: string) => {
    if (ratio >= 1.0) {
      return (
        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded text-red-700 bg-red-50 border border-red-200">
          {pct}% (Vượt định mức)
        </span>
      );
    }
    if (ratio >= 0.8) {
      return (
        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded text-amber-700 bg-amber-50 border border-amber-200">
          {pct}% (Cận định mức)
        </span>
      );
    }
    return (
      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded text-emerald-700 bg-emerald-50 border border-emerald-200">
        {pct}% định mức
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Power */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Lưu lượng điện tiêu thụ
              </span>
              {isLiveStreaming && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE
                </span>
              )}
            </div>
            <button
              onClick={() => toggleUnit('power')}
              className="text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
              title="Nhấn để chuyển đổi giữa kWh và MWh"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{powerUnit}</span>
            </button>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="text-[23px] font-extrabold text-slate-800 tracking-tight font-mono">
              {powerDisplay} <span className="text-sm font-semibold text-slate-500">{powerUnit}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          {/* Progress Bar vs Quota */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                powerRatio >= 1.0 ? 'bg-red-500' : powerRatio >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, powerRatio * 100))}%` }}
            />
          </div>
        </div>

        {/* Standard Quota & Percentage */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
          <span>
            Định mức: <strong className="font-mono text-slate-700">{powerLimitDisplay}</strong>
          </span>
          {getStatusBadge(powerRatio, powerPct)}
        </div>
      </div>

      {/* Card 2: Carbon CO2 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Khí thải Carbon (CO₂)
              </span>
              {isLiveStreaming && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE
                </span>
              )}
            </div>
            <button
              onClick={() => toggleUnit('co2')}
              className="text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
              title="Nhấn để chuyển đổi giữa kg và tấn CO2e"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{co2Unit}</span>
            </button>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="text-[23px] font-extrabold text-slate-800 tracking-tight font-mono">
              {co2Display} <span className="text-sm font-semibold text-slate-500">{co2Unit}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          {/* Progress Bar vs Quota */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                co2Ratio >= 1.0 ? 'bg-red-500' : co2Ratio >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, co2Ratio * 100))}%` }}
            />
          </div>
        </div>

        {/* Standard Quota & Percentage */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
          <span>
            Định mức: <strong className="font-mono text-slate-700">{co2LimitDisplay}</strong>
          </span>
          {getStatusBadge(co2Ratio, co2Pct)}
        </div>
      </div>

      {/* Card 3: Water */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Nước thải công nghiệp
              </span>
              {isLiveStreaming && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE
                </span>
              )}
            </div>
            <button
              onClick={() => toggleUnit('water')}
              className="text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
              title="Nhấn để chuyển đổi giữa m³ và Lít"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{waterUnit}</span>
            </button>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="text-[23px] font-extrabold text-slate-800 tracking-tight font-mono">
              {waterDisplay} <span className="text-sm font-semibold text-slate-500">{waterUnit}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
          </div>

          {/* Progress Bar vs Quota */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                waterRatio >= 1.0 ? 'bg-red-500' : waterRatio >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, waterRatio * 100))}%` }}
            />
          </div>
        </div>

        {/* Standard Quota & Percentage */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
          <span>
            Định mức: <strong className="font-mono text-slate-700">{waterLimitDisplay}</strong>
          </span>
          {getStatusBadge(waterRatio, waterPct)}
        </div>
      </div>

      {/* Card 4: Alerts & Operations */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cảnh báo & An toàn vận hành
            </span>
            <span className={`w-2.5 h-2.5 rounded-full ${scopedTotals.alertCount > 0 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="text-[23px] font-extrabold text-slate-800 tracking-tight flex items-baseline gap-2 font-mono">
              <span>{scopedTotals.alertCount}</span>
              <span className="text-xs font-medium text-slate-500">sự cố cần xử lý</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          {/* Progress/status bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                scopedTotals.alertCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
          <span>Quy mô: {scopedTotals.deviceCount} thiết bị</span>
          <span
            className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
              scopedTotals.alertCount > 0
                ? 'text-amber-800 bg-amber-50 border border-amber-200'
                : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
            }`}
          >
            {scopedTotals.alertCount > 0 ? `${scopedTotals.alertCount} sự cố chờ duyệt` : 'Hệ thống an toàn'}
          </span>
        </div>
      </div>
    </div>
  );
};
