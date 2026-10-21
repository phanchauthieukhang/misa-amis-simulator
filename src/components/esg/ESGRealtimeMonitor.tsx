'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import { ESGFacilityTree } from './ESGFacilityTree';
import {
  Activity,
  Cpu,
  Zap,
  Flame,
  Droplet,
  Radio,
  Search,
  Filter,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { MetricType } from '@/types/esg';

export const ESGRealtimeMonitor: React.FC = () => {
  const {
    factories,
    selectedFactoryId,
    selectedWorkshopId,
    role,
    isLiveStreaming,
    triggerAnomaly,
  } = useESGSimulation();

  const [searchTerm, setSearchTerm] = useState('');
  const [metricFilter, setMetricFilter] = useState<'all' | MetricType>('all');

  const currentFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
  const currentWorkshop = currentFactory.workshops.find((w) => w.id === selectedWorkshopId) || currentFactory.workshops[0];

  // List of devices to display
  let displayedDevices = currentWorkshop.devices;
  if (metricFilter !== 'all') {
    displayedDevices = displayedDevices.filter((d) => d.metrics.includes(metricFilter));
  }
  if (searchTerm) {
    displayedDevices = displayedDevices.filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Hệ thống giám sát cảm biến đo lường thời gian thực (IoT Telemetry)</span>
              {isLiveStreaming && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  STREAMING LIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đang xem: <strong>{currentFactory.name}</strong> • <strong>{currentWorkshop.name}</strong> ({displayedDevices.length} thiết bị trực tuyến)
            </p>
          </div>
        </div>

        {/* Quick Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm thiết bị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-teal-500 w-[180px] sm:w-[220px]"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMetricFilter('all')}
              className={`px-2 py-1 rounded transition-colors ${
                metricFilter === 'all' ? 'bg-white font-semibold text-slate-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setMetricFilter('power')}
              className={`px-2 py-1 rounded transition-colors ${
                metricFilter === 'power' ? 'bg-amber-500 font-semibold text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              ⚡ Điện
            </button>
            <button
              onClick={() => setMetricFilter('co2')}
              className={`px-2 py-1 rounded transition-colors ${
                metricFilter === 'co2' ? 'bg-red-500 font-semibold text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              🏭 CO₂
            </button>
            <button
              onClick={() => setMetricFilter('water')}
              className={`px-2 py-1 rounded transition-colors ${
                metricFilter === 'water' ? 'bg-sky-500 font-semibold text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              💧 Nước
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Tree (3 cols) + Devices Grid (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Tree on left */}
        <div className="lg:col-span-4 xl:col-span-3">
          <ESGFacilityTree />
        </div>

        {/* Devices grid on right */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedDevices.map((device) => {
              const pRatio = device.readings.power ? device.readings.power.value / device.readings.power.max : 0;
              const cRatio = device.readings.co2 ? device.readings.co2.value / device.readings.co2.max : 0;
              const wRatio = device.readings.water ? device.readings.water.value / device.readings.water.max : 0;

              return (
                <div
                  key={device.id}
                  className={`bg-white rounded-xl border p-4 shadow-2xs transition-all relative overflow-hidden flex flex-col justify-between ${
                    device.status === 'danger'
                      ? 'border-red-300 ring-1 ring-red-400 bg-red-50/20'
                      : device.status === 'warning'
                      ? 'border-amber-300 ring-1 ring-amber-300 bg-amber-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top line of Device card */}
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-teal-600" />
                          <h4 className="font-bold text-xs text-slate-800 tracking-tight">
                            {device.name}
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                          Mã TB: {device.code} • Lắp đặt: {device.installedDate}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          device.status === 'danger'
                            ? 'bg-red-600 text-white'
                            : device.status === 'warning'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            device.status === 'danger'
                              ? 'bg-white animate-ping'
                              : device.status === 'warning'
                              ? 'bg-white'
                              : 'bg-emerald-600'
                          }`}
                        />
                        {device.status === 'danger'
                          ? 'VƯỢT NGƯỠNG'
                          : device.status === 'warning'
                          ? 'CẬN NGƯỠNG'
                          : 'BÌNH THƯỜNG'}
                      </span>
                    </div>

                    {/* Metric Gauges / Readings */}
                    <div className="space-y-2.5 my-3 text-xs">
                      {/* Power gauge */}
                      {device.readings.power && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1 text-slate-600">
                              <Zap className="w-3 h-3 text-amber-500" /> Điện tiêu thụ:
                            </span>
                            <span className="font-mono font-bold text-slate-800">
                              {device.readings.power.value}{' '}
                              <span className="text-slate-400 font-normal">/ {device.readings.power.max} kWh</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                pRatio >= 1.0 ? 'bg-red-500' : pRatio >= 0.8 ? 'bg-amber-500' : 'bg-amber-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.round(pRatio * 100))}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* CO2 gauge */}
                      {device.readings.co2 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1 text-slate-600">
                              <Flame className="w-3 h-3 text-red-500" /> Phát thải CO₂:
                            </span>
                            <span className="font-mono font-bold text-slate-800">
                              {device.readings.co2.value}{' '}
                              <span className="text-slate-400 font-normal">/ {device.readings.co2.max} kg</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                cRatio >= 1.0 ? 'bg-red-600' : cRatio >= 0.8 ? 'bg-amber-500' : 'bg-red-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.round(cRatio * 100))}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Water gauge */}
                      {device.readings.water && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1 text-slate-600">
                              <Droplet className="w-3 h-3 text-sky-500" /> Nước thải xả:
                            </span>
                            <span className="font-mono font-bold text-slate-800">
                              {device.readings.water.value}{' '}
                              <span className="text-slate-400 font-normal">/ {device.readings.water.max} m³</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                wRatio >= 1.0 ? 'bg-red-500' : wRatio >= 0.8 ? 'bg-amber-500' : 'bg-sky-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.round(wRatio * 100))}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Specs & Quick Maintenance Request */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate max-w-[200px]" title={device.specification}>
                      {device.specification}
                    </span>
                    <button
                      onClick={() => alert(`Đã tạo phiếu kiểm tra kỹ thuật cho thiết bị ${device.name}`)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Yêu cầu kiểm tra</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
