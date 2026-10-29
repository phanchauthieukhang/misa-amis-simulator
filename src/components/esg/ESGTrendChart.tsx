'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import { ESG_TREND_DATA } from '@/data/vinamilk-mock';
import { MetricType } from '@/types/esg';
import { TrendingUp, Zap, Flame, Droplet, Target, AlertCircle } from 'lucide-react';

export const ESGTrendChart: React.FC = () => {
  const { timePeriod, scopedTotals } = useESGSimulation();
  const [selectedMetric, setSelectedMetric] = useState<MetricType | 'all'>('all');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showQuotaLine, setShowQuotaLine] = useState<boolean>(true);

  const baseData =
    ESG_TREND_DATA[timePeriod as keyof typeof ESG_TREND_DATA] || ESG_TREND_DATA.year;

  // Quota benchmark calculations per step
  const numPoints = Math.max(1, baseData.length);
  const quotaPower = Math.round(scopedTotals.effectivePowerLimit / numPoints);
  const quotaCo2 = Math.round(scopedTotals.effectiveCo2Limit / numPoints);
  const quotaWater = Number((scopedTotals.effectiveWaterLimit / numPoints).toFixed(1));

  // Dynamically synchronize the active/current data point(s) with real-time scopedTotals
  // so that any scenario or anomaly that pushes KPI totals over 100% also pushes the trend line over the 100% Quota Line!
  const pRatio = scopedTotals.effectivePowerLimit > 0 ? scopedTotals.powerKWh / scopedTotals.effectivePowerLimit : 0.7;
  const cRatio = scopedTotals.effectiveCo2Limit > 0 ? scopedTotals.co2Kg / scopedTotals.effectiveCo2Limit : 0.7;
  const wRatio = scopedTotals.effectiveWaterLimit > 0 ? scopedTotals.waterM3 / scopedTotals.effectiveWaterLimit : 0.7;

  // Determine which index in the series represents the active live (or audited closing) point
  const getActivePointIndex = () => {
    if (timePeriod === 'm10_2026') return 2; // Tuần 3 (T10 - Hiện tại)
    if (timePeriod === 'q4_2026') return 0; // Tháng 10 (Hiện tại)
    if (timePeriod === 'h2_2026') return 3; // Tháng 10 (Hiện tại)
    if (timePeriod === 'year_2026') return 3; // Quý IV (Đang chạy live)
    if (timePeriod === 'today') return 3; // Ca 2 (12h-16h)
    return baseData.length - 1; // Điểm chốt kỳ cho h1_2026, q3_2026, m9_2026
  };

  const activeIdx = getActivePointIndex();

  const rawData = baseData.map((d, idx) => {
    if (idx === activeIdx) {
      return {
        ...d,
        power: pRatio >= 1.0 ? Math.round(quotaPower * Math.max(pRatio * 1.04, 1.12)) : Math.round(quotaPower * pRatio * 1.05),
        co2: cRatio >= 1.0 ? Math.round(quotaCo2 * Math.max(cRatio * 1.04, 1.14)) : Math.round(quotaCo2 * cRatio * 1.05),
        water:
          wRatio >= 1.0
            ? Number((quotaWater * Math.max(wRatio * 1.04, 1.15)).toFixed(1))
            : Number((quotaWater * wRatio * 1.05).toFixed(1)),
      };
    }
    return d;
  });

  const getPeriodDescription = () => {
    switch (timePeriod) {
      case 'today':
        return 'Diễn biến các ca trong ngày hôm nay (Thời gian thực - Giám sát IoT)';
      case 'm9_2026':
        return 'Diễn biến các tuần trong Tháng 9/2026 [Đã đóng sổ kiểm soát tháng]';
      case 'm10_2026':
      case 'month':
        return 'Diễn biến các tuần trong Tháng 10/2026 [Kỳ hiện tại - Đang vận hành live]';
      case 'q3_2026':
        return 'Diễn biến các tháng trong Quý III/2026 [Đã đóng sổ kiểm soát quý]';
      case 'q4_2026':
      case 'quarter':
        return 'Diễn biến các tháng trong Quý IV/2026 [Kỳ hiện tại - Đang vận hành live]';
      case 'h1_2026':
        return 'Diễn biến 6 tháng đầu năm 2026 (01/01 - 30/06) [Đã đóng sổ kiểm toán bán niên]';
      case 'h2_2026':
        return 'Diễn biến 6 tháng cuối năm 2026 (01/07 - 31/12) [Kỳ hiện tại - Đang vận hành live]';
      case 'year_2026':
      case 'year':
        return 'Lũy kế 4 Quý năm 2026 (Q1 + Q2 đã chốt, Q3 đã chốt, Q4 đang live)';
      case '3years':
        return 'Lũy kế 3 năm liên tiếp 2024 - 2026 (Chiến lược Ban Giám đốc)';
      case '5years':
        return 'Kế hoạch giai đoạn 5 năm 2021 - 2025 (Ban Giám đốc)';
      case '10years':
        return 'Chiến lược 10 năm chuyển đổi Net Zero 2021 - 2030 (Toàn tập đoàn)';
      default:
        return 'Theo dõi diễn biến theo chu kỳ kiểm soát thẩm quyền';
    }
  };

  // Chart Dimensions
  const width = 640;
  const height = 230;
  const paddingX = 40;
  const paddingY = 28;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Max values for normalization, padded to give headroom above quota line
  const maxPower = Math.max(...rawData.map((d) => d.power), quotaPower * 1.25, 100);
  const maxCo2 = Math.max(...rawData.map((d) => d.co2), quotaCo2 * 1.25, 50);
  const maxWater = Math.max(...rawData.map((d) => d.water), quotaWater * 1.25, 10);

  // Active quota config for the reference line
  let activeQuotaVal = quotaPower;
  let activeMaxVal = maxPower;
  let activeQuotaUnit = 'kWh';
  let activeQuotaTitle = 'Định mức điện chuẩn (100%)';
  if (selectedMetric === 'co2') {
    activeQuotaVal = quotaCo2;
    activeMaxVal = maxCo2;
    activeQuotaUnit = 'kg CO2e';
    activeQuotaTitle = 'Định mức CO₂ chuẩn (100%)';
  } else if (selectedMetric === 'water') {
    activeQuotaVal = quotaWater;
    activeMaxVal = maxWater;
    activeQuotaUnit = 'm³';
    activeQuotaTitle = 'Định mức nước chuẩn (100%)';
  }

  const yQuotaLine = height - paddingY - (activeQuotaVal / activeMaxVal) * chartH;

  // Helper to generate SVG coordinates
  const getCoordinates = (metric: MetricType) => {
    return rawData.map((d, i) => {
      const x = paddingX + (i / Math.max(1, rawData.length - 1)) * chartW;
      let val = d.power;
      let maxVal = maxPower;
      let quota = quotaPower;
      if (metric === 'co2') {
        val = d.co2;
        maxVal = maxCo2;
        quota = quotaCo2;
      } else if (metric === 'water') {
        val = d.water;
        maxVal = maxWater;
        quota = quotaWater;
      }
      const y = height - paddingY - (val / maxVal) * chartH;
      const isOver = val > quota;
      return { x, y, val, isOver, quota };
    });
  };

  const powerCoords = getCoordinates('power');
  const co2Coords = getCoordinates('co2');
  const waterCoords = getCoordinates('water');

  const makePathD = (coords: { x: number; y: number }[]) => {
    return coords.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x},${curr.y}` : `${acc} L ${curr.x},${curr.y}`;
    }, '');
  };

  const makeAreaD = (coords: { x: number; y: number }[]) => {
    const lineD = makePathD(coords);
    const lastX = coords[coords.length - 1].x;
    const firstX = coords[0].x;
    const bottomY = height - paddingY;
    return `${lineD} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
      {/* Header with Title and Metric Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            Biểu đồ xu hướng tiêu thụ & phát thải
          </h3>
          <p className="text-xs text-slate-500">{getPeriodDescription()}</p>
        </div>

        {/* Metric Filter Tabs & Quota Line Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quota line toggle button */}
          <button
            onClick={() => setShowQuotaLine(!showQuotaLine)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all border ${
              showQuotaLine
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title="Bật/Tắt đường chuẩn định mức an toàn 100%"
          >
            <Target className="w-3 h-3 text-rose-500" />
            <span>Định mức 100%</span>
          </button>

          {/* Metric Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setSelectedMetric('all')}
              className={`px-2 py-1 rounded-md transition-colors ${
                selectedMetric === 'all'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedMetric('power')}
              className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                selectedMetric === 'power'
                  ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <Zap className="w-3 h-3" /> Điện
            </button>
            <button
              onClick={() => setSelectedMetric('co2')}
              className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                selectedMetric === 'co2'
                  ? 'bg-red-500 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-red-700'
              }`}
            >
              <Flame className="w-3 h-3" /> CO₂
            </button>
            <button
              onClick={() => setSelectedMetric('water')}
              className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                selectedMetric === 'water'
                  ? 'bg-sky-500 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              <Droplet className="w-3 h-3" /> Nước
            </button>
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative my-2 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[230px] select-none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + chartH * pct;
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* 100% Target Quota Reference Line */}
          {showQuotaLine && yQuotaLine >= paddingY && yQuotaLine <= height - paddingY && (
            <g className="transition-all duration-300">
              {/* Highlight background strip for over-quota zone */}
              <rect
                x={paddingX}
                y={paddingY}
                width={chartW}
                height={Math.max(0, yQuotaLine - paddingY)}
                fill="#fef2f2"
                opacity="0.35"
              />
              {/* Red Dashed Quota Line */}
              <line
                x1={paddingX}
                y1={yQuotaLine}
                x2={width - paddingX}
                y2={yQuotaLine}
                stroke="#dc2626"
                strokeWidth="1.75"
                strokeDasharray="6 4"
              />
              {/* Label badge on quota line */}
              <rect
                x={width - paddingX - 220}
                y={yQuotaLine - 18}
                width="216"
                height="16"
                rx="4"
                fill="#fee2e2"
                stroke="#fca5a5"
                strokeWidth="0.75"
              />
              <text
                x={width - paddingX - 112}
                y={yQuotaLine - 6}
                textAnchor="middle"
                fontSize="9.5"
                fill="#991b1b"
                fontWeight="700"
                fontFamily="sans-serif"
              >
                🎯 {activeQuotaTitle}: {activeQuotaVal.toLocaleString('vi-VN')} {activeQuotaUnit}
              </text>
            </g>
          )}

          {/* Lines & Area: Power */}
          {(selectedMetric === 'all' || selectedMetric === 'power') && (
            <>
              <path d={makeAreaD(powerCoords)} fill="url(#powerGrad)" />
              <path
                d={makePathD(powerCoords)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {powerCoords.map((c, i) => (
                <g key={`p-${i}`}>
                  {c.isOver && (
                    <circle cx={c.x} cy={c.y} r={5} fill="#ef4444" opacity="0.6">
                      <animate attributeName="r" values="5;14" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={hoverIndex === i ? 6 : c.isOver ? 5 : 3.5}
                    fill={c.isOver ? '#ef4444' : '#ffffff'}
                    stroke={c.isOver ? '#991b1b' : '#f59e0b'}
                    strokeWidth="2"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                </g>
              ))}
            </>
          )}

          {/* Lines & Area: CO2 */}
          {(selectedMetric === 'all' || selectedMetric === 'co2') && (
            <>
              <path d={makeAreaD(co2Coords)} fill="url(#co2Grad)" />
              <path
                d={makePathD(co2Coords)}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {co2Coords.map((c, i) => (
                <g key={`c-${i}`}>
                  {c.isOver && (
                    <circle cx={c.x} cy={c.y} r={5} fill="#ef4444" opacity="0.6">
                      <animate attributeName="r" values="5;14" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={hoverIndex === i ? 6 : c.isOver ? 5 : 3.5}
                    fill={c.isOver ? '#ef4444' : '#ffffff'}
                    stroke="#ef4444"
                    strokeWidth="2"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                </g>
              ))}
            </>
          )}

          {/* Lines & Area: Water */}
          {(selectedMetric === 'all' || selectedMetric === 'water') && (
            <>
              <path d={makeAreaD(waterCoords)} fill="url(#waterGrad)" />
              <path
                d={makePathD(waterCoords)}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {waterCoords.map((c, i) => (
                <g key={`w-${i}`}>
                  {c.isOver && (
                    <circle cx={c.x} cy={c.y} r={5} fill="#ef4444" opacity="0.6">
                      <animate attributeName="r" values="5;14" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={hoverIndex === i ? 6 : c.isOver ? 5 : 3.5}
                    fill={c.isOver ? '#ef4444' : '#ffffff'}
                    stroke="#0284c7"
                    strokeWidth="2"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                </g>
              ))}
            </>
          )}

          {/* X Axis Labels */}
          {rawData.map((d, idx) => {
            const x = paddingX + (idx / Math.max(1, rawData.length - 1)) * chartW;
            return (
              <text
                key={idx}
                x={x}
                y={height - 6}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
                fontWeight="500"
              >
                {d.time}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay with Quota Benchmarking */}
        {hoverIndex !== null && rawData[hoverIndex] && (
          <div
            className="absolute top-2 bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl pointer-events-none border border-slate-700 transition-all z-20 backdrop-blur-xs min-w-[240px]"
            style={{
              left: `${Math.min(width - 250, Math.max(20, powerCoords[hoverIndex]?.x - 120))}px`,
            }}
          >
            <div className="font-bold text-teal-400 border-b border-slate-700 pb-1.5 mb-2 flex items-center justify-between">
              <span>{rawData[hoverIndex].time}</span>
              {(rawData[hoverIndex].power > quotaPower ||
                rawData[hoverIndex].co2 > quotaCo2 ||
                rawData[hoverIndex].water > quotaWater) && (
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> VƯỢT ĐỊNH MỨC
                </span>
              )}
            </div>

            {/* Power Details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-amber-300">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Điện tiêu thụ:
                </span>
                <span className="font-mono font-bold">
                  {rawData[hoverIndex].power.toLocaleString('vi-VN')} kWh
                </span>
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-slate-300 pl-4 border-b border-slate-800 pb-1">
                <span>Định mức: {quotaPower.toLocaleString('vi-VN')} kWh</span>
                <span
                  className={`font-mono font-semibold ${
                    rawData[hoverIndex].power > quotaPower
                      ? 'text-red-400 font-bold'
                      : rawData[hoverIndex].power >= quotaPower * 0.85
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {((rawData[hoverIndex].power / quotaPower) * 100).toFixed(1)}% định mức
                </span>
              </div>

              {/* CO2 Details */}
              <div className="flex items-center justify-between gap-3 text-red-300">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Phát thải CO₂:
                </span>
                <span className="font-mono font-bold">
                  {rawData[hoverIndex].co2.toLocaleString('vi-VN')} kg
                </span>
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-slate-300 pl-4 border-b border-slate-800 pb-1">
                <span>Định mức: {quotaCo2.toLocaleString('vi-VN')} kg</span>
                <span
                  className={`font-mono font-semibold ${
                    rawData[hoverIndex].co2 > quotaCo2
                      ? 'text-red-400 font-bold'
                      : rawData[hoverIndex].co2 >= quotaCo2 * 0.85
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {((rawData[hoverIndex].co2 / quotaCo2) * 100).toFixed(1)}% định mức
                </span>
              </div>

              {/* Water Details */}
              <div className="flex items-center justify-between gap-3 text-sky-300">
                <span className="flex items-center gap-1">
                  <Droplet className="w-3 h-3" /> Nước thải:
                </span>
                <span className="font-mono font-bold">
                  {rawData[hoverIndex].water.toLocaleString('vi-VN')} m³
                </span>
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-slate-300 pl-4">
                <span>Định mức: {quotaWater.toLocaleString('vi-VN')} m³</span>
                <span
                  className={`font-mono font-semibold ${
                    rawData[hoverIndex].water > quotaWater
                      ? 'text-red-400 font-bold'
                      : rawData[hoverIndex].water >= quotaWater * 0.85
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {((rawData[hoverIndex].water / quotaWater) * 100).toFixed(1)}% định mức
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-1 bg-amber-500 rounded-full"></span>
          <span>Điện (kWh)</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-1 bg-red-500 rounded-full"></span>
          <span>Khí thải CO₂ (kg)</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-1 bg-sky-500 rounded-full"></span>
          <span>Nước thải (m³)</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-700 font-medium">
          <span className="w-3.5 h-0.5 border-t-2 border-dashed border-red-500"></span>
          <span>Đường chuẩn Định mức (100%)</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Điểm vượt định mức</span>
        </div>
      </div>
    </div>
  );
};
