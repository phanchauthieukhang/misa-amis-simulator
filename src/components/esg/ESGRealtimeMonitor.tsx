'use client';

import React, { useState, useEffect } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import { ESGFacilityTree } from './ESGFacilityTree';
import { QuotaBar150 } from './QuotaBar150';
import {
  Activity,
  Cpu,
  Zap,
  Flame,
  Droplet,
  Search,
  Wrench,
  CheckCircle2,
  Clock,
  Building2,
  Factory,
  Layers,
  ChevronRight,
  ArrowLeft,
  Gauge,
  FileText,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Download,
  Info,
  Calendar,
  Lock,
  Radio,
} from 'lucide-react';
import { MetricType, FactoryItem, WorkshopItem, DeviceItem, TimePeriod } from '@/types/esg';

export const ESGRealtimeMonitor: React.FC = () => {
  const {
    factories,
    role,
    currentRoleConfig,
    timePeriod,
    setTimePeriod,
    scopedTotals,
    periodsData,
    viewLevel,
    setViewLevel,
    selectedFactoryId,
    setSelectedFactoryId,
    selectedWorkshopId,
    setSelectedWorkshopId,
    selectedDeviceId,
    setSelectedDeviceId,
    isLiveStreaming,
    unitPreferences,
  } = useESGSimulation();

  const [searchTerm, setSearchTerm] = useState('');
  const [metricFilter, setMetricFilter] = useState<'all' | MetricType>('all');
  const [inspectionSuccessMsg, setInspectionSuccessMsg] = useState<string | null>(null);

  // Live historical points for the deep-dive device waveform
  const [waveformHistory, setWaveformHistory] = useState<number[]>([
    490, 505, 512, 508, 519, 515, 524, 528, 521, 530,
  ]);

  // Current selections resolved safely
  const currentFactory =
    factories.find((f) => f.id === selectedFactoryId) || factories[0];
  const currentWorkshop =
    currentFactory.workshops.find((w) => w.id === selectedWorkshopId) ||
    currentFactory.workshops[0];
  const currentDevice =
    currentWorkshop.devices.find((d) => d.id === selectedDeviceId) ||
    currentWorkshop.devices[0];

  // Update waveform when current device readings change
  useEffect(() => {
    if (!currentDevice?.readings?.power?.value) return;
    const currentVal = currentDevice.readings.power.value;
    setWaveformHistory((prev) => {
      const next = [...prev.slice(1), currentVal];
      return next;
    });
  }, [currentDevice?.readings?.power?.value]);

  // Format power reading according to user preference
  const formatPower = (kwh: number) => {
    if (unitPreferences.power === 'MWh') {
      return `${(kwh / 1000).toFixed(2)} MWh`;
    }
    return `${kwh.toLocaleString('vi-VN')} kWh`;
  };

  // Format CO2 reading
  const formatCO2 = (kg: number) => {
    if (unitPreferences.co2 === 'ton') {
      return `${(kg / 1000).toFixed(2)} tấn`;
    }
    return `${kg.toLocaleString('vi-VN')} kg`;
  };

  // Format Water reading
  const formatWater = (m3: number) => {
    if (unitPreferences.water === 'liter') {
      return `${(m3 * 1000).toLocaleString('vi-VN')} L`;
    }
    return `${m3.toLocaleString('vi-VN')} m³`;
  };

  // Corporate aggregates (Enterprise level)
  const enterpriseTotals = factories.reduce(
    (acc, f) => ({
      power: acc.power + f.totals.powerKWh,
      co2: acc.co2 + f.totals.co2Kg,
      water: acc.water + f.totals.waterM3,
      workshops: acc.workshops + f.workshops.length,
      devices:
        acc.devices +
        f.workshops.reduce((wsAcc, ws) => wsAcc + ws.devices.length, 0),
    }),
    { power: 0, co2: 0, water: 0, workshops: 0, devices: 0 }
  );

  // Filtered devices for workshop level
  let displayedDevices = currentWorkshop.devices;
  if (metricFilter !== 'all') {
    displayedDevices = displayedDevices.filter((d) =>
      d.metrics.includes(metricFilter)
    );
  }
  if (searchTerm) {
    displayedDevices = displayedDevices.filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Quick dispatch inspection notice
  const handleRequestInspection = (deviceName: string) => {
    const code = `PKT-${Math.floor(1000 + Math.random() * 9000)}/HSE`;
    setInspectionSuccessMsg(
      `Đã khởi tạo phiếu kiểm tra kỹ thuật [${code}] cho "${deviceName}". Thông báo đã chuyển tới Đội Vận hành & Bảo trì.`
    );
    setTimeout(() => {
      setInspectionSuccessMsg(null);
    }, 5000);
  };

  const computeQuotaStatus = (
    metrics: { power: number; co2?: number; water?: number },
    limits: { power: number; co2?: number; water?: number }
  ): 'normal' | 'warning' | 'danger' => {
    const pRatio = limits.power > 0 ? metrics.power / limits.power : 0;
    const cRatio = limits.co2 && limits.co2 > 0 && metrics.co2 ? metrics.co2 / limits.co2 : 0;
    const wRatio = limits.water && limits.water > 0 && metrics.water ? metrics.water / limits.water : 0;
    const maxRatio = Math.max(pRatio, cRatio, wRatio);
    if (maxRatio >= 1.0) return 'danger';
    if (maxRatio >= 0.8) return 'warning';
    return 'normal';
  };

  const getFactoryMetrics = (f: FactoryItem) => {
    if (scopedTotals.isClosedPeriod && timePeriod === 'h1_2026') {
      if (f.id === 'nm-vnm-bd') {
        return { power: 26480, co2: 15200, water: 1750, quotaP: 25000, quotaC: 17500, quotaW: 2000 };
      }
      if (f.id === 'nm-mega-dairy') {
        return { power: 13200, co2: 7500, water: 850, quotaP: 25000, quotaC: 17500, quotaW: 2000 };
      }
      return { power: 12800, co2: 7400, water: 850, quotaP: 25000, quotaC: 17500, quotaW: 2000 };
    }
    return {
      power: f.totals.powerKWh,
      co2: f.totals.co2Kg,
      water: f.totals.waterM3,
      quotaP: 5000,
      quotaC: 3500,
      quotaW: 400,
    };
  };

  const getStatusBadge = (status: 'normal' | 'warning' | 'danger') => {
    if (status === 'danger') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          VƯỢT ĐỊNH MỨC
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          CẬN ĐỊNH MỨC
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        BÌNH THƯỜNG
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Toast Notice for inspection requests */}
      {inspectionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl shadow-xs flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{inspectionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setInspectionSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Interactive Breadcrumb Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                <span>Hệ thống giám sát cảm biến đo lường thời gian thực (IoT Telemetry)</span>
                {scopedTotals.isClosedPeriod ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                    <Lock className="w-3 h-3 text-amber-600" />
                    ĐÃ ĐÓNG SỔ (SỐ LIỆU ĐÓNG BĂNG KIỂM TOÁN)
                  </span>
                ) : isLiveStreaming ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    STREAMING LIVE (3s)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    TẠM DỪNG MÔ PHỎNG
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thu thập dữ liệu phụ tải điện, khí thải KNK & nguồn nước qua giao thức SCADA / Modbus TCP/IP
              </p>
            </div>
          </div>

          {/* Controls: Closed/Live Badge + Period Selector + Scope Badge */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            {/* Status Badge: Closed vs Live */}
            {scopedTotals.isClosedPeriod ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>ĐÃ ĐÓNG SỔ</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>LIVE</span>
              </span>
            )}

            {/* Role-tailored Period Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-semibold text-slate-700">Kỳ:</span>
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

            {/* Scope Level Indicator Badge */}
            <span className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              {viewLevel === 'enterprise' && 'CẤP ĐỘ: TẬP ĐOÀN'}
              {viewLevel === 'factory' && `CẤP ĐỘ: NHÀ MÁY`}
              {viewLevel === 'workshop' && `CẤP ĐỘ: PHÂN XƯỞNG`}
              {viewLevel === 'device' && 'CẤP ĐỘ: THIẾT BỊ'}
            </span>
          </div>
        </div>

        {/* Interactive Breadcrumb Bar */}
        <div className="flex items-center flex-wrap gap-1.5 pt-2.5 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1">Vị trí giám sát:</span>

          {/* Root Level: Enterprise */}
          <button
            onClick={() => {
              setViewLevel('enterprise');
              setSelectedDeviceId(null);
            }}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              viewLevel === 'enterprise'
                ? 'bg-teal-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-teal-700 font-medium'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Tập đoàn Vinamilk</span>
          </button>

          {/* Factory Level */}
          {viewLevel !== 'enterprise' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => {
                  setViewLevel('factory');
                  setSelectedDeviceId(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  viewLevel === 'factory'
                    ? 'bg-teal-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-teal-700 font-medium'
                }`}
              >
                <Factory className="w-3.5 h-3.5" />
                <span>{currentFactory.name}</span>
              </button>
            </>
          )}

          {/* Workshop Level */}
          {(viewLevel === 'workshop' || viewLevel === 'device') && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => {
                  setViewLevel('workshop');
                  setSelectedDeviceId(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  viewLevel === 'workshop'
                    ? 'bg-teal-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-teal-700 font-medium'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{currentWorkshop.name}</span>
              </button>
            </>
          )}

          {/* Device Level */}
          {viewLevel === 'device' && currentDevice && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="px-2.5 py-1 rounded-md bg-sky-600 text-white font-bold shadow-2xs flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>{currentDevice.name}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Split: Facility Tree (3 cols) + Hierarchical Content (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Tree */}
        <div className="lg:col-span-4 xl:col-span-3">
          <ESGFacilityTree />
        </div>

        {/* Right Hierarchical Panel */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* ============================================================== */}
          {/* LEVEL 1: ENTERPRISE VIEW (When Tập đoàn Vinamilk is selected)  */}
          {/* ============================================================== */}
          {viewLevel === 'enterprise' && (
            <div className="space-y-4">
              {/* Corporate Macro KPI Banner */}
              <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-xl p-5 text-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                      Bảng điều khiển Giám đốc Môi trường & Ban Lãnh đạo Tập đoàn
                    </span>
                    <h3 className="text-lg font-bold mt-0.5">
                      Tổng quan Hoạt động Vi mô 3 Nhà máy Trọng điểm
                    </h3>
                  </div>
                  <div className="text-xs text-white/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>SCADA Toàn hệ thống Trực tuyến</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-lg border border-white/10">
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
                      <Zap className="w-4 h-4" /> Tổng Phụ tải Điện
                    </div>
                    <div className="text-lg font-bold font-mono">
                      {formatPower(enterpriseTotals.power)}
                    </div>
                    <span className="text-[11px] text-white/70">
                      3/3 Nhà máy hòa lưới
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-lg border border-white/10">
                    <div className="flex items-center gap-1.5 text-red-300 font-semibold mb-1">
                      <Flame className="w-4 h-4" /> Tổng Phát thải CO₂
                    </div>
                    <div className="text-lg font-bold font-mono">
                      {formatCO2(enterpriseTotals.co2)}
                    </div>
                    <span className="text-[11px] text-white/70">
                      Theo kiểm kê Scope 1 & 2
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-lg border border-white/10">
                    <div className="flex items-center gap-1.5 text-sky-300 font-semibold mb-1">
                      <Droplet className="w-4 h-4" /> Tổng Nước xả/tái chế
                    </div>
                    <div className="text-lg font-bold font-mono">
                      {formatWater(enterpriseTotals.water)}
                    </div>
                    <span className="text-[11px] text-white/70">
                      Hệ thống MBR tuần hoàn
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-lg border border-white/10">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-semibold mb-1">
                      <ShieldCheck className="w-4 h-4" /> Quy mô Giám sát
                    </div>
                    <div className="text-lg font-bold font-mono">
                      {enterpriseTotals.devices} Cảm biến
                    </div>
                    <span className="text-[11px] text-white/70">
                      {factories.length} Nhà máy • {enterpriseTotals.workshops} Phân xưởng
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & Instructions */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Factory className="w-4 h-4 text-teal-600" />
                    <span>Thông số hoạt động 3 Nhà máy thành viên ({factories.length} Đơn vị)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nhấp vào từng nhà máy bên dưới hoặc tại cây phân cấp bên trái để xem chi tiết các phân xưởng trực thuộc.
                  </p>
                </div>
              </div>

              {/* Grid of the 3 Factories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {factories.map((factory) => {
                  const fMetrics = getFactoryMetrics(factory);
                  const pRatio = fMetrics.quotaP > 0 ? fMetrics.power / fMetrics.quotaP : 0;
                  const cRatio = fMetrics.quotaC > 0 ? fMetrics.co2 / fMetrics.quotaC : 0;
                  const wRatio = fMetrics.quotaW > 0 ? fMetrics.water / fMetrics.quotaW : 0;
                  const factCardStatus = computeQuotaStatus(
                    { power: fMetrics.power, co2: fMetrics.co2, water: fMetrics.water },
                    { power: fMetrics.quotaP, co2: fMetrics.quotaC, water: fMetrics.quotaW }
                  );

                  return (
                    <div
                      key={factory.id}
                      onClick={() => {
                        setSelectedFactoryId(factory.id);
                        setViewLevel('factory');
                        setSelectedDeviceId(null);
                      }}
                      className="bg-white rounded-xl border border-slate-200 hover:border-teal-400 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">
                                {factory.code}
                              </span>
                              <h4 className="font-bold text-xs text-slate-800 group-hover:text-teal-700 transition-colors">
                                {factory.name}
                              </h4>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-1">
                              Giám đốc: <strong>{factory.director}</strong>
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[220px]">
                              {factory.location}
                            </span>
                          </div>
                          {getStatusBadge(factCardStatus)}
                        </div>

                        {/* Telemetry Metrics */}
                        <div className="space-y-2.5 my-3 text-xs">
                          {/* Power */}
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="flex items-center gap-1 text-slate-600 font-medium">
                                <Zap className="w-3.5 h-3.5 text-amber-500" /> Điện tiêu thụ:
                              </span>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="font-bold text-slate-800">
                                  {formatPower(fMetrics.power)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  / {formatPower(fMetrics.quotaP)}
                                </span>
                                <span
                                  className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                                    pRatio >= 1.0
                                      ? 'text-red-700 bg-red-100 animate-pulse border border-red-200'
                                      : pRatio >= 0.8
                                      ? 'text-amber-800 bg-amber-100 border border-amber-200'
                                      : 'text-slate-600 bg-slate-200/60'
                                  }`}
                                >
                                  {Math.round(pRatio * 100)}%
                                </span>
                              </div>
                            </div>
                            <QuotaBar150
                              current={fMetrics.power}
                              max={fMetrics.quotaP}
                              baseColor="bg-amber-500"
                              heightClass="h-2"
                              showScaleTicks={true}
                              notchLabel="100%"
                            />
                          </div>

                          {/* CO2 */}
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="flex items-center gap-1 text-slate-600 font-medium">
                                <Flame className="w-3.5 h-3.5 text-red-500" /> Phát thải CO₂:
                              </span>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="font-bold text-slate-800">
                                  {formatCO2(fMetrics.co2)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  / {formatCO2(fMetrics.quotaC)}
                                </span>
                                <span
                                  className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                                    cRatio >= 1.0
                                      ? 'text-red-700 bg-red-100 animate-pulse border border-red-200'
                                      : cRatio >= 0.8
                                      ? 'text-amber-800 bg-amber-100 border border-amber-200'
                                      : 'text-slate-600 bg-slate-200/60'
                                  }`}
                                >
                                  {Math.round(cRatio * 100)}%
                                </span>
                              </div>
                            </div>
                            <QuotaBar150
                              current={fMetrics.co2}
                              max={fMetrics.quotaC}
                              baseColor="bg-orange-500"
                              heightClass="h-2"
                              showScaleTicks={true}
                              notchLabel="100%"
                            />
                          </div>

                          {/* Water */}
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="flex items-center gap-1 text-slate-600 font-medium">
                                <Droplet className="w-3.5 h-3.5 text-sky-500" /> Nước thải xả:
                              </span>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="font-bold text-slate-800">
                                  {formatWater(fMetrics.water)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  / {formatWater(fMetrics.quotaW)}
                                </span>
                                <span
                                  className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                                    wRatio >= 1.0
                                      ? 'text-red-700 bg-red-100 animate-pulse border border-red-200'
                                      : wRatio >= 0.8
                                      ? 'text-amber-800 bg-amber-100 border border-amber-200'
                                      : 'text-slate-600 bg-slate-200/60'
                                  }`}
                                >
                                  {Math.round(wRatio * 100)}%
                                </span>
                              </div>
                            </div>
                            <QuotaBar150
                              current={fMetrics.water}
                              max={fMetrics.quotaW}
                              baseColor="bg-sky-500"
                              heightClass="h-2"
                              showScaleTicks={true}
                              notchLabel="100%"
                            />
                          </div>
                        </div>

                        {/* Workshops preview */}
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-500 block mb-1">
                            Gồm {factory.workshops.length} phân xưởng sản xuất:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {factory.workshops.map((w) => (
                              <span
                                key={w.id}
                                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[130px]"
                                title={w.name}
                              >
                                {w.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Action */}
                      <button className="mt-3.5 w-full py-1.5 px-3 text-xs font-semibold text-teal-700 bg-teal-50 group-hover:bg-teal-600 group-hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1">
                        <span>Chi tiết các phân xưởng</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* LEVEL 2: FACTORY VIEW (Workshops of the selected factory)      */}
          {/* ============================================================== */}
          {viewLevel === 'factory' && (() => {
            const curFactPower =
              scopedTotals.isClosedPeriod && timePeriod === 'q3_2026'
                ? periodsData.q3_2026.powerKWh
                : currentFactory.totals.powerKWh;
            const curFactCo2 =
              scopedTotals.isClosedPeriod && timePeriod === 'q3_2026'
                ? periodsData.q3_2026.co2Kg
                : currentFactory.totals.co2Kg;
            const curFactWater =
              scopedTotals.isClosedPeriod && timePeriod === 'q3_2026'
                ? periodsData.q3_2026.waterM3
                : currentFactory.totals.waterM3;

            const curFactPRatio = curFactPower / 5000;
            const curFactCRatio = curFactCo2 / 3500;
            const curFactWRatio = curFactWater / 400;

            const curFactStatus = computeQuotaStatus(
              { power: curFactPower, co2: curFactCo2, water: curFactWater },
              { power: 5000, co2: 3500, water: 400 }
            );

            return (
            <div className="space-y-4">
              {/* Closed period notice banner if applicable */}
              {scopedTotals.isClosedPeriod && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Số liệu đã đóng sổ ({scopedTotals.periodLabel}):</strong> Toàn bộ dữ liệu đo lường đã được khóa sổ kiểm toán và đối chiếu biên bản CAPA.
                    </span>
                  </div>
                  <span className="font-mono font-bold text-amber-800 text-[11px] shrink-0 ml-3">
                    {scopedTotals.dateRange}
                  </span>
                </div>
              )}

              {/* Factory Overview Banner */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setViewLevel('enterprise');
                        setSelectedDeviceId(null);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                      title="Quay lại Tổng quan Tập đoàn"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                          {currentFactory.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-800">
                          {currentFactory.name}
                        </h3>
                        {getStatusBadge(curFactStatus)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Giám đốc: <strong>{currentFactory.director}</strong> • Địa điểm: {currentFactory.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setViewLevel('enterprise');
                        setSelectedDeviceId(null);
                      }}
                      className="text-xs font-medium text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Xem toàn bộ 3 Nhà máy</span>
                    </button>
                  </div>
                </div>

                {/* Aggregated Totals of This Factory */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
                  <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-800 font-medium flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-600" /> Điện tiêu thụ Nhà máy
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatPower(curFactPower)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10.5px] text-amber-900/80 font-mono mt-1">
                        <span>Định mức: 5.000 kWh</span>
                        <span
                          className={`font-bold ${
                            curFactPRatio >= 1.0
                              ? 'text-red-600 animate-pulse'
                              : curFactPRatio >= 0.8
                              ? 'text-amber-700 font-bold'
                              : 'text-amber-800'
                          }`}
                        >
                          {Math.round(curFactPRatio * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <QuotaBar150
                        current={curFactPower}
                        max={5000}
                        baseColor="bg-amber-500"
                        heightClass="h-2"
                        showScaleTicks={true}
                        notchLabel="100%"
                      />
                    </div>
                  </div>

                  <div className="bg-red-50/50 border border-red-200/60 p-3 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-red-800 font-medium flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-red-600" /> Phát thải CO₂ Nhà máy
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatCO2(curFactCo2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10.5px] text-red-900/80 font-mono mt-1">
                        <span>Định mức: 3.500 kg</span>
                        <span
                          className={`font-bold ${
                            curFactCRatio >= 1.0
                              ? 'text-red-600 animate-pulse'
                              : curFactCRatio >= 0.8
                              ? 'text-red-700 font-bold'
                              : 'text-red-800'
                          }`}
                        >
                          {Math.round(curFactCRatio * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <QuotaBar150
                        current={curFactCo2}
                        max={3500}
                        baseColor="bg-orange-500"
                        heightClass="h-2"
                        showScaleTicks={true}
                        notchLabel="100%"
                      />
                    </div>
                  </div>

                  <div className="bg-sky-50/50 border border-sky-200/60 p-3 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sky-800 font-medium flex items-center gap-1">
                          <Droplet className="w-3.5 h-3.5 text-sky-600" /> Nước xả/tái chế Nhà máy
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatWater(curFactWater)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10.5px] text-sky-900/80 font-mono mt-1">
                        <span>Định mức: 400 m³</span>
                        <span
                          className={`font-bold ${
                            curFactWRatio >= 1.0
                              ? 'text-red-600 animate-pulse'
                              : curFactWRatio >= 0.8
                              ? 'text-sky-700 font-bold'
                              : 'text-sky-800'
                          }`}
                        >
                          {Math.round(curFactWRatio * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <QuotaBar150
                        current={curFactWater}
                        max={400}
                        baseColor="bg-sky-500"
                        heightClass="h-2"
                        showScaleTicks={true}
                        notchLabel="100%"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Danh sách Phân xưởng sản xuất ({currentFactory.workshops.length} Phân xưởng)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chọn phân xưởng bên dưới hoặc trên cây bên trái để xem danh sách thiết bị đo lường cụ thể.
                  </p>
                </div>
              </div>

              {/* Grid of Workshops */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentFactory.workshops.map((workshop) => {
                  const wsLimits = { power: 2500, co2: 1800, water: 250 };
                  const wsPRatio = workshop.totals.powerKWh / wsLimits.power;
                  const wsCRatio = workshop.totals.co2Kg / wsLimits.co2;
                  const wsWRatio = workshop.totals.waterM3 / wsLimits.water;
                  const wsCardStatus = computeQuotaStatus(
                    { power: workshop.totals.powerKWh, co2: workshop.totals.co2Kg, water: workshop.totals.waterM3 },
                    wsLimits
                  );

                  return (
                    <div
                      key={workshop.id}
                      onClick={() => {
                        setSelectedWorkshopId(workshop.id);
                        setViewLevel('workshop');
                        setSelectedDeviceId(null);
                      }}
                      className="bg-white rounded-xl border border-slate-200 hover:border-emerald-400 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                                {workshop.code}
                              </span>
                              <h4 className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 transition-colors">
                                {workshop.name}
                              </h4>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-1">
                              Quản đốc: <strong>{workshop.manager}</strong>
                            </span>
                          </div>
                          {getStatusBadge(wsCardStatus)}
                        </div>

                        {/* Telemetry Metrics */}
                        <div className="space-y-2.5 my-3 text-xs">
                          {/* Power */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="flex items-center gap-1 text-slate-600">
                                <Zap className="w-3 h-3 text-amber-500" /> Điện:
                              </span>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="font-bold text-slate-800">
                                  {formatPower(workshop.totals.powerKWh)}
                                </span>
                                <span className="text-[10px] text-slate-400">/ 2.500 kWh</span>
                                <span
                                  className={`text-[10px] font-bold px-1 rounded ${
                                    wsPRatio >= 1.0
                                      ? 'text-red-700 bg-red-100 animate-pulse border border-red-200'
                                      : wsPRatio >= 0.8
                                      ? 'text-amber-800 bg-amber-100 border border-amber-200'
                                      : 'text-slate-500 bg-slate-100'
                                  }`}
                                >
                                  {Math.round(wsPRatio * 100)}%
                                </span>
                              </div>
                            </div>
                            <QuotaBar150
                              current={workshop.totals.powerKWh}
                              max={2500}
                              baseColor="bg-amber-500"
                              heightClass="h-1.5"
                              showScaleTicks={false}
                            />
                          </div>

                          {/* CO2 */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="flex items-center gap-1 text-slate-600">
                                <Flame className="w-3 h-3 text-red-500" /> CO₂:
                              </span>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="font-bold text-slate-800">
                                  {formatCO2(workshop.totals.co2Kg)}
                                </span>
                                <span className="text-[10px] text-slate-400">/ 1.800 kg</span>
                                <span
                                  className={`text-[10px] font-bold px-1 rounded ${
                                    wsCRatio >= 1.0
                                      ? 'text-red-700 bg-red-100 animate-pulse border border-red-200'
                                      : wsCRatio >= 0.8
                                      ? 'text-amber-800 bg-amber-100 border border-amber-200'
                                      : 'text-slate-500 bg-slate-100'
                                  }`}
                                >
                                  {Math.round(wsCRatio * 100)}%
                                </span>
                              </div>
                            </div>
                            <QuotaBar150
                              current={workshop.totals.co2Kg}
                              max={1800}
                              baseColor="bg-orange-500"
                              heightClass="h-1.5"
                              showScaleTicks={false}
                            />
                          </div>

                          {/* Water */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="flex items-center gap-1 text-slate-600">
                                <Droplet className="w-3 h-3 text-sky-500" /> Nước:
                              </span>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="font-bold text-slate-800">
                                  {formatWater(workshop.totals.waterM3)}
                                </span>
                                <span className="text-[10px] text-slate-400">/ 250 m³</span>
                                <span
                                  className={`text-[10px] font-bold px-1 rounded ${
                                    wsWRatio >= 1.0
                                      ? 'text-red-700 bg-red-100 animate-pulse border border-red-200'
                                      : wsWRatio >= 0.8
                                      ? 'text-amber-800 bg-amber-100 border border-amber-200'
                                      : 'text-slate-500 bg-slate-100'
                                  }`}
                                >
                                  {Math.round(wsWRatio * 100)}%
                                </span>
                              </div>
                            </div>
                            <QuotaBar150
                              current={workshop.totals.waterM3}
                              max={250}
                              baseColor="bg-sky-500"
                              heightClass="h-1.5"
                              showScaleTicks={false}
                            />
                          </div>
                        </div>

                        {/* Devices list summary */}
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-500 block mb-1">
                            {workshop.devices.length} Thiết bị giám sát:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {workshop.devices.slice(0, 3).map((d) => (
                              <span
                                key={d.id}
                                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[120px]"
                                title={d.name}
                              >
                                {d.name}
                              </span>
                            ))}
                            {workshop.devices.length > 3 && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                +{workshop.devices.length - 3} máy khác
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action */}
                      <button className="mt-3.5 w-full py-1.5 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1">
                        <span>Xem danh sách thiết bị</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })()}

          {/* ============================================================== */}
          {/* LEVEL 3: WORKSHOP VIEW (Devices grid in the workshop)           */}
          {/* ============================================================== */}
          {viewLevel === 'workshop' && (() => {
            const curWsStatus = computeQuotaStatus(
              {
                power: currentWorkshop.totals.powerKWh,
                co2: currentWorkshop.totals.co2Kg,
                water: currentWorkshop.totals.waterM3,
              },
              { power: 2500, co2: 1800, water: 250 }
            );

            return (
            <div className="space-y-4">
              {/* Workshop Summary & Filter Bar */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setViewLevel('factory');
                      setSelectedDeviceId(null);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                    title={`Quay lại ${currentFactory.name}`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                        {currentWorkshop.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-800">
                        {currentWorkshop.name}
                      </h3>
                      {getStatusBadge(curWsStatus)}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Thuộc <strong>{currentFactory.name}</strong> • Quản đốc: <strong>{currentWorkshop.manager}</strong> ({displayedDevices.length} thiết bị trực tuyến)
                    </p>
                  </div>
                </div>

                {/* Quick Search & Metric Filters */}
                <div className="flex items-center flex-wrap gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tìm thiết bị trong PX..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-teal-500 w-[170px]"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setMetricFilter('all')}
                      className={`px-2 py-1 rounded transition-colors ${
                        metricFilter === 'all'
                          ? 'bg-white font-semibold text-slate-800 shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setMetricFilter('power')}
                      className={`px-2 py-1 rounded transition-colors ${
                        metricFilter === 'power'
                          ? 'bg-amber-500 font-semibold text-white shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      ⚡ Điện
                    </button>
                    <button
                      onClick={() => setMetricFilter('co2')}
                      className={`px-2 py-1 rounded transition-colors ${
                        metricFilter === 'co2'
                          ? 'bg-red-500 font-semibold text-white shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      🏭 CO₂
                    </button>
                    <button
                      onClick={() => setMetricFilter('water')}
                      className={`px-2 py-1 rounded transition-colors ${
                        metricFilter === 'water'
                          ? 'bg-sky-500 font-semibold text-white shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      💧 Nước
                    </button>
                  </div>
                </div>
              </div>

              {/* Devices Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedDevices.map((device) => {
                  const pRatio = device.readings.power
                    ? device.readings.power.value / device.readings.power.max
                    : 0;
                  const cRatio = device.readings.co2
                    ? device.readings.co2.value / device.readings.co2.max
                    : 0;
                  const wRatio = device.readings.water
                    ? device.readings.water.value / device.readings.water.max
                    : 0;

                  const devCardStatus = computeQuotaStatus(
                    {
                      power: device.readings.power?.value || 0,
                      co2: device.readings.co2?.value || 0,
                      water: device.readings.water?.value || 0,
                    },
                    {
                      power: device.readings.power?.max || 1,
                      co2: device.readings.co2?.max || 1,
                      water: device.readings.water?.max || 1,
                    }
                  );

                  return (
                    <div
                      key={device.id}
                      className={`bg-white rounded-xl border p-4 shadow-2xs transition-all relative overflow-hidden flex flex-col justify-between ${
                        devCardStatus === 'danger'
                          ? 'border-red-300 ring-1 ring-red-400 bg-red-50/20'
                          : devCardStatus === 'warning'
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
                          {getStatusBadge(devCardStatus)}
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
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="font-bold text-slate-800">
                                    {device.readings.power.value}{' '}
                                    <span className="text-slate-400 font-normal">
                                      / {device.readings.power.max} kWh
                                    </span>
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-1 rounded ${
                                      pRatio >= 1.0
                                        ? 'text-red-700 bg-red-100 animate-pulse border border-red-200'
                                        : pRatio >= 0.8
                                        ? 'text-amber-800 bg-amber-100 border border-amber-200'
                                        : 'text-slate-500 bg-slate-100'
                                    }`}
                                  >
                                    {Math.round(pRatio * 100)}%
                                  </span>
                                </div>
                              </div>
                              <QuotaBar150
                                current={device.readings.power.value}
                                max={device.readings.power.max}
                                baseColor="bg-amber-500"
                                heightClass="h-2"
                                showScaleTicks={false}
                              />
                            </div>
                          )}

                          {/* CO2 gauge */}
                          {device.readings.co2 && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="flex items-center gap-1 text-slate-600">
                                  <Flame className="w-3 h-3 text-red-500" /> Phát thải CO₂:
                                </span>
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="font-bold text-slate-800">
                                    {device.readings.co2.value}{' '}
                                    <span className="text-slate-400 font-normal">
                                      / {device.readings.co2.max} kg
                                    </span>
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-1 rounded ${
                                      cRatio >= 1.0
                                        ? 'text-red-700 bg-red-100 animate-pulse border border-red-200'
                                        : cRatio >= 0.8
                                        ? 'text-amber-800 bg-amber-100 border border-amber-200'
                                        : 'text-slate-500 bg-slate-100'
                                    }`}
                                  >
                                    {Math.round(cRatio * 100)}%
                                  </span>
                                </div>
                              </div>
                              <QuotaBar150
                                current={device.readings.co2.value}
                                max={device.readings.co2.max}
                                baseColor="bg-orange-500"
                                heightClass="h-2"
                                showScaleTicks={false}
                              />
                            </div>
                          )}

                          {/* Water gauge */}
                          {device.readings.water && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="flex items-center gap-1 text-slate-600">
                                  <Droplet className="w-3 h-3 text-sky-500" /> Nước xả/tái chế:
                                </span>
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="font-bold text-slate-800">
                                    {device.readings.water.value}{' '}
                                    <span className="text-slate-400 font-normal">
                                      / {device.readings.water.max} m³
                                    </span>
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-1 rounded ${
                                      wRatio >= 1.0
                                        ? 'text-red-700 bg-red-100 animate-pulse border border-red-200'
                                        : wRatio >= 0.8
                                        ? 'text-amber-800 bg-amber-100 border border-amber-200'
                                        : 'text-slate-500 bg-slate-100'
                                    }`}
                                  >
                                    {Math.round(wRatio * 100)}%
                                  </span>
                                </div>
                              </div>
                              <QuotaBar150
                                current={device.readings.water.value}
                                max={device.readings.water.max}
                                baseColor="bg-sky-500"
                                heightClass="h-2"
                                showScaleTicks={false}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Specs & Action to inspect device */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                        <button
                          onClick={() => {
                            setSelectedDeviceId(device.id);
                            setViewLevel('device');
                          }}
                          className="px-2.5 py-1 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Gauge className="w-3 h-3" />
                          <span>Chi tiết Telemetry ➔</span>
                        </button>

                        <button
                          onClick={() => handleRequestInspection(device.name)}
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
            );
          })()}

          {/* ============================================================== */}
          {/* LEVEL 4: DEVICE DEEP-DIVE VIEW (Telemetry detail of 1 machine) */}
          {/* ============================================================== */}
          {viewLevel === 'device' && currentDevice && (() => {
            const curDevStatus = computeQuotaStatus(
              {
                power: currentDevice.readings.power?.value || 0,
                co2: currentDevice.readings.co2?.value || 0,
                water: currentDevice.readings.water?.value || 0,
              },
              {
                power: currentDevice.readings.power?.max || 1,
                co2: currentDevice.readings.co2?.max || 1,
                water: currentDevice.readings.water?.max || 1,
              }
            );

            return (
            <div className="space-y-4">
              {/* Back button & Device Header Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setViewLevel('workshop');
                        setSelectedDeviceId(null);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                      title="Quay lại danh sách thiết bị phân xưởng"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-300">
                          {currentDevice.code}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800">
                          {currentDevice.name}
                        </h3>
                        {getStatusBadge(curDevStatus)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Trực thuộc: <strong>{currentWorkshop.name}</strong> •{' '}
                        <strong>{currentFactory.name}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRequestInspection(currentDevice.name)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Lập phiếu kiểm tra HSE</span>
                    </button>
                    <button
                      onClick={() =>
                        alert(
                          `Đã xuất file log SCADA cảm biến thiết bị ${currentDevice.code} (định dạng CSV).`
                        )
                      }
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất dữ liệu 24h</span>
                    </button>
                  </div>
                </div>

                {/* Specs and Technical Credentials */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Thông số thiết kế
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                      {currentDevice.specification}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Ngày đưa vào vận hành
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      {currentDevice.installedDate}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Bảo dưỡng gần nhất
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      {currentDevice.lastMaintenance}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Kiểm định cảm biến IoT
                    </span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Đạt chuẩn Quatest 3
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time Telemetry Big Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Power Dial */}
                {currentDevice.readings.power && (() => {
                  const pVal = currentDevice.readings.power.value;
                  const pMax = currentDevice.readings.power.max;
                  const pct = pMax > 0 ? Math.round((pVal / pMax) * 100) : 0;
                  const isOver = pct > 100;

                  return (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-500" /> Công suất Phụ tải Điện
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Định mức (100%): {pMax} kWh
                        </span>
                      </div>
                      <div className="my-4 text-center">
                        <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                          {pVal}{' '}
                          <span className="text-sm font-normal text-slate-500">kWh</span>
                        </div>
                        <span className="text-xs text-slate-500 mt-1 block">
                          Đang hoạt động ở mức{' '}
                          <strong className={isOver ? 'text-red-600 font-extrabold' : 'text-slate-800'}>
                            {pct}%
                          </strong>{' '}
                          công suất danh định{' '}
                          {isOver && (
                            <span className="text-red-600 font-bold animate-pulse">
                              (VƯỢT ĐỊNH MỨC)
                            </span>
                          )}
                        </span>
                      </div>
                      <QuotaBar150
                        current={pVal}
                        max={pMax}
                        baseColor="bg-amber-500"
                        heightClass="h-3"
                        showScaleTicks={true}
                        notchLabel="100% Định mức"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                        <span>0 kWh</span>
                        <span className="text-amber-600 font-medium">
                          Cảnh báo (80%): {Math.round(pMax * 0.8)} kWh
                        </span>
                        <span className="text-red-500 font-medium">
                          Max (150%): {Math.round(pMax * 1.5)} kWh
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* CO2 Dial */}
                {currentDevice.readings.co2 && (() => {
                  const cVal = currentDevice.readings.co2.value;
                  const cMax = currentDevice.readings.co2.max;
                  const pct = cMax > 0 ? Math.round((cVal / cMax) * 100) : 0;
                  const isOver = pct > 100;

                  return (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-red-500" /> Phát thải Khí nhà kính CO₂
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Định mức (100%): {cMax} kg
                        </span>
                      </div>
                      <div className="my-4 text-center">
                        <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                          {cVal}{' '}
                          <span className="text-sm font-normal text-slate-500">kg CO₂e</span>
                        </div>
                        <span className="text-xs text-slate-500 mt-1 block">
                          Đang hoạt động ở mức{' '}
                          <strong className={isOver ? 'text-red-600 font-extrabold' : 'text-slate-800'}>
                            {pct}%
                          </strong>{' '}
                          hạn ngạch{' '}
                          {isOver && (
                            <span className="text-red-600 font-bold animate-pulse">
                              (VƯỢT ĐỊNH MỨC)
                            </span>
                          )}
                        </span>
                      </div>
                      <QuotaBar150
                        current={cVal}
                        max={cMax}
                        baseColor="bg-orange-500"
                        heightClass="h-3"
                        showScaleTicks={true}
                        notchLabel="100% Định mức"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                        <span>0 kg</span>
                        <span className="text-amber-600 font-medium">
                          Cảnh báo (80%): {Math.round(cMax * 0.8)} kg
                        </span>
                        <span className="text-red-500 font-medium">
                          Max (150%): {Math.round(cMax * 1.5)} kg
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Water Dial */}
                {currentDevice.readings.water && (() => {
                  const wVal = currentDevice.readings.water.value;
                  const wMax = currentDevice.readings.water.max;
                  const pct = wMax > 0 ? Math.round((wVal / wMax) * 100) : 0;
                  const isOver = pct > 100;

                  return (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                          <Droplet className="w-4 h-4 text-sky-500" /> Lưu lượng Nước xả/tuần hoàn
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Định mức (100%): {wMax} m³
                        </span>
                      </div>
                      <div className="my-4 text-center">
                        <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                          {wVal}{' '}
                          <span className="text-sm font-normal text-slate-500">m³</span>
                        </div>
                        <span className="text-xs text-slate-500 mt-1 block">
                          Đang hoạt động ở mức{' '}
                          <strong className={isOver ? 'text-red-600 font-extrabold' : 'text-slate-800'}>
                            {pct}%
                          </strong>{' '}
                          công suất đường ống{' '}
                          {isOver && (
                            <span className="text-red-600 font-bold animate-pulse">
                              (VƯỢT ĐỊNH MỨC)
                            </span>
                          )}
                        </span>
                      </div>
                      <QuotaBar150
                        current={wVal}
                        max={wMax}
                        baseColor="bg-sky-500"
                        heightClass="h-3"
                        showScaleTicks={true}
                        notchLabel="100% Định mức"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                        <span>0 m³</span>
                        <span className="text-amber-600 font-medium">
                          Cảnh báo (80%): {Math.round(wMax * 0.8)} m³
                        </span>
                        <span className="text-red-500 font-medium">
                          Max (150%): {Math.round(wMax * 1.5)} m³
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Live Waveform Trend & SCADA Diagnostics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Simulated Live Waveform */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-teal-600" />
                      Đồ thị Dao động Cảm biến Thời gian thực (Live Waveform)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Chu kỳ: 3s/điểm
                    </span>
                  </div>

                  {/* SVG Waveform Line */}
                  <div className="py-4">
                    <div className="h-32 w-full flex items-end justify-between gap-1 px-2 bg-slate-50 rounded-lg border border-slate-100 relative overflow-hidden">
                      {/* Grid background lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-2 opacity-20">
                        <div className="border-b border-slate-400 w-full" />
                        <div className="border-b border-slate-400 w-full" />
                        <div className="border-b border-slate-400 w-full" />
                      </div>

                      {waveformHistory.map((val, idx) => {
                        const maxVal = currentDevice.readings.power?.max || 600;
                        const heightPct = Math.min(100, Math.max(15, (val / maxVal) * 100));
                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center gap-1 z-10"
                          >
                            <span className="text-[9px] font-mono text-slate-400 font-bold hidden sm:block">
                              {val}
                            </span>
                            <div
                              className="w-full bg-teal-500 hover:bg-teal-600 rounded-t transition-all duration-300 relative group"
                              style={{ height: `${heightPct}%` }}
                            >
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                {val} kWh
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>10 chu kỳ đo lường gần nhất</span>
                    <span className="font-mono text-teal-700 font-semibold">
                      Giá trị hiện tại: {currentDevice.readings.power?.value || 0} kWh
                    </span>
                  </div>
                </div>

                {/* SCADA / IoT Diagnostic parameters table */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-sky-600" />
                      Thông số Truyền thông & Kỹ thuật SCADA
                    </span>
                    <span className="text-[10px] text-slate-400">ISO 50001</span>
                  </div>

                  <div className="space-y-2 mt-3 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Mã Tag SCADA:</span>
                      <span className="font-mono font-bold text-slate-800">
                        VNM_BD_{currentDevice.code}_AI01
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Cảm biến đo lường:</span>
                      <span className="font-semibold text-slate-800">
                        Siemens Sentron PAC4200 (Modbus)
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Cổng Gateway IoT:</span>
                      <span className="font-mono text-slate-800">Moxa NPort 5150 (IP: 192.168.10.42)</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Hệ số công suất (Cosφ):</span>
                      <span className="font-mono font-bold text-emerald-600">0.94 (Tối ưu)</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-500">Điện áp vận hành:</span>
                      <span className="font-mono text-slate-800">380V ± 1.5% • 50.0 Hz</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
