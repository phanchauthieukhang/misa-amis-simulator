'use client';

import React from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import { ESGStatsCards } from './ESGStatsCards';
import { ESGTrendChart } from './ESGTrendChart';
import { ESGComparisonChart } from './ESGComparisonChart';
import { ESGRankingTable } from './ESGRankingTable';
import { ESGAlertsList } from './ESGAlertsList';
import {
  Calendar,
  Building,
  ShieldCheck,
  Clock,
  Sliders,
  Zap,
} from 'lucide-react';
import { TimePeriod } from '@/types/esg';

export const ESGDashboard: React.FC = () => {
  const {
    role,
    currentRoleConfig,
    factories,
    selectedFactoryId,
    selectedWorkshopId,
    timePeriod,
    setTimePeriod,
  } = useESGSimulation();

  const currentFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
  const currentWorkshop = currentFactory.workshops.find((w) => w.id === selectedWorkshopId) || currentFactory.workshops[0];

  const roleTitle =
    role === 'bod'
      ? 'Bàn làm việc Giám đốc: Quản trị Năng lượng & Phát thải Vinamilk'
      : role === 'factory_director'
      ? `Bàn làm việc Quản đốc: ${currentFactory.name}`
      : `Bàn làm việc Trưởng bộ phận: ${currentWorkshop.name}`;

  const roleSubtitle =
    role === 'bod'
      ? 'Theo dõi chỉ số ESG toàn diện trên cả 3 nhà máy sản xuất trọng điểm của Vinamilk'
      : role === 'factory_director'
      ? `Phân tích hiệu suất năng lượng và kiểm soát định mức giữa các phân xưởng trực thuộc`
      : `Giám sát thời gian thực từng thiết bị sản xuất, xử lý sự cố và báo động tức thì`;

  return (
    <div className="flex-1 flex flex-col gap-4 pb-20">
      {/* Dashboard Sub-Header Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              {roleTitle}
            </h2>
            <span className="text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
              Vinamilk ESG Platform
            </span>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              {currentRoleConfig.scopeLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{roleSubtitle}</p>
        </div>

        {/* Action Controls & Role-tailored Period Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Filter restricted to Role Scope */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold text-slate-700">Kỳ kiểm soát:</span>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              {currentRoleConfig.allowedPeriods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span className="truncate max-w-[160px]">
              {role === 'bod' ? 'Toàn DN' : role === 'factory_director' ? currentFactory.code : currentWorkshop.code}
            </span>
          </div>
        </div>
      </div>

      {/* Role Horizon & Threshold Guidance Banner */}
      <div className="bg-teal-50/70 border border-teal-200 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-teal-900">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-700 flex-shrink-0" />
          <span>
            <strong>Cơ chế cảnh báo:</strong> {currentRoleConfig.evalPeriodLabel}
          </span>
          <span className="text-teal-400">•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-600" />
            Ngưỡng báo động điện: <strong>&gt; {currentRoleConfig.thresholds.powerDanger.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.powerUnit}</strong>
          </span>
        </div>

        <div className="text-[11px] text-teal-700 italic hidden md:block">
          {currentRoleConfig.rationale}
        </div>
      </div>

      {/* 4 Stats Cards */}
      <ESGStatsCards />

      {/* Mid Row: Line Chart + Bar Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <ESGTrendChart />
        </div>
        <div className="lg:col-span-5">
          <ESGComparisonChart />
        </div>
      </div>

      {/* Bottom Row: Ranking Table + Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <ESGRankingTable />
        </div>
        <div className="lg:col-span-6">
          <ESGAlertsList />
        </div>
      </div>
    </div>
  );
};
