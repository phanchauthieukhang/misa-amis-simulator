'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import { BarChart2, Zap, Flame, Droplet, ArrowUpRight } from 'lucide-react';
import { MetricType } from '@/types/esg';
import { QuotaBar150 } from './QuotaBar150';

export const ESGComparisonChart: React.FC = () => {
  const { role, factories, selectedFactoryId, selectedWorkshopId, scopedTotals, navigateTo } = useESGSimulation();
  const [metric, setMetric] = useState<MetricType>('power');

  // If viewing a closed audit period (h1_2026, q3_2026, m9_2026), align entity snapshot with closed-period audit ratios
  const isClosed = scopedTotals.isClosedPeriod;
  const closedRatioMap = {
    power: scopedTotals.effectivePowerLimit > 0 ? scopedTotals.powerKWh / scopedTotals.effectivePowerLimit : 1,
    co2: scopedTotals.effectiveCo2Limit > 0 ? scopedTotals.co2Kg / scopedTotals.effectiveCo2Limit : 1,
    water: scopedTotals.effectiveWaterLimit > 0 ? scopedTotals.waterM3 / scopedTotals.effectiveWaterLimit : 1,
  };
  const activeClosedRatio = closedRatioMap[metric];

  // Determine comparison items based on role
  let comparisonTitle = '';
  let comparisonSubtitle = '';
  let items: {
    id: string;
    targetType: 'factory' | 'workshop' | 'device';
    name: string;
    value: number;
    max: number;
    subText: string;
    status: 'normal' | 'warning' | 'danger';
  }[] = [];

  const currentFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
  const currentWorkshop = currentFactory.workshops.find((w) => w.id === selectedWorkshopId) || currentFactory.workshops[0];

  if (role === 'bod') {
    comparisonTitle = 'So sánh định mức tiêu thụ giữa 3 Nhà máy sản xuất';
    comparisonSubtitle = 'Quyền Ban Giám đốc: Giám sát tỷ lệ % định mức và cảnh báo vượt hạn ngạch 3 nhà máy';

    items = factories.map((f, idx) => {
      let val = f.totals.powerKWh;
      let max = 5000;
      let unit = 'kWh';
      if (metric === 'co2') {
        val = f.totals.co2Kg;
        max = 3500;
        unit = 'kg';
      } else if (metric === 'water') {
        val = f.totals.waterM3;
        max = 400;
        unit = 'm³';
      }

      if (isClosed && activeClosedRatio >= 1.0 && idx === 0) {
        val = Math.round(max * Math.max(activeClosedRatio, 1.06));
      }

      const ratio = max > 0 ? val / max : 0;
      const status: 'normal' | 'warning' | 'danger' =
        ratio >= 1.0 ? 'danger' : ratio >= 0.8 ? 'warning' : 'normal';

      return {
        id: f.id,
        targetType: 'factory' as const,
        name: f.name,
        value: val,
        max,
        subText: `${f.workshops.length} phân xưởng • Định mức chuẩn: ${max.toLocaleString('vi-VN')} ${unit} • GĐ: ${f.director}`,
        status,
      };
    });
  } else if (role === 'factory_director') {
    comparisonTitle = `So sánh định mức giữa các Phân xưởng (${currentFactory.name})`;
    comparisonSubtitle = 'Quyền Quản đốc: Giám sát công suất & hạn mức tiêu thụ từng phân xưởng';

    items = currentFactory.workshops.map((w, idx) => {
      let val = w.totals.powerKWh;
      let max = 2500;
      let unit = 'kWh';
      if (metric === 'co2') {
        val = w.totals.co2Kg;
        max = 1800;
        unit = 'kg';
      } else if (metric === 'water') {
        val = w.totals.waterM3;
        max = 250;
        unit = 'm³';
      }

      if (isClosed && activeClosedRatio >= 1.0 && idx === 0) {
        val = Math.round(max * Math.max(activeClosedRatio, 1.06));
      }

      const ratio = max > 0 ? val / max : 0;
      const status: 'normal' | 'warning' | 'danger' =
        ratio >= 1.0 ? 'danger' : ratio >= 0.8 ? 'warning' : 'normal';

      return {
        id: w.id,
        targetType: 'workshop' as const,
        name: w.name,
        value: val,
        max,
        subText: `${w.deviceCount} thiết bị • Định mức chuẩn: ${max.toLocaleString('vi-VN')} ${unit} • Quản lý: ${w.manager}`,
        status,
      };
    });
  } else {
    // workshop_lead
    comparisonTitle = `So sánh định mức từng Thiết bị (${currentWorkshop.name})`;
    comparisonSubtitle = 'Quyền Trưởng bộ phận: Giám sát tải trọng & định mức an toàn từng thiết bị';

    items = currentWorkshop.devices.map((d, idx) => {
      let val = 0;
      let max = 100;
      let unit = 'kWh';
      if (metric === 'power' && d.readings.power) {
        val = d.readings.power.value;
        max = d.readings.power.max;
        unit = 'kWh';
      } else if (metric === 'co2' && d.readings.co2) {
        val = d.readings.co2.value;
        max = d.readings.co2.max;
        unit = 'kg';
      } else if (metric === 'water' && d.readings.water) {
        val = d.readings.water.value;
        max = d.readings.water.max;
        unit = 'm³';
      }

      if (isClosed && activeClosedRatio >= 1.0 && idx === 0) {
        val = Math.round(max * Math.max(activeClosedRatio, 1.05));
      }

      const ratio = max > 0 ? val / max : 0;
      const status: 'normal' | 'warning' | 'danger' =
        ratio >= 1.0 ? 'danger' : ratio >= 0.8 ? 'warning' : 'normal';

      return {
        id: d.id,
        targetType: 'device' as const,
        name: d.name,
        value: val,
        max,
        subText: `Mã: ${d.code} • Định mức: ${max.toLocaleString('vi-VN')} ${unit} • ${d.specification.slice(0, 32)}...`,
        status,
      };
    });
  }

  const handleDrilldown = (item: (typeof items)[0]) => {
    if (item.targetType === 'factory') {
      navigateTo('esg-realtime', {
        factoryId: item.id,
        viewLevel: 'factory',
      });
    } else if (item.targetType === 'workshop') {
      navigateTo('esg-realtime', {
        factoryId: currentFactory.id,
        workshopId: item.id,
        viewLevel: 'workshop',
      });
    } else {
      navigateTo('esg-realtime', {
        factoryId: currentFactory.id,
        workshopId: currentWorkshop.id,
        deviceId: item.id,
        viewLevel: 'device',
      });
    }
  };

  const unitLabel = metric === 'power' ? 'kWh' : metric === 'co2' ? 'kg' : 'm³';
  const baseColor =
    metric === 'power'
      ? 'bg-amber-500'
      : metric === 'co2'
      ? 'bg-orange-500'
      : 'bg-sky-500';

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
              metric === 'power'
                ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3 h-3" /> Điện
          </button>
          <button
            onClick={() => setMetric('co2')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
              metric === 'co2'
                ? 'bg-red-500 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3 h-3" /> CO₂
          </button>
          <button
            onClick={() => setMetric('water')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
              metric === 'water'
                ? 'bg-sky-500 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplet className="w-3 h-3" /> Nước
          </button>
        </div>
      </div>

      {/* Bar Comparison List */}
      <div className="space-y-3.5 my-3 flex-1 overflow-y-auto max-h-[280px] pr-1">
        {items.map((item, idx) => {
          const percentage = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0;
          const isOver = percentage > 100;

          return (
            <div
              key={idx}
              className="space-y-1 p-1 rounded-lg hover:bg-teal-50/30 transition-colors group cursor-pointer"
              onClick={() => handleDrilldown(item)}
              title="Click để soi chi tiết trên SCADA"
            >
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
                  <span className="font-semibold text-slate-800 group-hover:text-teal-800 transition-colors truncate max-w-[240px]">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-700">
                    <strong className="text-slate-900">{item.value.toLocaleString('vi-VN')}</strong>
                    <span className="text-slate-400 font-normal"> / {item.max.toLocaleString('vi-VN')} {unitLabel}</span>
                  </span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isOver
                        ? 'text-red-700 bg-red-100 animate-pulse border border-red-200'
                        : percentage >= 80
                        ? 'text-amber-800 bg-amber-100 border border-amber-200'
                        : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    {percentage}%
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-teal-600 transition-colors" />
                </div>
              </div>

              {/* 150% Scale Quota Bar */}
              <QuotaBar150
                current={item.value}
                max={item.max}
                baseColor={baseColor}
                heightClass="h-2"
                showScaleTicks={false}
              />

              <div className="text-[10.5px] text-slate-400 pl-3">{item.subText}</div>
            </div>
          );
        })}
      </div>

      {/* Footer scale indicator */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-2">
          <span>Thang đo 0% ──[100% Định mức]──&gt; 150%</span>
          <span className="inline-flex items-center gap-1 text-[10.5px] text-red-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            Đỏ: Vượt định mức
          </span>
        </span>
        <span className="text-teal-700 font-medium hidden sm:inline">Click dòng để chuyển sang SCADA</span>
      </div>
    </div>
  );
};
