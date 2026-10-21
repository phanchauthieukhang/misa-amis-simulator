'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import { ESG_TREND_DATA } from '@/data/vinamilk-mock';
import { MetricType } from '@/types/esg';
import { TrendingUp, Calendar, Zap, Flame, Droplet } from 'lucide-react';

export const ESGTrendChart: React.FC = () => {
  const { timePeriod, setTimePeriod, unitPreferences } = useESGSimulation();
  const [selectedMetric, setSelectedMetric] = useState<MetricType | 'all'>('all');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const rawData =
    ESG_TREND_DATA[timePeriod as keyof typeof ESG_TREND_DATA] || ESG_TREND_DATA.year;

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
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Max values for normalization
  const maxPower = Math.max(...rawData.map((d) => d.power), 100);
  const maxCo2 = Math.max(...rawData.map((d) => d.co2), 50);
  const maxWater = Math.max(...rawData.map((d) => d.water), 10);

  // Helper to generate SVG polyline / path
  const getCoordinates = (metric: MetricType) => {
    return rawData.map((d, i) => {
      const x = paddingX + (i / (rawData.length - 1)) * chartW;
      let val = d.power;
      let maxVal = maxPower;
      if (metric === 'co2') {
        val = d.co2;
        maxVal = maxCo2;
      } else if (metric === 'water') {
        val = d.water;
        maxVal = maxWater;
      }
      const y = height - paddingY - (val / maxVal) * chartH;
      return { x, y, val };
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
          <p className="text-xs text-slate-500">
            {getPeriodDescription()}
          </p>
        </div>

        {/* Metric Filter Tabs */}
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

      {/* SVG Chart Area */}
      <div className="relative my-2 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[220px] select-none"
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

          {/* Lines & Area */}
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
                <circle
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  r={hoverIndex === i ? 5 : 3.5}
                  fill="#ffffff"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              ))}
            </>
          )}

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
                <circle
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  r={hoverIndex === i ? 5 : 3.5}
                  fill="#ffffff"
                  stroke="#ef4444"
                  strokeWidth="2"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              ))}
            </>
          )}

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
                <circle
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  r={hoverIndex === i ? 5 : 3.5}
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="2"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              ))}
            </>
          )}

          {/* X Axis Labels */}
          {rawData.map((d, idx) => {
            const x = paddingX + (idx / (rawData.length - 1)) * chartW;
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

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && rawData[hoverIndex] && (
          <div
            className="absolute top-2 bg-slate-900/90 text-white px-3 py-2 rounded-lg text-xs shadow-lg pointer-events-none border border-slate-700 transition-all"
            style={{
              left: `${Math.min(width - 150, Math.max(20, powerCoords[hoverIndex]?.x - 60))}px`,
            }}
          >
            <div className="font-bold text-teal-400 border-b border-slate-700 pb-1 mb-1">
              Thời điểm: {rawData[hoverIndex].time}
            </div>
            <div className="flex items-center justify-between gap-4 text-amber-300">
              <span>⚡ Điện:</span>
              <span className="font-mono font-semibold">{rawData[hoverIndex].power} kWh</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-red-300">
              <span>🏭 CO₂:</span>
              <span className="font-mono font-semibold">{rawData[hoverIndex].co2} kg</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sky-300">
              <span>💧 Nước:</span>
              <span className="font-mono font-semibold">{rawData[hoverIndex].water} m³</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs">
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
      </div>
    </div>
  );
};
