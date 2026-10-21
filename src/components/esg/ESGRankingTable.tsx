'use client';

import React from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import { Award, Zap, Flame, Droplet } from 'lucide-react';

export const ESGRankingTable: React.FC = () => {
  const { role, factories, selectedFactoryId, selectedWorkshopId } = useESGSimulation();

  const currentFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
  const currentWorkshop = currentFactory.workshops.find((w) => w.id === selectedWorkshopId) || currentFactory.workshops[0];

  let rankingTitle = '';
  let rankingList: {
    name: string;
    code: string;
    power: number;
    co2: number;
    water: number;
    status: 'normal' | 'warning' | 'danger';
    sub: string;
  }[] = [];

  if (role === 'bod') {
    rankingTitle = 'Xếp hạng tiêu thụ năng lượng theo Nhà máy';
    rankingList = [...factories]
      .sort((a, b) => b.totals.powerKWh - a.totals.powerKWh)
      .map((f) => ({
        name: f.name,
        code: f.code,
        power: f.totals.powerKWh,
        co2: f.totals.co2Kg,
        water: f.totals.waterM3,
        status: f.status,
        sub: f.location,
      }));
  } else if (role === 'factory_director') {
    rankingTitle = `Xếp hạng tiêu thụ theo Phân xưởng (${currentFactory.name})`;
    rankingList = [...currentFactory.workshops]
      .sort((a, b) => b.totals.powerKWh - a.totals.powerKWh)
      .map((w) => ({
        name: w.name,
        code: w.code,
        power: w.totals.powerKWh,
        co2: w.totals.co2Kg,
        water: w.totals.waterM3,
        status: w.status,
        sub: `Quản lý: ${w.manager} • ${w.deviceCount} thiết bị`,
      }));
  } else {
    rankingTitle = `Xếp hạng tiêu thụ theo Thiết bị (${currentWorkshop.name})`;
    rankingList = [...currentWorkshop.devices]
      .sort((a, b) => (b.readings.power?.value || 0) - (a.readings.power?.value || 0))
      .map((d) => ({
        name: d.name,
        code: d.code,
        power: d.readings.power?.value || 0,
        co2: d.readings.co2?.value || 0,
        water: d.readings.water?.value || 0,
        status: d.status,
        sub: d.specification,
      }));
  }

  const getRankBadge = (idx: number) => {
    if (idx === 0) {
      return (
        <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
          1
        </span>
      );
    }
    if (idx === 1) {
      return (
        <span className="w-5 h-5 rounded-full bg-slate-400 text-white font-bold text-[10px] flex items-center justify-center">
          2
        </span>
      );
    }
    if (idx === 2) {
      return (
        <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-bold text-[10px] flex items-center justify-center">
          3
        </span>
      );
    }
    return (
      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 font-medium text-[10px] flex items-center justify-center">
        {idx + 1}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          {rankingTitle}
        </h3>
        <span className="text-xs text-slate-400">Sắp xếp theo điện tiêu thụ</span>
      </div>

      <div className="overflow-x-auto flex-1 my-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-y border-slate-200 font-semibold">
              <th className="py-2 px-2.5 w-8">Hạng</th>
              <th className="py-2 px-2.5">Đối tượng</th>
              <th className="py-2 px-2.5 text-right">⚡ Điện (kWh)</th>
              <th className="py-2 px-2.5 text-right">🏭 CO₂ (kg)</th>
              <th className="py-2 px-2.5 text-right">💧 Nước (m³)</th>
              <th className="py-2 px-2.5 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rankingList.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-2.5">{getRankBadge(idx)}</td>
                <td className="py-2.5 px-2.5">
                  <div className="font-semibold text-slate-800 truncate max-w-[220px]">
                    {item.name}
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate max-w-[220px]">
                    {item.code} • {item.sub}
                  </div>
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono font-bold text-slate-800">
                  {item.power.toLocaleString('vi-VN')}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono text-slate-600">
                  {item.co2.toLocaleString('vi-VN')}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono text-slate-600">
                  {item.water.toLocaleString('vi-VN')}
                </td>
                <td className="py-2.5 px-2.5 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-medium ${
                      item.status === 'danger'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : item.status === 'warning'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {item.status === 'danger'
                      ? 'Vượt ngưỡng'
                      : item.status === 'warning'
                      ? 'Cận ngưỡng'
                      : 'Bình thường'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Cập nhật liên tục theo cảm biến telemetry</span>
        <span className="text-teal-700 font-medium">Báo cáo kiểm soát tiêu thụ</span>
      </div>
    </div>
  );
};
