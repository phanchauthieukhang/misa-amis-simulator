'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import {
  Sliders,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Flame,
  Droplet,
  UserCheck,
  Building,
  Factory,
  Radio,
} from 'lucide-react';
import { UserRole } from '@/types/esg';

export const SimulationControlPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const {
    role,
    setRole,
    currentRoleConfig,
    selectedFactoryId,
    setSelectedFactoryId,
    selectedWorkshopId,
    setSelectedWorkshopId,
    factories,
    isLiveStreaming,
    toggleStreaming,
    streamInterval,
    setStreamInterval,
    fluctuationLevel,
    setFluctuationLevel,
    triggerAnomaly,
    resetSimulation,
    lastUpdated,
  } = useESGSimulation();

  const currentFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-2 pt-0 pointer-events-none">
      <div className="max-w-6xl mx-auto bg-slate-900/95 backdrop-blur-md text-white rounded-t-xl shadow-2xl border border-slate-700/80 pointer-events-auto transition-all duration-300 overflow-hidden">
        {/* Panel Header Toggle Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2.5 bg-slate-800/90 flex items-center justify-between cursor-pointer hover:bg-slate-750 transition-colors border-b border-slate-700/60"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide uppercase text-teal-400">
              Bảng điều khiển mô phỏng & Kiểm thử phân quyền Vinamilk
            </span>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-700/60 px-2 py-0.5 rounded-full border border-slate-600">
              <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isLiveStreaming ? 'Dữ liệu live: Đang phát' : 'Dữ liệu live: Tạm dừng'}
            </span>

            <span className="hidden md:inline text-[11px] text-slate-400">
              Cập nhật lần cuối: {lastUpdated ? lastUpdated.toLocaleTimeString('vi-VN') : 'Đang đồng bộ...'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline text-[11px] text-slate-300">
              {isExpanded ? 'Thu gọn điều khiển' : 'Mở rộng điều khiển'}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-300" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-300" />
            )}
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
            {/* Column 1: Role Switcher (5 cols) */}
            <div className="lg:col-span-5 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-700/70 pb-3 lg:pb-0 lg:pr-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                  Mô phỏng vai trò người dùng (Quyền hạn):
                </span>
              </div>

              {/* 3 Role buttons with threshold & period hints */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setRole('bod')}
                  className={`px-2 py-2 rounded-lg text-left transition-all border cursor-pointer ${
                    role === 'bod'
                      ? 'bg-teal-700/80 border-teal-400 text-white font-bold shadow-xs ring-1 ring-teal-400/50'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold">1. Ban Giám đốc</div>
                  <div className="text-[9.5px] opacity-80 mt-0.5 truncate">&gt; 50.000 kW</div>
                  <div className="text-[9px] text-amber-300/80 font-mono">6T / Năm</div>
                </button>

                <button
                  onClick={() => setRole('factory_director')}
                  className={`px-2 py-2 rounded-lg text-left transition-all border cursor-pointer ${
                    role === 'factory_director'
                      ? 'bg-teal-700/80 border-teal-400 text-white font-bold shadow-xs ring-1 ring-teal-400/50'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold">2. Quản đốc NM</div>
                  <div className="text-[9.5px] opacity-80 mt-0.5 truncate">&gt; 5.000 kW</div>
                  <div className="text-[9px] text-amber-300/80 font-mono">Theo Quý</div>
                </button>

                <button
                  onClick={() => setRole('workshop_lead')}
                  className={`px-2 py-2 rounded-lg text-left transition-all border cursor-pointer ${
                    role === 'workshop_lead'
                      ? 'bg-teal-700/80 border-teal-400 text-white font-bold shadow-xs ring-1 ring-teal-400/50'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold">3. Trưởng bộ phận</div>
                  <div className="text-[9.5px] opacity-80 mt-0.5 truncate">&gt; 500 kW</div>
                  <div className="text-[9px] text-amber-300/80 font-mono">Theo Tháng</div>
                </button>
              </div>

              {/* Scope Detail Indicator */}
              <div className="bg-slate-850 p-2.5 rounded-md border border-slate-750 flex flex-col gap-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phạm vi giám sát:</span>
                  <span className="font-semibold text-teal-300 truncate max-w-[240px]">
                    {role === 'bod' && 'Toàn hệ thống Vinamilk (3 Nhà máy)'}
                    {role === 'factory_director' && `Nhà máy: ${currentFactory.name}`}
                    {role === 'workshop_lead' && `Phân xưởng: ${currentFactory.workshops[0].name}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-400">Định mức & Chu kỳ:</span>
                  <span className="text-amber-300 font-mono font-medium">
                    &gt; {currentRoleConfig.thresholds.powerDanger.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.powerUnit} • {currentRoleConfig.evalPeriodLabel}
                  </span>
                </div>
              </div>

              {/* Factory / Workshop Dropdowns for testing different scopes */}
              {role !== 'bod' && (
                <div className="flex gap-2 pt-1">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Chọn Nhà máy thử nghiệm:</label>
                    <select
                      value={selectedFactoryId}
                      onChange={(e) => {
                        setSelectedFactoryId(e.target.value);
                        const f = factories.find((item) => item.id === e.target.value);
                        if (f && f.workshops.length > 0) {
                          setSelectedWorkshopId(f.workshops[0].id);
                        }
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-white outline-none"
                    >
                      {factories.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {role === 'workshop_lead' && (
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Chọn Phân xưởng:</label>
                      <select
                        value={selectedWorkshopId}
                        onChange={(e) => setSelectedWorkshopId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-white outline-none"
                      >
                        {currentFactory.workshops.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Column 2: Live Stream Controls (4 cols) */}
            <div className="lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-700/70 pb-3 lg:pb-0 lg:pr-4">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-teal-400" />
                Dữ liệu giả lập thời gian thực:
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleStreaming}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                    isLiveStreaming
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isLiveStreaming ? 'Tạm dừng Live' : 'Bắt đầu Live'}</span>
                </button>

                <button
                  onClick={resetSimulation}
                  className="flex items-center justify-center gap-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Đưa các chỉ số về baseline ban đầu"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Tốc độ cập nhật:</span>
                  <select
                    value={streamInterval}
                    onChange={(e) => setStreamInterval(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-white outline-none cursor-pointer"
                  >
                    <option value={1500}>Nhanh (1.5 giây)</option>
                    <option value={3000}>Tiêu chuẩn (3 giây)</option>
                    <option value={6000}>Chậm (6 giây)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Biên độ dao động:</span>
                  <select
                    value={fluctuationLevel}
                    onChange={(e) => setFluctuationLevel(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-white outline-none cursor-pointer"
                  >
                    <option value="low">Thấp (±1.5%)</option>
                    <option value="medium">Trung bình (±3.5%)</option>
                    <option value="high">Cao (±7%)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Column 3: Anomaly Triggers (3 cols) Scaled to Role */}
            <div className="lg:col-span-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Kích hoạt sự cố theo cấp:
                </span>
                <span className="text-[10px] text-amber-300/80 font-mono">
                  {role === 'bod' ? '6T / Năm' : role === 'factory_director' ? 'Quý' : 'Tháng'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => triggerAnomaly('power')}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 rounded text-amber-200 text-[11px] transition-colors font-medium text-left cursor-pointer"
                  title={`Kích hoạt sự cố điện vượt ngưỡng ${currentRoleConfig.thresholds.powerDanger.toLocaleString('vi-VN')} ${currentRoleConfig.thresholds.powerUnit}`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>
                      {role === 'bod'
                        ? 'Điện: +54.000 kW (108%)'
                        : role === 'factory_director'
                        ? 'Điện: +5.400 kW (108%)'
                        : 'Điện: +545 kW (109%)'}
                    </span>
                  </span>
                  <span className="text-[9.5px] opacity-75 font-mono ml-1">
                    {role === 'bod' ? '6T' : role === 'factory_director' ? 'Quý' : 'Tháng'}
                  </span>
                </button>

                <button
                  onClick={() => triggerAnomaly('co2')}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-red-950/70 hover:bg-red-900 border border-red-700/60 rounded text-red-200 text-[11px] transition-colors font-medium text-left cursor-pointer"
                  title={`Kích hoạt sự cố CO2 vượt hạn ngạch ${currentRoleConfig.thresholds.co2Danger.toLocaleString('vi-VN')} ${currentRoleConfig.thresholds.co2Unit}`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Flame className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span>
                      {role === 'bod'
                        ? 'CO₂: +38.000 kg (108%)'
                        : role === 'factory_director'
                        ? 'CO₂: +3.800 kg (108%)'
                        : 'CO₂: +380 kg (108%)'}
                    </span>
                  </span>
                  <span className="text-[9.5px] opacity-75 font-mono ml-1">
                    {role === 'bod' ? 'Năm' : role === 'factory_director' ? 'Quý' : 'Tháng'}
                  </span>
                </button>

                <button
                  onClick={() => triggerAnomaly('water')}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-sky-950/70 hover:bg-sky-900 border border-sky-700/60 rounded text-sky-200 text-[11px] transition-colors font-medium text-left cursor-pointer"
                  title={`Kích hoạt sự cố nước thải vượt định mức ${currentRoleConfig.thresholds.waterDanger.toLocaleString('vi-VN')} ${currentRoleConfig.thresholds.waterUnit}`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Droplet className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span>
                      {role === 'bod'
                        ? 'Nước: +4.300 m³ (107%)'
                        : role === 'factory_director'
                        ? 'Nước: +430 m³ (107%)'
                        : 'Nước: +45 m³ (112%)'}
                    </span>
                  </span>
                  <span className="text-[9.5px] opacity-75 font-mono ml-1">
                    {role === 'bod' ? '6T' : role === 'factory_director' ? 'Quý' : 'Tháng'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
