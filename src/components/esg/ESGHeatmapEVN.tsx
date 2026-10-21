'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import {
  Flame,
  Zap,
  DollarSign,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  Factory,
} from 'lucide-react';

// EVN Tariff constants (VND/kWh for 22kV - 110kV industrial manufacturing)
const EVN_TARIFF = {
  offPeak: 1180, // 22:00 - 04:00 (All days)
  standard: 1780, // Standard operating hours
  peak: 3250, // Peak hours: 09:30 - 11:30 & 17:00 - 20:00 (Mon - Sat)
};

// Grid CO2 emission factor for Vietnam (~0.72 kg CO2e / kWh)
const GRID_CO2_FACTOR = 0.72;

// Days of the week (Monday to Sunday)
const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Thứ 2', short: 'T2', isWeekend: false },
  { key: 'tue', label: 'Thứ 3', short: 'T3', isWeekend: false },
  { key: 'wed', label: 'Thứ 4', short: 'T4', isWeekend: false },
  { key: 'thu', label: 'Thứ 5', short: 'T5', isWeekend: false },
  { key: 'fri', label: 'Thứ 6', short: 'T6', isWeekend: false },
  { key: 'sat', label: 'Thứ 7', short: 'T7', isWeekend: false },
  { key: 'sun', label: 'Chủ nhật', short: 'CN', isWeekend: true },
];

// Helper to determine EVN tariff type for an hour (0 to 23) and day
export const getEVNTariffType = (
  hour: number,
  isWeekend: boolean
): 'offPeak' | 'standard' | 'peak' => {
  // Sunday: No peak hours under EVN manufacturing tariffs
  if (isWeekend) {
    if (hour >= 22 || hour < 4) return 'offPeak';
    return 'standard';
  }

  // Monday to Saturday:
  if (hour >= 22 || hour < 4) return 'offPeak';
  if ((hour >= 9.5 && hour < 11.5) || (hour >= 17 && hour < 20)) {
    // For integer hour blocks: 10 is peak, 17, 18, 19 are peak. Hour 9 is 9:00-10:00 (part peak)
    return 'peak';
  }
  return 'standard';
};

export const ESGHeatmapEVN: React.FC = () => {
  const { factories, selectedFactoryId, setSelectedFactoryId } = useESGSimulation();

  const [activeScope, setActiveScope] = useState<string>('all'); // 'all' | factoryId
  const [displayMode, setDisplayMode] = useState<'power' | 'cost' | 'co2'>('power');
  const [hoveredCell, setHoveredCell] = useState<{
    dayLabel: string;
    hour: number;
    tariffType: 'offPeak' | 'standard' | 'peak';
    powerKW: number;
    costVND: number;
    co2Kg: number;
  } | null>(null);

  // Generate deterministic realistic hourly load profile matrix (7 days x 24 hours)
  // Scaled by selected scope
  const getMultiplier = () => {
    if (activeScope === 'nm-vnm-bd') return 0.42;
    if (activeScope === 'nm-mega-dairy') return 0.32;
    if (activeScope === 'nm-thong-nhat') return 0.26;
    return 1.0; // Corporate 3 factories
  };

  const multiplier = getMultiplier();

  // Synthetic load curve per hour (base corporate kW)
  const baseLoadByHour: number[] = [
    260, 240, 230, 245, 290, 340, 390, 420, 440, 490, 520, 460, 420, 435, 450, 465,
    480, 530, 510, 490, 410, 350, 290, 270,
  ];

  // Calculate cell value for day and hour
  const getCellMetrics = (dayIdx: number, hour: number) => {
    const isWeekend = dayIdx === 6; // Sunday
    const isSaturday = dayIdx === 5;
    const base = baseLoadByHour[hour];

    // Day variation
    let dayFactor = 1.0;
    if (isWeekend) dayFactor = 0.55; // Sunday off-peak maintenance
    else if (isSaturday) dayFactor = 0.85;
    else if (dayIdx === 1 || dayIdx === 2) dayFactor = 1.05; // Peak mid-week production

    // Minor pseudo-random noise seeded deterministically
    const noise = Math.sin(dayIdx * 3 + hour * 1.5) * 15;
    const powerKW = Math.round((base * dayFactor + noise) * multiplier);

    const tariffType = getEVNTariffType(hour, isWeekend);
    const unitPrice = EVN_TARIFF[tariffType];
    const costVND = Math.round(powerKW * unitPrice);
    const co2Kg = Math.round(powerKW * GRID_CO2_FACTOR * 10) / 10;

    return { powerKW, costVND, co2Kg, tariffType };
  };

  // Pre-calculate weekly aggregates for summary KPIs
  let totalWeeklyPower = 0;
  let totalWeeklyCost = 0;
  let totalWeeklyCO2 = 0;
  let offPeakPower = 0;
  let standardPower = 0;
  let peakPower = 0;
  let maxPowerPeak = 0;

  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const cell = getCellMetrics(d, h);
      totalWeeklyPower += cell.powerKW;
      totalWeeklyCost += cell.costVND;
      totalWeeklyCO2 += cell.co2Kg;

      if (cell.powerKW > maxPowerPeak) maxPowerPeak = cell.powerKW;

      if (cell.tariffType === 'offPeak') offPeakPower += cell.powerKW;
      else if (cell.tariffType === 'peak') peakPower += cell.powerKW;
      else standardPower += cell.powerKW;
    }
  }

  const offPeakPct = Math.round((offPeakPower / totalWeeklyPower) * 100);
  const standardPct = Math.round((standardPower / totalWeeklyPower) * 100);
  const peakPct = Math.round((peakPower / totalWeeklyPower) * 100);
  const avgHourlyPower = Math.round(totalWeeklyPower / (7 * 24));
  const peakToAvgRatio = (maxPowerPeak / avgHourlyPower).toFixed(2);

  // Color intensity mapping based on kW range
  const getCellColorClass = (powerKW: number, tariffType: 'offPeak' | 'standard' | 'peak') => {
    // Relative intensity
    const intensity = powerKW / maxPowerPeak;

    if (tariffType === 'peak') {
      if (intensity > 0.85) return 'bg-red-600 text-white font-bold ring-1 ring-red-400';
      if (intensity > 0.7) return 'bg-rose-500 text-white font-semibold';
      return 'bg-amber-400 text-slate-900 font-medium';
    }

    if (tariffType === 'offPeak') {
      if (intensity > 0.6) return 'bg-emerald-600 text-white font-semibold';
      if (intensity > 0.4) return 'bg-emerald-500 text-white';
      return 'bg-emerald-200 text-emerald-950';
    }

    // Standard tariff hours
    if (intensity > 0.85) return 'bg-orange-500 text-white font-bold';
    if (intensity > 0.7) return 'bg-amber-400 text-slate-900 font-semibold';
    if (intensity > 0.5) return 'bg-sky-400 text-slate-900';
    return 'bg-sky-200 text-sky-950';
  };

  return (
    <div className="space-y-4">
      {/* Heatmap Header & Controls Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                EVN TARIFF MATRIX
              </span>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span>Bản đồ nhiệt Phụ tải Điện 24/7 theo Biểu giá EVN</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích phụ tải theo 3 khung giờ (Giờ cao điểm • Giờ bình thường • Giờ thấp điểm) hỗ trợ tối ưu dịch chuyển phụ tải (Load Shifting).
            </p>
          </div>

          {/* Scope and Display Mode Selectors */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Scope Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setActiveScope('all')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeScope === 'all'
                    ? 'bg-white text-teal-800 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>Toàn Tập đoàn</span>
              </button>
              {factories.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveScope(f.id)}
                  className={`px-2 py-1 rounded-md transition-all ${
                    activeScope === f.id
                      ? 'bg-white text-teal-800 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.code}
                </button>
              ))}
            </div>

            {/* Display Metric Mode */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setDisplayMode('power')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  displayMode === 'power'
                    ? 'bg-amber-500 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Phụ tải (kW)</span>
              </button>
              <button
                onClick={() => setDisplayMode('cost')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  displayMode === 'cost'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3 h-3" />
                <span>Tiền điện</span>
              </button>
              <button
                onClick={() => setDisplayMode('co2')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  displayMode === 'co2'
                    ? 'bg-red-500 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Phát thải CO₂</span>
              </button>
            </div>
          </div>
        </div>

        {/* EVN Tariff Definition Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-900 block">Giờ Thấp điểm (Off-peak)</span>
                <span className="text-[11px] text-emerald-700">22:00 - 04:00 sáng hôm sau (7/7 ngày)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-emerald-800 text-xs">
                {EVN_TARIFF.offPeak.toLocaleString('vi-VN')} đ/kWh
              </span>
              <span className="text-[10px] text-emerald-600 block">Giá tiết kiệm nhất</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50 border border-sky-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-500 flex-shrink-0" />
              <div>
                <span className="font-bold text-sky-900 block">Giờ Bình thường (Standard)</span>
                <span className="text-[11px] text-sky-700">04:00-09:30 • 11:30-17:00 • 20:00-22:00</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-sky-800 text-xs">
                {EVN_TARIFF.standard.toLocaleString('vi-VN')} đ/kWh
              </span>
              <span className="text-[10px] text-sky-600 block">Biểu giá chuẩn</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
              <div>
                <span className="font-bold text-rose-900 block">Giờ Cao điểm (Peak Hours)</span>
                <span className="text-[11px] text-rose-700">09:30-11:30 & 17:00-20:00 (Thứ 2 - Thứ 7)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-red-700 text-xs">
                {EVN_TARIFF.peak.toLocaleString('vi-VN')} đ/kWh
              </span>
              <span className="text-[10px] text-red-600 block">Cao gấp ~2.8 lần</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Heatmap Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs overflow-x-auto">
        <div className="min-w-[840px]">
          {/* Timeline Header (Hour Labels 00h to 23h + EVN tariff indicator tags) */}
          <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 pb-1 items-end text-center">
            <div className="text-[11px] font-bold text-slate-400 text-left pl-1">Khung</div>
            {Array.from({ length: 24 }).map((_, h) => {
              const isPeakHour = (h >= 10 && h <= 11) || (h >= 17 && h <= 19);
              const isOffPeakHour = h >= 22 || h < 4;

              return (
                <div key={h} className="flex flex-col items-center">
                  <span
                    className={`w-1.5 h-1.5 rounded-full mb-1 ${
                      isPeakHour
                        ? 'bg-red-500 ring-2 ring-red-200'
                        : isOffPeakHour
                        ? 'bg-emerald-400'
                        : 'bg-sky-400'
                    }`}
                    title={
                      isPeakHour
                        ? 'Khung giờ Cao điểm EVN'
                        : isOffPeakHour
                        ? 'Khung giờ Thấp điểm EVN'
                        : 'Khung giờ Bình thường EVN'
                    }
                  />
                  <span
                    className={`text-[10px] font-mono ${
                      isPeakHour ? 'font-bold text-red-700' : 'text-slate-500'
                    }`}
                  >
                    {h < 10 ? `0${h}` : h}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 7 Days Matrix Rows */}
          <div className="space-y-1 mt-1">
            {DAYS_OF_WEEK.map((day, dayIdx) => (
              <div
                key={day.key}
                className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 items-center"
              >
                {/* Day of Week Label */}
                <div
                  className={`text-xs font-bold py-2 px-1 rounded flex items-center justify-between ${
                    day.isWeekend
                      ? 'text-teal-700 bg-teal-50/60'
                      : 'text-slate-700 bg-slate-50'
                  }`}
                >
                  <span>{day.label}</span>
                </div>

                {/* 24 Hour Cells */}
                {Array.from({ length: 24 }).map((_, hour) => {
                  const cell = getCellMetrics(dayIdx, hour);
                  const isHovered =
                    hoveredCell?.dayLabel === day.label && hoveredCell?.hour === hour;

                  return (
                    <div
                      key={hour}
                      onMouseEnter={() =>
                        setHoveredCell({
                          dayLabel: day.label,
                          hour,
                          tariffType: cell.tariffType,
                          powerKW: cell.powerKW,
                          costVND: cell.costVND,
                          co2Kg: cell.co2Kg,
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-9 rounded flex flex-col items-center justify-center cursor-pointer transition-all duration-150 relative ${getCellColorClass(
                        cell.powerKW,
                        cell.tariffType
                      )} ${isHovered ? 'scale-110 z-20 shadow-md ring-2 ring-slate-900' : ''}`}
                    >
                      <span className="text-[10px] font-mono leading-none">
                        {displayMode === 'power' && `${cell.powerKW}`}
                        {displayMode === 'cost' && `${Math.round(cell.costVND / 1000)}k`}
                        {displayMode === 'co2' && `${Math.round(cell.co2Kg)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Hover Detail Strip */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs min-h-[38px]">
            {hoveredCell ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-slate-800">
                  {hoveredCell.dayLabel}, {hoveredCell.hour}:00 - {hoveredCell.hour + 1}:00:
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                    hoveredCell.tariffType === 'peak'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : hoveredCell.tariffType === 'offPeak'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-sky-100 text-sky-800 border border-sky-300'
                  }`}
                >
                  {hoveredCell.tariffType === 'peak' && '🔴 Giờ Cao điểm (3.250 đ/kWh)'}
                  {hoveredCell.tariffType === 'offPeak' && '🟢 Giờ Thấp điểm (1.180 đ/kWh)'}
                  {hoveredCell.tariffType === 'standard' && '🔵 Giờ Bình thường (1.780 đ/kWh)'}
                </span>
                <span className="font-mono text-slate-700">
                  Phụ tải: <strong>{hoveredCell.powerKW} kW</strong>
                </span>
                <span className="font-mono text-emerald-700">
                  Tiền điện: <strong>{hoveredCell.costVND.toLocaleString('vi-VN')} đ</strong>
                </span>
                <span className="font-mono text-red-600">
                  Phát thải: <strong>{hoveredCell.co2Kg} kg CO₂e</strong>
                </span>
              </div>
            ) : (
              <div className="text-slate-400 italic text-[11px] flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Rê chuột vào từng ô 24h để xem chi tiết phụ tải, tiền điện và phát thải CO₂ theo biểu giá EVN.</span>
              </div>
            )}

            <div className="text-[11px] text-slate-500 font-mono">
              Hệ số phát thải biên lưới: <strong>0.72 kg CO₂/kWh</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Off-peak load share */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-900 font-semibold mb-1">
              <span>Tỷ trọng Giờ Thấp điểm</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono">
                {offPeakPct}%
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-950">
              {offPeakPower.toLocaleString('vi-VN')} kWh
            </div>
            <span className="text-[11px] text-emerald-700 block mt-0.5">
              Khung giờ vàng tiết kiệm chi phí
            </span>
          </div>
          <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-600 h-full" style={{ width: `${offPeakPct}%` }} />
          </div>
        </div>

        {/* Standard load share */}
        <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-sky-900 font-semibold mb-1">
              <span>Tỷ trọng Giờ Bình thường</span>
              <span className="text-xs bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold font-mono">
                {standardPct}%
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-sky-950">
              {standardPower.toLocaleString('vi-VN')} kWh
            </div>
            <span className="text-[11px] text-sky-700 block mt-0.5">
              Vận hành sản xuất tiêu chuẩn
            </span>
          </div>
          <div className="w-full bg-sky-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-sky-600 h-full" style={{ width: `${standardPct}%` }} />
          </div>
        </div>

        {/* Peak load share */}
        <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-rose-900 font-semibold mb-1">
              <span>Tỷ trọng Giờ Cao điểm</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-bold font-mono ${
                  peakPct > 20
                    ? 'bg-red-200 text-red-900 animate-pulse'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {peakPct}%
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-rose-950">
              {peakPower.toLocaleString('vi-VN')} kWh
            </div>
            <span className="text-[11px] text-rose-700 block mt-0.5">
              Đơn giá cao ~3.250 đ/kWh
            </span>
          </div>
          <div className="w-full bg-rose-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-red-600 h-full" style={{ width: `${peakPct}%` }} />
          </div>
        </div>

        {/* Total Cost & Peak-to-Average ratio */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
              <span>Ước tính Tiền điện Tuần</span>
              <span className="text-[10px] text-slate-500 font-mono">PAR: {peakToAvgRatio}</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900">
              {(totalWeeklyCost / 1000000).toFixed(1)} triệu đ
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Tổng phát thải: {(totalWeeklyCO2 / 1000).toFixed(1)} tấn CO₂e
            </span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 flex items-center justify-between mt-2">
            <span>Đỉnh phụ tải: {maxPowerPeak} kW</span>
            <span>Bình quân: {avgHourlyPower} kW</span>
          </div>
        </div>
      </div>
    </div>
  );
};
