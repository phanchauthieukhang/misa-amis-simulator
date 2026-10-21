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
  Lock,
  History,
  Clock,
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
  const [anomalyTarget, setAnomalyTarget] = useState<'closed_period' | 'current_period'>('closed_period');

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

            {/* Column 3: Anomaly Triggers (3 cols) Scaled to Role & Closed/Open Periods */}
            <div className="lg:col-span-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Kích hoạt sự cố kiểm soát:
                </span>
                <span className="text-[10px] text-amber-300/80 font-mono">
                  {role === 'bod' ? 'Bán niên' : role === 'factory_director' ? 'Quý' : 'Tháng'}
                </span>
              </div>

              {/* Target Period Selector Tabs */}
              <div className="flex bg-slate-800 p-0.5 rounded-lg text-[10.5px] border border-slate-700">
                <button
                  onClick={() => setAnomalyTarget('closed_period')}
                  className={`flex-1 py-1 rounded font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    anomalyTarget === 'closed_period'
                      ? 'bg-amber-600/90 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Sự cố phát hiện qua kiểm toán kỳ trước (Đã đóng sổ). Số liệu cộng vào quá khứ và năm, không làm tăng kỳ hiện tại."
                >
                  <Lock className="w-2.5 h-2.5" />
                  <span>Kỳ đã đóng sổ</span>
                </button>
                <button
                  onClick={() => setAnomalyTarget('current_period')}
                  className={`flex-1 py-1 rounded font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    anomalyTarget === 'current_period'
                      ? 'bg-red-600/90 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Sự cố phát sinh trong kỳ hiện tại. Làm thanh đo live vượt ngưỡng 100% bừng đỏ."
                >
                  <Radio className="w-2.5 h-2.5" />
                  <span>Kỳ hiện tại (Live)</span>
                </button>
              </div>

              {/* Explanation Note */}
              <div className="text-[9.5px] text-slate-400 leading-tight">
                {anomalyTarget === 'closed_period' ? (
                  <span className="text-amber-300/90">
                    {role === 'bod' && 'Sự cố 6T đầu năm: Cộng vào 6T đầu & Tổng năm. 6T cuối năm giữ nguyên.'}
                    {role === 'factory_director' && 'Sự cố Quý III: Cộng vào Quý III & Tổng năm. Quý IV giữ nguyên.'}
                    {role === 'workshop_lead' && 'Sự cố Tháng 9: Cộng vào Tháng 9 & Quý III. Tháng 10 giữ nguyên.'}
                  </span>
                ) : (
                  <span className="text-red-300/90">
                    {role === 'bod' && 'Sự cố 6T cuối năm: Nhảy vọt thanh đo live > 100%. 6T đầu năm giữ nguyên.'}
                    {role === 'factory_director' && 'Sự cố Quý IV: Nhảy vọt thanh đo live > 100%. Quý III giữ nguyên.'}
                    {role === 'workshop_lead' && 'Sự cố Tháng 10: Nhảy vọt thanh đo live > 100%. Tháng 9 giữ nguyên.'}
                  </span>
                )}
              </div>

              {/* Trigger Buttons */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => triggerAnomaly('power', anomalyTarget)}
                  className={`flex items-center justify-between px-2.5 py-1.5 border rounded text-[11px] transition-colors font-medium text-left cursor-pointer ${
                    anomalyTarget === 'closed_period'
                      ? 'bg-amber-950/70 hover:bg-amber-900 border-amber-700/60 text-amber-200'
                      : 'bg-red-950/70 hover:bg-red-900 border-red-700/60 text-red-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>
                      {anomalyTarget === 'closed_period'
                        ? role === 'bod'
                          ? 'Điện: +4.500 kWh (6T Đầu)'
                          : role === 'factory_director'
                          ? 'Điện: +450 kWh (Quý III)'
                          : 'Điện: +45 kWh (Tháng 9)'
                        : role === 'bod'
                        ? 'Điện: +19.000 kWh (6T Cuối)'
                        : role === 'factory_director'
                        ? 'Điện: +2.650 kWh (Quý IV)'
                        : 'Điện: +150 kWh (Tháng 10)'}
                    </span>
                  </span>
                  <span className="text-[9.5px] opacity-75 font-mono ml-1">
                    {anomalyTarget === 'closed_period' ? 'Đóng sổ' : 'Live'}
                  </span>
                </button>

                <button
                  onClick={() => triggerAnomaly('co2', anomalyTarget)}
                  className={`flex items-center justify-between px-2.5 py-1.5 border rounded text-[11px] transition-colors font-medium text-left cursor-pointer ${
                    anomalyTarget === 'closed_period'
                      ? 'bg-amber-950/70 hover:bg-amber-900 border-amber-700/60 text-amber-200'
                      : 'bg-red-950/70 hover:bg-red-900 border-red-700/60 text-red-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Flame className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span>
                      {anomalyTarget === 'closed_period'
                        ? role === 'bod'
                          ? 'CO₂: +3.200 kg (6T Đầu)'
                          : role === 'factory_director'
                          ? 'CO₂: +320 kg (Quý III)'
                          : 'CO₂: +35 kg (Tháng 9)'
                        : role === 'bod'
                        ? 'CO₂: +14.000 kg (6T Cuối)'
                        : role === 'factory_director'
                        ? 'CO₂: +1.900 kg (Quý IV)'
                        : 'CO₂: +115 kg (Tháng 10)'}
                    </span>
                  </span>
                  <span className="text-[9.5px] opacity-75 font-mono ml-1">
                    {anomalyTarget === 'closed_period' ? 'Đóng sổ' : 'Live'}
                  </span>
                </button>

                <button
                  onClick={() => triggerAnomaly('water', anomalyTarget)}
                  className={`flex items-center justify-between px-2.5 py-1.5 border rounded text-[11px] transition-colors font-medium text-left cursor-pointer ${
                    anomalyTarget === 'closed_period'
                      ? 'bg-amber-950/70 hover:bg-amber-900 border-amber-700/60 text-amber-200'
                      : 'bg-sky-950/70 hover:bg-sky-900 border-sky-700/60 text-sky-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Droplet className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span>
                      {anomalyTarget === 'closed_period'
                        ? role === 'bod'
                          ? 'Nước: +380 m³ (6T Đầu)'
                          : role === 'factory_director'
                          ? 'Nước: +35 m³ (Quý III)'
                          : 'Nước: +4 m³ (Tháng 9)'
                        : role === 'bod'
                        ? 'Nước: +1.700 m³ (6T Cuối)'
                        : role === 'factory_director'
                        ? 'Nước: +220 m³ (Quý IV)'
                        : 'Nước: +15 m³ (Tháng 10)'}
                    </span>
                  </span>
                  <span className="text-[9.5px] opacity-75 font-mono ml-1">
                    {anomalyTarget === 'closed_period' ? 'Đóng sổ' : 'Live'}
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
