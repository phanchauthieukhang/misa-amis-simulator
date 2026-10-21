'use client';

import React from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import {
  AlertTriangle,
  TrendingUp,
  Activity,
  Calendar,
  Lock,
  Zap,
  Flame,
  Droplet,
  Clock,
  Gauge,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const ESGPredictiveAlert: React.FC = () => {
  const {
    role,
    timePeriod,
    currentRoleConfig,
    scopedTotals,
    unitPreferences,
    factories,
  } = useESGSimulation();

  // If viewing a closed audit period, forecasting is not applicable
  if (scopedTotals.isClosedPeriod) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Kỳ kiểm toán đã hoàn tất đóng sổ ({scopedTotals.periodLabel})
        </h3>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Toàn bộ số liệu tiêu thụ trong kỳ <strong>{scopedTotals.dateRange}</strong> đã được khóa sổ kiểm toán môi trường và chốt hồ sơ CAPA chính thức. Mô hình dự báo sớm chỉ áp dụng đối với các chu kỳ vận hành mở hiện tại.
        </p>
        <span className="inline-block text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          Trạng thái dữ liệu: ĐÓNG BĂNG BẤT BIẾN
        </span>
      </div>
    );
  }

  // Current simulation date is October 21, 2026
  // Temporal progress based on active period
  let totalDays = 31;
  let elapsedDays = 21;
  let periodTypeName = 'tháng';

  if (timePeriod === 'year_2026') {
    totalDays = 365;
    elapsedDays = 294; // approx Oct 21
    periodTypeName = 'năm';
  } else if (timePeriod === 'h2_2026') {
    totalDays = 184; // Jul 1 to Dec 31
    elapsedDays = 113; // Jul 1 to Oct 21
    periodTypeName = 'bán niên';
  } else if (timePeriod === 'q4_2026') {
    totalDays = 92; // Oct 1 to Dec 31
    elapsedDays = 21; // Oct 1 to Oct 21
    periodTypeName = 'quý';
  } else if (timePeriod === 'm10_2026') {
    totalDays = 31; // Oct 1 to Oct 31
    elapsedDays = 21; // Oct 21
    periodTypeName = 'tháng';
  } else if (timePeriod === 'today') {
    totalDays = 24; // 24 hours
    elapsedDays = 16; // 16:00
    periodTypeName = 'ca vận hành';
  }

  const remainingDays = Math.max(1, totalDays - elapsedDays);
  const timeProgressPct = Math.round((elapsedDays / totalDays) * 100);

  // Power analysis
  const powerLimit = scopedTotals.effectivePowerLimit;
  const powerCurrent = scopedTotals.powerKWh;
  const powerRunRatePerDay = powerCurrent / elapsedDays;
  const powerProjectedTotal = Math.round(powerRunRatePerDay * totalDays);
  const powerProjectedRatio = powerLimit > 0 ? powerProjectedTotal / powerLimit : 0;
  const powerBreachDay =
    powerProjectedRatio > 1.0
      ? Math.max(elapsedDays + 1, Math.floor(powerLimit / powerRunRatePerDay))
      : null;
  const powerBreachDelta = powerProjectedTotal - powerLimit;

  // CO2 analysis
  const co2Limit = scopedTotals.effectiveCo2Limit;
  const co2Current = scopedTotals.co2Kg;
  const co2RunRatePerDay = co2Current / elapsedDays;
  const co2ProjectedTotal = Math.round(co2RunRatePerDay * totalDays);
  const co2ProjectedRatio = co2Limit > 0 ? co2ProjectedTotal / co2Limit : 0;
  const co2BreachDay =
    co2ProjectedRatio > 1.0
      ? Math.max(elapsedDays + 1, Math.floor(co2Limit / co2RunRatePerDay))
      : null;

  // Water analysis
  const waterLimit = scopedTotals.effectiveWaterLimit;
  const waterCurrent = scopedTotals.waterM3;
  const waterRunRatePerDay = waterCurrent / elapsedDays;
  const waterProjectedTotal = Math.round((waterRunRatePerDay * totalDays) * 10) / 10;
  const waterProjectedRatio = waterLimit > 0 ? waterProjectedTotal / waterLimit : 0;

  // Global Risk level based on max projected ratio
  const maxProjectedRatio = Math.max(
    powerProjectedRatio,
    co2ProjectedRatio,
    waterProjectedRatio
  );
  const isBreachRisk = maxProjectedRatio >= 1.0;
  const isWarningRisk = maxProjectedRatio >= 0.8 && maxProjectedRatio < 1.0;

  // Formatting helpers
  const formatPower = (kwh: number) => {
    if (unitPreferences.power === 'MWh') return `${(kwh / 1000).toFixed(2)} MWh`;
    return `${kwh.toLocaleString('vi-VN')} kWh`;
  };

  const formatCO2 = (kg: number) => {
    if (unitPreferences.co2 === 'ton') return `${(kg / 1000).toFixed(2)} tấn`;
    return `${kg.toLocaleString('vi-VN')} kg`;
  };

  const formatWater = (m3: number) => {
    if (unitPreferences.water === 'liter') return `${(m3 * 1000).toLocaleString('vi-VN')} L`;
    return `${m3.toLocaleString('vi-VN')} m³`;
  };

  // SVG Chart points calculation (Normalize 10 points: 0 to 100%)
  const chartWidth = 560;
  const chartHeight = 170;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  // X coordinate for current elapsed point
  const currentX = paddingX + (elapsedDays / totalDays) * plotWidth;

  // Max value on chart scale (150% of quota to show headroom)
  const maxScaleVal = powerLimit * 1.4;

  // Calculate Y for a power value
  const getY = (val: number) => {
    const clamped = Math.min(maxScaleVal, Math.max(0, val));
    return paddingY + plotHeight - (clamped / maxScaleVal) * plotHeight;
  };

  const thresholdY = getY(powerLimit);
  const startY = getY(0);
  const currentY = getY(powerCurrent);
  const endProjectedY = getY(powerProjectedTotal);

  // Breach intersection point on chart
  const breachX = powerBreachDay
    ? paddingX + (powerBreachDay / totalDays) * plotWidth
    : null;

  return (
    <div className="space-y-4">
      {/* Top Predictive Alert Diagnostic Banner */}
      <div
        className={`rounded-xl p-5 border text-xs shadow-2xs transition-all ${
          isBreachRisk
            ? 'bg-red-50/70 border-red-300'
            : isWarningRisk
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-emerald-50/70 border-emerald-300'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                isBreachRisk
                  ? 'bg-red-600 text-white animate-pulse'
                  : isWarningRisk
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    isBreachRisk
                      ? 'bg-red-100 text-red-900 border-red-300'
                      : isWarningRisk
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  {isBreachRisk
                    ? 'CẢNH BÁO DỰ BÁO: NGUY CƠ VƯỢT HẠN MỨC'
                    : isWarningRisk
                    ? 'CẢNH BÁO DỰ BÁO: NGUY CƠ CẬN HẠN MỨC'
                    : 'TIẾN ĐỘ TIÊU THỤ AN TOÀN'}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  Kỳ theo dõi: <strong>{scopedTotals.periodLabel}</strong> ({scopedTotals.dateRange})
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-1">
                {isBreachRisk &&
                  `Tốc độ tiêu thụ hiện tại có nguy cơ làm vượt hạn mức ${periodTypeName} nếu tiếp tục duy trì công suất.`}
                {isWarningRisk &&
                  `Tốc độ tiêu thụ hiện tại tiệm cận sát ngưỡng cảnh báo ${periodTypeName} (dự kiến đạt ${Math.round(
                    maxProjectedRatio * 100
                  )}% định mức).`}
                {!isBreachRisk &&
                  !isWarningRisk &&
                  `Tốc độ tiêu thụ hiện tại nằm trong hạn ngạch an toàn của ${periodTypeName}.`}
              </h3>

              <div className="mt-2 text-slate-700 space-y-1">
                <p>
                  • Tiến độ chu kỳ: Đã qua <strong>{elapsedDays}/{totalDays}</strong> ngày ({timeProgressPct}% thời gian), lượng điện lũy kế đạt <strong>{formatPower(powerCurrent)}</strong> / {formatPower(powerLimit)} ({Math.round((powerCurrent / powerLimit) * 100)}% định mức).
                </p>
                {powerBreachDay && (
                  <p className="text-red-700 font-semibold">
                    • Mốc chạm trần 100%: Dự kiến sẽ chạm trần định mức vào <strong>ngày {powerBreachDay}</strong> (sớm hơn kết thúc kỳ {totalDays - powerBreachDay} ngày).
                  </p>
                )}
                <p>
                  • Dự phóng cuối kỳ: Tổng tiêu thụ ước tính <strong>{formatPower(powerProjectedTotal)}</strong> (tương đương <strong>{Math.round(powerProjectedRatio * 100)}%</strong> định mức, độ lệch: <strong>{powerBreachDelta > 0 ? `+${formatPower(powerBreachDelta)}` : `${formatPower(powerBreachDelta)}`}</strong>).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Quantitative Badge */}
          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200 text-right min-w-[200px] shadow-2xs self-start">
            <span className="text-[10.5px] uppercase font-semibold text-slate-500 block">
              Dự phóng Tiêu thụ Cuối kỳ
            </span>
            <div
              className={`text-2xl font-bold font-mono ${
                isBreachRisk
                  ? 'text-red-600'
                  : isWarningRisk
                  ? 'text-amber-600'
                  : 'text-emerald-700'
              }`}
            >
              {Math.round(powerProjectedRatio * 100)}%
            </div>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              Hạn ngạch trần: <strong>{formatPower(powerLimit)}</strong>
            </span>
            <span className="text-[10px] text-slate-400 block mt-1 pt-1 border-t border-slate-100 font-mono">
              Tốc độ: {Math.round(powerRunRatePerDay).toLocaleString('vi-VN')} kWh/ngày
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Run-rate Visual Projection Chart (7 cols) + 3 Metrics Breakdown (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Visual Projection Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  Đồ thị Xu hướng Dự phóng Run-rate ({scopedTotals.periodLabel})
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Đường thực tế lũy kế vs Đường ngoại suy dự phóng đến cuối kỳ
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-teal-700 font-medium">
                  <span className="w-2.5 h-0.5 bg-teal-600 rounded" /> Thực tế
                </span>
                <span className="flex items-center gap-1 text-red-600 font-medium">
                  <span className="w-2.5 h-0.5 bg-red-500 border-b border-dashed border-red-600" /> Dự phóng
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-0.5 bg-red-400 border-t border-red-500" /> Hạn mức (100%)
                </span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="py-3 flex justify-center">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-44 overflow-visible"
              >
                {/* Background Grid Lines */}
                <line
                  x1={paddingX}
                  y1={getY(powerLimit * 1.25)}
                  x2={chartWidth - paddingX}
                  y2={getY(powerLimit * 1.25)}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1={paddingX}
                  y1={getY(powerLimit * 0.75)}
                  x2={chartWidth - paddingX}
                  y2={getY(powerLimit * 0.75)}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1={paddingX}
                  y1={getY(0)}
                  x2={chartWidth - paddingX}
                  y2={getY(0)}
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                />

                {/* 100% Quota Reference Line */}
                <line
                  x1={paddingX}
                  y1={thresholdY}
                  x2={chartWidth - paddingX}
                  y2={thresholdY}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x={chartWidth - paddingX + 5}
                  y={thresholdY + 3}
                  fill="#ef4444"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  100% ({formatPower(powerLimit)})
                </text>

                {/* Vertical Line at Current Date */}
                <line
                  x1={currentX}
                  y1={paddingY}
                  x2={currentX}
                  y2={paddingY + plotHeight}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={currentX}
                  y={paddingY - 5}
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="9"
                  fontWeight="bold"
                >
                  Hôm nay ({elapsedDays}/{totalDays})
                </text>

                {/* Actual Past Consumption Curve (Teal Solid) */}
                <path
                  d={`M ${paddingX} ${startY} Q ${(paddingX + currentX) / 2} ${(startY + currentY) / 2 + 5} ${currentX} ${currentY}`}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                />

                {/* Projected Future Curve (Dashed Red or Amber) */}
                <path
                  d={`M ${currentX} ${currentY} L ${chartWidth - paddingX} ${endProjectedY}`}
                  fill="none"
                  stroke={isBreachRisk ? '#dc2626' : '#d97706'}
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />

                {/* Current Data Point Marker */}
                <circle
                  cx={currentX}
                  cy={currentY}
                  r="4.5"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* End Projected Data Point Marker */}
                <circle
                  cx={chartWidth - paddingX}
                  cy={endProjectedY}
                  r="4"
                  fill={isBreachRisk ? '#dc2626' : '#d97706'}
                />

                {/* Breach Intersection Marker if it breaches before end */}
                {breachX && (
                  <g>
                    <circle
                      cx={breachX}
                      cy={thresholdY}
                      r="4"
                      fill="#ef4444"
                      opacity="0.6"
                    >
                      <animate attributeName="r" values="4;12" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle
                      cx={breachX}
                      cy={thresholdY}
                      r="4"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={breachX}
                      y={thresholdY - 9}
                      textAnchor="middle"
                      fill="#b91c1c"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      Chạm trần ngày {powerBreachDay}
                    </text>
                  </g>
                )}

                {/* X Axis Labels */}
                <text
                  x={paddingX}
                  y={chartHeight - 5}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  Đầu kỳ (Ngày 1)
                </text>
                <text
                  x={chartWidth - paddingX}
                  y={chartHeight - 5}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  Cuối kỳ (Ngày {totalDays})
                </text>
              </svg>
            </div>
          </div>

          {/* Chart Footnote Details */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Mô hình ngoại suy tuyến tính bậc 1 (Linear Run-Rate Model)
            </span>
            <span className="font-mono text-slate-700">
              Độ tin cậy dữ liệu: <strong>96.4%</strong> (Chuẩn SCADA Modbus)
            </span>
          </div>
        </div>

        {/* Right Column: 3 Resource Breakdown Cards */}
        <div className="lg:col-span-5 space-y-3">
          {/* Power Metric Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="font-bold text-xs text-amber-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Điện Tiêu Thụ
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  powerProjectedRatio >= 1.0
                    ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {powerProjectedRatio >= 1.0 ? 'VƯỢT ĐỊNH MỨC' : 'AN TOÀN'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Hiện tại / Định mức</span>
                <span className="font-mono font-bold text-slate-800 text-xs">
                  {formatPower(powerCurrent)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  / {formatPower(powerLimit)} ({Math.round((powerCurrent / powerLimit) * 100)}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Dự phóng cuối kỳ</span>
                <span
                  className={`font-mono font-bold text-xs ${
                    powerProjectedRatio >= 1.0 ? 'text-red-600' : 'text-slate-800'
                  }`}
                >
                  {formatPower(powerProjectedTotal)}
                </span>
                <span
                  className={`text-[10px] font-mono block font-semibold ${
                    powerProjectedRatio >= 1.0 ? 'text-red-600' : 'text-slate-500'
                  }`}
                >
                  {Math.round(powerProjectedRatio * 100)}% ({powerBreachDelta > 0 ? `+${formatPower(powerBreachDelta)}` : `${formatPower(powerBreachDelta)}`})
                </span>
              </div>
            </div>
          </div>

          {/* CO2 Metric Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="font-bold text-xs text-red-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-500" /> Phát thải CO₂
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  co2ProjectedRatio >= 1.0
                    ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {co2ProjectedRatio >= 1.0 ? 'VƯỢT ĐỊNH MỨC' : 'AN TOÀN'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Hiện tại / Định mức</span>
                <span className="font-mono font-bold text-slate-800 text-xs">
                  {formatCO2(co2Current)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  / {formatCO2(co2Limit)} ({Math.round((co2Current / co2Limit) * 100)}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Dự phóng cuối kỳ</span>
                <span
                  className={`font-mono font-bold text-xs ${
                    co2ProjectedRatio >= 1.0 ? 'text-red-600' : 'text-slate-800'
                  }`}
                >
                  {formatCO2(co2ProjectedTotal)}
                </span>
                <span
                  className={`text-[10px] font-mono block font-semibold ${
                    co2ProjectedRatio >= 1.0 ? 'text-red-600' : 'text-slate-500'
                  }`}
                >
                  {Math.round(co2ProjectedRatio * 100)}% ({co2ProjectedTotal - co2Limit > 0 ? `+${formatCO2(co2ProjectedTotal - co2Limit)}` : `${formatCO2(co2ProjectedTotal - co2Limit)}`})
                </span>
              </div>
            </div>
          </div>

          {/* Water Metric Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="font-bold text-xs text-sky-800 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-sky-500" /> Nước Xả / Tái Chế
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  waterProjectedRatio >= 1.0
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {waterProjectedRatio >= 1.0 ? 'VƯỢT ĐỊNH MỨC' : 'AN TOÀN'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Hiện tại / Định mức</span>
                <span className="font-mono font-bold text-slate-800 text-xs">
                  {formatWater(waterCurrent)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  / {formatWater(waterLimit)} ({Math.round((waterCurrent / waterLimit) * 100)}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Dự phóng cuối kỳ</span>
                <span
                  className={`font-mono font-bold text-xs ${
                    waterProjectedRatio >= 1.0 ? 'text-red-600' : 'text-slate-800'
                  }`}
                >
                  {formatWater(waterProjectedTotal)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block font-semibold">
                  {Math.round(waterProjectedRatio * 100)}% ({waterProjectedTotal - waterLimit > 0 ? `+${formatWater(waterProjectedTotal - waterLimit)}` : `${formatWater(waterProjectedTotal - waterLimit)}`})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
