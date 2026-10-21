'use client';

import React, { useState } from 'react';
import { Sun, Leaf, Flame, Zap, CheckCircle2, BatteryCharging, ShieldCheck, TrendingUp } from 'lucide-react';
import { useESGSimulation } from '@/context/ESGSimulationContext';

interface EnergySource {
  id: string;
  name: string;
  category: 'renewable' | 'grid';
  percentage: number;
  consumptionKWh: number;
  co2ReductionKg: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  icon: React.ReactNode;
}

export const ESGRenewableEnergyWidget: React.FC = () => {
  const { scopedTotals } = useESGSimulation();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  // Dynamic calculation based on current scoped power consumption
  const totalPowerKWh = scopedTotals?.powerKWh || 82100;

  // Breakdown percentages matching Vinamilk Green Farm & Net Zero operational profile
  const solarKWh = Math.round(totalPowerKWh * 0.185);
  const biomassKWh = Math.round(totalPowerKWh * 0.123);
  const biogasKWh = Math.round(totalPowerKWh * 0.040);
  const evnKWh = Math.max(0, totalPowerKWh - solarKWh - biomassKWh - biogasKWh);

  const greenKWh = solarKWh + biomassKWh + biogasKWh;
  // Avoided emissions: clean energy replaces EVN coal/gas thermal grid mix (~0.72 kg CO2e / kWh)
  const co2AvoidedKg = Math.round(greenKWh * 0.72);

  const currentGreenPct = 34.8;
  const targetGreenPct = 40.0;
  const progressToTarget = Math.round((currentGreenPct / targetGreenPct) * 100);

  const sources: EnergySource[] = [
    {
      id: 'solar',
      name: 'Điện mặt trời áp mái (Solar Rooftop)',
      category: 'renewable',
      percentage: 18.5,
      consumptionKWh: solarKWh,
      co2ReductionKg: Math.round(solarKWh * 0.72),
      color: 'bg-amber-500',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800 border-amber-200',
      description: 'Hệ thống 5.4 MWp lắp trên mái nhà máy & cụm kho thông minh AS/RS.',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'biomass',
      name: 'Nhiên liệu Sinh khối (Biomass Boiler)',
      category: 'renewable',
      percentage: 12.3,
      consumptionKWh: biomassKWh,
      co2ReductionKg: Math.round(biomassKWh * 0.72),
      color: 'bg-emerald-600',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800 border-emerald-200',
      description: 'Lò hơi tầng sôi 10 T/h đốt trấu ép và viên nén mùn cưa, thay thế 100% dầu DO/FO.',
      icon: <Leaf className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      id: 'biogas',
      name: 'Khí sinh học Biogas (Trang trại Green Farm)',
      category: 'renewable',
      percentage: 4.0,
      consumptionKWh: biogasKWh,
      co2ReductionKg: Math.round(biogasKWh * 0.72),
      color: 'bg-teal-500',
      badgeBg: 'bg-teal-50',
      badgeText: 'text-teal-800 border-teal-200',
      description: 'Tận dụng hầm ủ Biogas chất thải hữu cơ từ cụm trang trại bò sữa tuần hoàn.',
      icon: <Flame className="w-3.5 h-3.5 text-teal-500" />,
    },
    {
      id: 'evn_grid',
      name: 'Lưới điện truyền tải EVN (Lưới quốc gia)',
      category: 'grid',
      percentage: 65.2,
      consumptionKWh: evnKWh,
      co2ReductionKg: 0,
      color: 'bg-slate-400',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700 border-slate-300',
      description: 'Nguồn điện cơ sở vận hành 24/7, đang triển khai cơ chế DPPA mua điện sạch trực tiếp.',
      icon: <Zap className="w-3.5 h-3.5 text-slate-500" />,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-600" />
              Cơ cấu Năng lượng Xanh & Kiểm soát Phát thải
            </h3>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Vinamilk RE100
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tỷ trọng năng lượng tái tạo tự sản xuất và cấp nhiệt lò hơi sinh khối
          </p>
        </div>

        {/* Target Progress Badge */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium shadow-2xs">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tiến độ mục tiêu năm: <strong className="font-mono font-bold">{progressToTarget}%</strong></span>
        </div>
      </div>

      {/* Main Segmented Gauge Bar */}
      <div className="my-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Phân bổ nguồn cung năng lượng thực tế</span>
          <span className="text-[11px] text-slate-500 font-mono">
            Tổng phụ tải: <strong className="text-slate-800 font-bold">{totalPowerKWh.toLocaleString('vi-VN')}</strong> kWh
          </span>
        </div>

        {/* Segmented Stacked Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200/80">
          {sources.map((s) => (
            <div
              key={s.id}
              className={`${s.color} h-full transition-all duration-500 relative group cursor-pointer hover:opacity-90`}
              style={{ width: `${s.percentage}%` }}
              onMouseEnter={() => setSelectedSource(s.id)}
              onMouseLeave={() => setSelectedSource(null)}
              title={`${s.name}: ${s.percentage}% (${s.consumptionKWh.toLocaleString('vi-VN')} kWh)`}
            />
          ))}
        </div>

        {/* Segment Legend with Percentages */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
          {sources.map((s) => {
            const isSelected = selectedSource === s.id;
            return (
              <div
                key={s.id}
                onMouseEnter={() => setSelectedSource(s.id)}
                onMouseLeave={() => setSelectedSource(null)}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-50 border-teal-400 shadow-2xs'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {s.icon}
                  <span className="text-[11px] font-semibold text-slate-700 truncate" title={s.name}>
                    {s.id === 'solar'
                      ? 'Điện Mặt trời'
                      : s.id === 'biomass'
                      ? 'Nhiên liệu Sinh khối'
                      : s.id === 'biogas'
                      ? 'Khí Biogas'
                      : 'Lưới điện EVN'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-extrabold font-mono text-slate-800">{s.percentage}%</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(s.consumptionKWh / 1000).toFixed(1)} MWh
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Operational Control & Emission Avoidance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
        {/* Metric 1: Clean Energy Generated */}
        <div className="flex items-center gap-2 p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
          <BatteryCharging className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-[11px] min-w-0">
            <div className="text-slate-500 font-medium truncate">Sản lượng Xanh tự cấp</div>
            <div className="font-extrabold text-slate-800 font-mono text-xs">
              {(greenKWh / 1000).toFixed(1)}{' '}
              <span className="font-sans text-[10px] text-emerald-700 font-bold">MWh</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Avoided CO2 Emissions */}
        <div className="flex items-center gap-2 p-2 bg-teal-50/60 rounded-lg border border-teal-100">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <div className="text-[11px] min-w-0">
            <div className="text-slate-500 font-medium truncate">CO₂ tránh phát thải</div>
            <div className="font-extrabold text-slate-800 font-mono text-xs">
              {co2AvoidedKg.toLocaleString('vi-VN')}{' '}
              <span className="font-sans text-[10px] text-teal-700 font-bold">kg CO₂e</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Self-sufficiency Rate */}
        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="text-[11px] min-w-0">
            <div className="text-slate-500 font-medium truncate">Tự chủ năng lượng sạch</div>
            <div className="font-extrabold text-slate-800 font-mono text-xs">
              {currentGreenPct}%{' '}
              <span className="font-sans text-[10px] text-slate-500 font-normal">/ Mục tiêu {targetGreenPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
