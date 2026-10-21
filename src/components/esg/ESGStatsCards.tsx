'use client';

import React from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import { Zap, Flame, Droplet, AlertTriangle, ArrowUpDown, Radio } from 'lucide-react';

export const ESGStatsCards: React.FC = () => {
  const {
    scopedTotals,
    unitPreferences,
    toggleUnit,
    isLiveStreaming,
    role,
  } = useESGSimulation();

  // Format Power
  const isMWh = unitPreferences.power === 'MWh';
  const powerDisplay = isMWh
    ? (scopedTotals.powerKWh / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : scopedTotals.powerKWh.toLocaleString('vi-VN');
  const powerUnit = isMWh ? 'MWh' : 'kWh';

  // Format CO2
  const isTon = unitPreferences.co2 === 'ton';
  const co2Display = isTon
    ? (scopedTotals.co2Kg / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : scopedTotals.co2Kg.toLocaleString('vi-VN');
  const co2Unit = isTon ? 'tấn CO2e' : 'kg CO2e';

  // Format Water
  const isLiter = unitPreferences.water === 'liter';
  const waterDisplay = isLiter
    ? (scopedTotals.waterM3 * 1000).toLocaleString('vi-VN')
    : scopedTotals.waterM3.toLocaleString('vi-VN');
  const waterUnit = isLiter ? 'Lít' : 'm³';

  const roleScopeName =
    role === 'bod'
      ? 'Toàn bộ 3 Nhà máy Vinamilk'
      : role === 'factory_director'
      ? 'Nhà máy đang phụ trách'
      : 'Phân xưởng đang phân công';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Power */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
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
          <div className="text-[23px] font-extrabold text-slate-800 tracking-tight">
            {powerDisplay} <span className="text-sm font-semibold text-slate-500">{powerUnit}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
          <span className="truncate">{roleScopeName}</span>
          <span className="text-emerald-600 font-medium font-mono">92.4% định mức</span>
        </div>
      </div>

      {/* Card 2: Carbon CO2 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
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
          <div className="text-[23px] font-extrabold text-slate-800 tracking-tight">
            {co2Display} <span className="text-sm font-semibold text-slate-500">{co2Unit}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
          <span className="truncate">Theo chuẩn GHG Protocol</span>
          <span className="text-teal-600 font-medium font-mono">Phát thải Scope 1 & 2</span>
        </div>
      </div>

      {/* Card 3: Water */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
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
          <div className="text-[23px] font-extrabold text-slate-800 tracking-tight">
            {waterDisplay} <span className="text-sm font-semibold text-slate-500">{waterUnit}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Droplet className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
          <span className="truncate">Chuẩn xả thải QCVN 40</span>
          <span className="text-sky-600 font-medium font-mono">100% qua xử lý MBR</span>
        </div>
      </div>

      {/* Card 4: Alerts & Operations */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cảnh báo & An toàn vận hành
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="text-[23px] font-extrabold text-slate-800 tracking-tight flex items-baseline gap-2">
            <span>{scopedTotals.alertCount}</span>
            <span className="text-xs font-medium text-slate-500">sự cố cần xử lý</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
          <span>Quy mô: {scopedTotals.deviceCount} thiết bị</span>
          <span className="text-amber-600 font-medium">
            {scopedTotals.alertCount > 0 ? 'Có cảnh báo mới' : 'Hệ thống an toàn'}
          </span>
        </div>
      </div>
    </div>
  );
};
