'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import { BarChart2, Zap, Flame, Droplet, ArrowRight } from 'lucide-react';
import { MetricType } from '@/types/esg';

export const ESGComparisonChart: React.FC = () => {
  const { role, factories, selectedFactoryId, selectedWorkshopId } = useESGSimulation();
  const [metric, setMetric] = useState<MetricType>('power');

  // Determine comparison items based on role
  let comparisonTitle = '';
  let comparisonSubtitle = '';
  let items: { name: string; value: number; max: number; subText: string; status: 'normal' | 'warning' | 'danger' }[] = [];

  const currentFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
  const currentWorkshop = currentFactory.workshops.find((w) => w.id === selectedWorkshopId) || currentFactory.workshops[0];

  if (role === 'bod') {
    comparisonTitle = 'So sánh tỷ trọng giữa 3 Nhà máy sản xuất';
    comparisonSubtitle = 'Quyền Ban Giám đốc: Đánh giá phân bổ tiêu thụ toàn hệ thống Vinamilk';
    const totalAllPower = factories.reduce((sum, f) => sum + f.totals.powerKWh, 0);
    const totalAllCo2 = factories.reduce((sum, f) => sum + f.totals.co2Kg, 0);
    const totalAllWater = factories.reduce((sum, f) => sum + f.totals.waterM3, 0);

    items = factories.map((f) => {
      let val = f.totals.powerKWh;
      let max = totalAllPower;
      if (metric === 'co2') {
        val = f.totals.co2Kg;
        max = totalAllCo2;
      } else if (metric === 'water') {
        val = f.totals.waterM3;
        max = totalAllWater;
      }

      return {
        name: f.name,
        value: val,
        max,
        subText: `${f.workshops.length} phân xưởng • GĐ: ${f.director}`,
        status: f.status,
      };
    });
  } else if (role === 'factory_director') {
    comparisonTitle = `So sánh giữa các Phân xưởng (${currentFactory.name})`;
    comparisonSubtitle = 'Quyền Quản đốc: Đánh giá hiệu suất năng lượng từng dây chuyền phân xưởng';
    const factoryPower = currentFactory.workshops.reduce((sum, w) => sum + w.totals.powerKWh, 0);
    const factoryCo2 = currentFactory.workshops.reduce((sum, w) => sum + w.totals.co2Kg, 0);
    const factoryWater = currentFactory.workshops.reduce((sum, w) => sum + w.totals.waterM3, 0);

    items = currentFactory.workshops.map((w) => {
      let val = w.totals.powerKWh;
      let max = factoryPower;
      if (metric === 'co2') {
        val = w.totals.co2Kg;
        max = factoryCo2;
      } else if (metric === 'water') {
        val = w.totals.waterM3;
        max = factoryWater;
      }

      return {
        name: w.name,
        value: val,
        max,
        subText: `${w.deviceCount} thiết bị • Quản lý: ${w.manager}`,
        status: w.status,
      };
    });
  } else {
    // workshop_lead
    comparisonTitle = `So sánh tiêu thụ từng Thiết bị (${currentWorkshop.name})`;
    comparisonSubtitle = 'Quyền Trưởng bộ phận: Giám sát tải trọng & định mức từng máy cụ thể';

    items = currentWorkshop.devices.map((d) => {
      let val = 0;
      let max = 100;
      if (metric === 'power' && d.readings.power) {
        val = d.readings.power.value;
        max = d.readings.power.max;
      } else if (metric === 'co2' && d.readings.co2) {
        val = d.readings.co2.value;
        max = d.readings.co2.max;
      } else if (metric === 'water' && d.readings.water) {
        val = d.readings.water.value;
        max = d.readings.water.max;
      }

      return {
        name: d.name,
        value: val,
        max,
        subText: `Mã: ${d.code} • ${d.specification.slice(0, 36)}...`,
        status: d.status,
      };
    });
  }

  const unitLabel = metric === 'power' ? 'kWh' : metric === 'co2' ? 'kg' : 'm³';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-teal-600" />
            {comparisonTitle}
          </h3>
          <p className="text-xs text-slate-500">{comparisonSubtitle}</p>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setMetric('power')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
              metric === 'power' ? 'bg-amber-500 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3 h-3" /> Điện
          </button>
          <button
            onClick={() => setMetric('co2')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
              metric === 'co2' ? 'bg-red-500 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3 h-3" /> CO₂
          </button>
          <button
            onClick={() => setMetric('water')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
              metric === 'water' ? 'bg-sky-500 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplet className="w-3 h-3" /> Nước
          </button>
        </div>
      </div>

      {/* Bar Comparison List */}
      <div className="space-y-3.5 my-3 flex-1 overflow-y-auto max-h-[260px] pr-1">
        {items.map((item, idx) => {
          const percentage = item.max > 0 ? Math.min(100, Math.round((item.value / item.max) * 100)) : 0;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.status === 'danger'
                        ? 'bg-red-500 animate-pulse'
                        : item.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className="font-semibold text-slate-800 truncate max-w-[260px]">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800">
                    {item.value.toLocaleString('vi-VN')} {unitLabel}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 font-mono w-10 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.status === 'danger'
                      ? 'bg-red-500'
                      : metric === 'power'
                      ? 'bg-amber-500'
                      : metric === 'co2'
                      ? 'bg-red-500'
                      : 'bg-sky-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="text-[10.5px] text-slate-400 pl-4">{item.subText}</div>
            </div>
          );
        })}
      </div>

      {/* Note based on role depth */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Phân cấp dữ liệu theo thẩm quyền quản lý</span>
        <span className="text-teal-700 font-medium">Tự động đồng bộ với quyền hiện hành</span>
      </div>
    </div>
  );
};
