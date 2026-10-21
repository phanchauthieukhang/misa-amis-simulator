'use client';

import React, { useState } from 'react';
import { Sun, Leaf, Flame, Zap, Award, CheckCircle2, Info, ChevronRight } from 'lucide-react';
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
  const { navigateTo } = useESGSimulation();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const sources: EnergySource[] = [
    {
      id: 'solar',
      name: 'Điện mặt trời áp mái (Solar Rooftop)',
      category: 'renewable',
      percentage: 18.5,
      consumptionKWh: 15200,
      co2ReductionKg: 10800,
      color: 'bg-amber-500',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800 border-amber-200',
      description: 'Hệ thống 5.4 MWp lắp trên mái 3 nhà máy & cụm kho thông minh AS/RS.',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'biomass',
      name: 'Năng lượng Sinh khối (Biomass Boiler)',
      category: 'renewable',
      percentage: 12.3,
      consumptionKWh: 10100,
      co2ReductionKg: 7200,
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
      consumptionKWh: 3300,
      co2ReductionKg: 2350,
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
      consumptionKWh: 53500,
      co2ReductionKg: 0,
      color: 'bg-slate-400',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700 border-slate-300',
      description: 'Nguồn điện cơ sở vận hành 24/7, đang triển khai cơ chế DPPA mua điện sạch trực tiếp.',
      icon: <Zap className="w-3.5 h-3.5 text-slate-500" />,
    },
  ];

  const currentGreenPct = 34.8;
  const targetGreenPct = 40.0;
  const progressToTarget = Math.round((currentGreenPct / targetGreenPct) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-600" />
              Cơ cấu Năng lượng Xanh & Lộ trình Net Zero 2050
            </h3>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Vinamilk RE100
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tỷ trọng năng lượng tái tạo tự sản xuất và cấp nhiệt lò hơi sinh khối
          </p>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-600">Năng lượng xanh: </span>
            <strong className="text-emerald-700 font-extrabold text-[13px]">{currentGreenPct}%</strong>
            <span className="text-slate-400 text-[11px]"> / Mục tiêu {targetGreenPct}%</span>
          </div>
        </div>
      </div>

      {/* Main Segmented Gauge Bar */}
      <div className="my-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Phân bổ nguồn cung năng lượng thực tế</span>
          <span className="text-[11px] font-mono text-emerald-700 font-bold">
            Tiến độ mục tiêu năm: {progressToTarget}%
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

      {/* Environmental & Carbon Offsetting Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-[11px]">
            <div className="text-slate-500 font-medium">CO₂ cắt giảm lũy kế</div>
            <div className="font-extrabold text-slate-800 font-mono text-xs">
              20.350 <span className="font-sans text-[10px] text-emerald-700">kg CO₂e</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-teal-50/60 rounded-lg border border-teal-100">
          <Award className="w-4 h-4 text-teal-600 shrink-0" />
          <div className="text-[11px]">
            <div className="text-slate-500 font-medium">Chứng chỉ I-REC quốc tế</div>
            <div className="font-extrabold text-slate-800 font-mono text-xs">
              1.250 <span className="font-sans text-[10px] text-teal-700">chứng chỉ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[11px]">
            <div className="text-slate-500 font-medium">Chuẩn trung hòa Carbon</div>
            <div className="font-bold text-slate-800 text-xs">PAS 2060:2014</div>
          </div>
          <button
            onClick={() => navigateTo('esg-reports')}
            className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-0.5 transition-colors"
          >
            <span>Báo cáo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
