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
  Radio,
  Lock,
  Volume2,
  VolumeX,
  Sun,
  CloudRain,
  AlertTriangle,
  Activity,
  Sparkles,
  CloudSun,
} from 'lucide-react';
import { PresetScenarioId, EVNTariffPeriod, WeatherCondition } from '@/context/ESGSimulationContext';

export const SimulationControlPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'rbac' | 'environment'>('scenarios');
  const [anomalyTarget, setAnomalyTarget] = useState<'closed_period' | 'current_period'>('closed_period');

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
    activeScenario,
    applyPresetScenario,
    evnTariffPeriod,
    setEvnTariffPeriod,
    weatherCondition,
    setWeatherCondition,
    isSoundEnabled,
    toggleSound,
    playAlarmBeep,
  } = useESGSimulation();

  const currentFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];

  // Helper label for active scenario
  const getScenarioLabel = (s: PresetScenarioId) => {
    switch (s) {
      case 'peak_production':
        return 'Ca sản xuất cao điểm';
      case 'eco_green':
        return 'Chế độ Eco-Green RE100';
      case 'boiler_anomaly':
        return 'Sự cố lò hơi sinh khối';
      case 'pipe_burst':
        return 'Sự cố bục ống nước CIP';
      case 'solar_peak':
        return 'Nắng đạt đỉnh (100% Solar)';
      case 'grid_brownout':
        return 'Giờ cao điểm EVN';
      default:
        return 'Chuẩn vận hành';
    }
  };

  // When collapsed, render as a compact, non-intrusive floating pill button at bottom-right
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-6 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-slate-900/95 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full shadow-2xl border border-slate-700/80 flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105 cursor-pointer ring-2 ring-teal-500/20 group"
          title="Nhấp để mở Bảng điều khiển mô phỏng & kiểm thử hiện trường"
        >
          <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Sliders className="w-3 h-3 group-hover:rotate-45 transition-transform" />
          </div>
          <span>Bảng Điều khiển Mô phỏng</span>

          {activeScenario && (
            <span className="hidden sm:inline text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full truncate max-w-[130px]">
              {getScenarioLabel(activeScenario)}
            </span>
          )}

          <span
            className={`w-2 h-2 rounded-full ${
              isLiveStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-2 pt-0 pointer-events-none animate-in slide-in-from-bottom duration-200">
      <div className="max-w-6xl mx-auto bg-slate-900/95 backdrop-blur-md text-white rounded-t-xl shadow-2xl border border-slate-700/80 pointer-events-auto transition-all duration-300 overflow-hidden">
        {/* Panel Header Toggle Bar */}
        <div className="px-4 py-2.5 bg-slate-800/95 flex items-center justify-between border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide uppercase text-teal-400">
              Bảng điều khiển mô phỏng hiện trường Vinamilk Net Zero
            </span>

            {activeScenario && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Đang kích hoạt: {getScenarioLabel(activeScenario)}
              </span>
            )}

            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-750 px-2 py-0.5 rounded-full border border-slate-650">
              <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isLiveStreaming ? 'SCADA Live' : 'Tạm dừng'}
            </span>

            <span className="hidden lg:inline text-[11px] text-slate-400 font-mono">
              {lastUpdated ? lastUpdated.toLocaleTimeString('vi-VN') : 'Đang đồng bộ...'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Audio Toggle Button */}
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                isSoundEnabled
                  ? 'bg-teal-950/70 text-teal-300 border-teal-700/70 hover:bg-teal-900'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={isSoundEnabled ? 'Còi báo SCADA: Đang BẬT (Bấm để tắt)' : 'Còi báo SCADA: Đang TẮT (Bấm để bật)'}
            >
              {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[10.5px] hidden sm:inline">{isSoundEnabled ? 'Còi: Bật' : 'Còi: Tắt'}</span>
            </button>

            {/* Quick Reset */}
            <button
              onClick={resetSimulation}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              title="Đưa các chỉ số về baseline ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[10.5px] hidden sm:inline">Reset</span>
            </button>

            {/* Collapse Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1 p-1.5 text-slate-300 hover:text-white bg-slate-750 hover:bg-slate-700 rounded-lg border border-slate-650 cursor-pointer"
              title="Thu gọn bảng điều khiển"
            >
              <span className="hidden sm:inline text-[11px]">Thu gọn</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-850/90 border-b border-slate-700/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scenarios'
                ? 'bg-teal-700 text-white shadow-xs ring-1 ring-teal-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>1. Kịch bản Vận hành Nhà máy (6 Kịch bản)</span>
            {activeScenario && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rbac'
                ? 'bg-teal-700 text-white shadow-xs ring-1 ring-teal-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>2. Phân quyền & Sự cố Kỳ Đóng sổ</span>
          </button>

          <button
            onClick={() => setActiveTab('environment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'environment'
                ? 'bg-teal-700 text-white shadow-xs ring-1 ring-teal-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. Khung giờ EVN, Thời tiết & Tần số SCADA</span>
          </button>
        </div>

        {/* Tab 1: Kịch bản Vận hành Nhà máy */}
        {activeTab === 'scenarios' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Scenario 1: Peak Production */}
            <div
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                activeScenario === 'peak_production'
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-xs'
                  : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Ca sản xuất Cao điểm</span>
                  </div>
                  <span className="text-[9.5px] bg-amber-950 text-amber-300 border border-amber-700 px-1.5 py-0.5 rounded">
                    Tải 98-105%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Dây chuyền Tiệt trùng UHT & Chiết rót Aseptic vận hành 100% công suất để kịp đơn hàng xuất khẩu.
                </p>
              </div>
              <button
                onClick={() => applyPresetScenario('peak_production')}
                className="mt-2.5 w-full py-1.5 px-2 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{activeScenario === 'peak_production' ? 'Đang chạy Ca cao điểm' : 'Kích hoạt Ca cao điểm'}</span>
              </button>
            </div>

            {/* Scenario 2: Eco-Green Optimization */}
            <div
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                activeScenario === 'eco_green'
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-xs'
                  : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Chế độ Eco-Green RE100</span>
                  </div>
                  <span className="text-[9.5px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.5 rounded">
                    Tối ưu RE100
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Tối đa hóa điện mặt trời 5.4 MWp & lò hơi sinh khối trấu ép, giảm 35% phát thải và đưa tải về mức xanh an toàn.
                </p>
              </div>
              <button
                onClick={() => applyPresetScenario('eco_green')}
                className="mt-2.5 w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{activeScenario === 'eco_green' ? 'Đang chạy Chế độ Xanh' : 'Kích hoạt Eco-Green'}</span>
              </button>
            </div>

            {/* Scenario 3: Biomass Boiler Anomaly */}
            <div
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                activeScenario === 'boiler_anomaly'
                  ? 'bg-red-950/50 border-red-500/80 shadow-xs'
                  : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-red-400">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Sự cố Lò hơi Sinh khối</span>
                  </div>
                  <span className="text-[9.5px] bg-red-950 text-red-300 border border-red-700 px-1.5 py-0.5 rounded">
                    CO₂ Vượt 138%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Buồng đốt tầng sôi lò trấu ép quá nhiệt, phát thải khói CO₂ tăng vọt tạo cảnh báo Critical cấp nhà máy.
                </p>
              </div>
              <button
                onClick={() => applyPresetScenario('boiler_anomaly')}
                className="mt-2.5 w-full py-1.5 px-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{activeScenario === 'boiler_anomaly' ? 'Đang mô phỏng Sự cố Lò hơi' : 'Mô phỏng Sự cố Lò hơi'}</span>
              </button>
            </div>

            {/* Scenario 4: CIP Water Pipe Burst */}
            <div
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                activeScenario === 'pipe_burst'
                  ? 'bg-sky-950/50 border-sky-500/80 shadow-xs'
                  : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-sky-400">
                    <Droplet className="w-3.5 h-3.5" />
                    <span>Bục Đường ống Nước CIP</span>
                  </div>
                  <span className="text-[9.5px] bg-sky-950 text-sky-300 border border-sky-700 px-1.5 py-0.5 rounded">
                    Nước Vượt 145%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Vỡ gioăng áp lực đường ống nước vệ sinh CIP tại Xưởng Chế biến, lưu lượng nước sạch nhảy vọt bừng đỏ SCADA.
                </p>
              </div>
              <button
                onClick={() => applyPresetScenario('pipe_burst')}
                className="mt-2.5 w-full py-1.5 px-2 bg-sky-700 hover:bg-sky-600 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{activeScenario === 'pipe_burst' ? 'Đang mô phỏng Bục ống CIP' : 'Mô phỏng Bục ống CIP'}</span>
              </button>
            </div>

            {/* Scenario 5: Solar Peak */}
            <div
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                activeScenario === 'solar_peak'
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-xs'
                  : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Sun className="w-3.5 h-3.5" />
                    <span>Nắng Đạt đỉnh (100% Solar)</span>
                  </div>
                  <span className="text-[9.5px] bg-amber-950 text-amber-300 border border-amber-700 px-1.5 py-0.5 rounded">
                    5.4 MWp Tối đa
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Bức xạ mặt trời cực đại giữa trưa, hệ thống điện áp mái tự sản xuất 100% điện sạch cấp toàn bộ kho thông minh AS/RS.
                </p>
              </div>
              <button
                onClick={() => applyPresetScenario('solar_peak')}
                className="mt-2.5 w-full py-1.5 px-2 bg-slate-750 hover:bg-slate-700 border border-slate-650 text-amber-300 hover:text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Kích hoạt Nắng cực đại</span>
              </button>
            </div>

            {/* Scenario 6: EVN Peak Tariff */}
            <div
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                activeScenario === 'grid_brownout'
                  ? 'bg-amber-950/50 border-amber-500/80 shadow-xs'
                  : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Giờ Cao điểm Điện lực EVN</span>
                  </div>
                  <span className="text-[9.5px] bg-amber-950 text-amber-300 border border-amber-700 px-1.5 py-0.5 rounded">
                    3.250 đ/kWh
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Lưới điện bước vào khung giờ cao điểm (3.250 đ/kWh), tự động sinh cảnh báo điều tiết chuyển sạc pin xe nâng sang ban đêm.
                </p>
              </div>
              <button
                onClick={() => applyPresetScenario('grid_brownout')}
                className="mt-2.5 w-full py-1.5 px-2 bg-slate-750 hover:bg-slate-700 border border-slate-650 text-amber-300 hover:text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Kích hoạt Cao điểm EVN</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Phân quyền & Kỳ Đóng sổ */}
        {activeTab === 'rbac' && (
          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
            {/* Column 1: Role Switcher (5 cols) */}
            <div className="lg:col-span-5 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-700/70 pb-3 lg:pb-0 lg:pr-4">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                Mô phỏng vai trò người dùng (Quyền hạn):
              </span>

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

            {/* Column 2 & 3: Anomaly Injection with Target Period Selector (7 cols) */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Kích hoạt sự cố kiểm soát định mức:
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
              <div className="text-[10px] text-slate-400 leading-tight bg-slate-850 p-2 rounded border border-slate-750">
                {anomalyTarget === 'closed_period' ? (
                  <span className="text-amber-300/90">
                    🔒 <strong>Kỳ Đã Đóng Sổ:</strong> Dữ liệu cộng dồn vào kỳ quá khứ và năm. Kỳ hiện tại giữ nguyên không bị ảnh hưởng theo chuẩn kiểm toán.
                  </span>
                ) : (
                  <span className="text-red-300/90">
                    🔴 <strong>Kỳ Hiện Tại (Live):</strong> Kích hoạt sự cố tức thời vượt 100% định mức. Thanh đo hiển thị màu đỏ cảnh báo tràn.
                  </span>
                )}
              </div>

              {/* Trigger Buttons Grid */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => triggerAnomaly('power', anomalyTarget)}
                  className={`flex flex-col justify-between p-2 border rounded-lg text-[11px] transition-colors font-medium cursor-pointer ${
                    anomalyTarget === 'closed_period'
                      ? 'bg-amber-950/70 hover:bg-amber-900 border-amber-700/60 text-amber-200'
                      : 'bg-red-950/70 hover:bg-red-900 border-red-700/60 text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-1 text-amber-400 font-bold mb-1">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>Sự cố Điện</span>
                  </div>
                  <div className="text-[9.5px] opacity-80 leading-tight">
                    {anomalyTarget === 'closed_period'
                      ? role === 'bod' ? '+4.500 kWh (6T Đầu)' : role === 'factory_director' ? '+450 kWh (Quý III)' : '+45 kWh (Tháng 9)'
                      : role === 'bod' ? '+19.000 kWh (6T Cuối)' : role === 'factory_director' ? '+2.650 kWh (Quý IV)' : '+150 kWh (Tháng 10)'}
                  </div>
                </button>

                <button
                  onClick={() => triggerAnomaly('co2', anomalyTarget)}
                  className={`flex flex-col justify-between p-2 border rounded-lg text-[11px] transition-colors font-medium cursor-pointer ${
                    anomalyTarget === 'closed_period'
                      ? 'bg-amber-950/70 hover:bg-amber-900 border-amber-700/60 text-amber-200'
                      : 'bg-red-950/70 hover:bg-red-900 border-red-700/60 text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-1 text-red-400 font-bold mb-1">
                    <Flame className="w-3.5 h-3.5 shrink-0" />
                    <span>Sự cố CO₂</span>
                  </div>
                  <div className="text-[9.5px] opacity-80 leading-tight">
                    {anomalyTarget === 'closed_period'
                      ? role === 'bod' ? '+3.200 kg (6T Đầu)' : role === 'factory_director' ? '+320 kg (Quý III)' : '+35 kg (Tháng 9)'
                      : role === 'bod' ? '+14.000 kg (6T Cuối)' : role === 'factory_director' ? '+1.900 kg (Quý IV)' : '+115 kg (Tháng 10)'}
                  </div>
                </button>

                <button
                  onClick={() => triggerAnomaly('water', anomalyTarget)}
                  className={`flex flex-col justify-between p-2 border rounded-lg text-[11px] transition-colors font-medium cursor-pointer ${
                    anomalyTarget === 'closed_period'
                      ? 'bg-amber-950/70 hover:bg-amber-900 border-amber-700/60 text-amber-200'
                      : 'bg-sky-950/70 hover:bg-sky-900 border-sky-700/60 text-sky-200'
                  }`}
                >
                  <div className="flex items-center gap-1 text-sky-400 font-bold mb-1">
                    <Droplet className="w-3.5 h-3.5 shrink-0" />
                    <span>Sự cố Nước</span>
                  </div>
                  <div className="text-[9.5px] opacity-80 leading-tight">
                    {anomalyTarget === 'closed_period'
                      ? role === 'bod' ? '+380 m³ (6T Đầu)' : role === 'factory_director' ? '+35 m³ (Quý III)' : '+4 m³ (Tháng 9)'
                      : role === 'bod' ? '+1.700 m³ (6T Cuối)' : role === 'factory_director' ? '+220 m³ (Quý IV)' : '+15 m³ (Tháng 10)'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Khung giờ EVN, Thời tiết & Tần số SCADA */}
        {activeTab === 'environment' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Group 1: Khung giờ Biểu giá EVN */}
            <div className="space-y-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Mô phỏng Khung giờ EVN 3 Giá:
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setEvnTariffPeriod('offpeak')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    evnTariffPeriod === 'offpeak'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span>🟢 Giờ Thấp điểm (22h - 04h)</span>
                    <strong className="font-mono text-emerald-400">1.180 đ</strong>
                  </div>
                  <div className="text-[9.5px] opacity-75 mt-0.5">Tải điện thấp, tối ưu cho sạc pin & kho lạnh</div>
                </button>

                <button
                  onClick={() => setEvnTariffPeriod('standard')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    evnTariffPeriod === 'standard'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span>🟡 Giờ Bình thường (Tiêu chuẩn)</span>
                    <strong className="font-mono text-amber-300">1.780 đ</strong>
                  </div>
                  <div className="text-[9.5px] opacity-75 mt-0.5">04h-09h30, 11h30-17h, 20h-22h</div>
                </button>

                <button
                  onClick={() => setEvnTariffPeriod('peak')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    evnTariffPeriod === 'peak'
                      ? 'bg-red-950/80 border-red-500 text-red-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span>🔴 Giờ Cao điểm EVN (+82%)</span>
                    <strong className="font-mono text-red-400">3.250 đ</strong>
                  </div>
                  <div className="text-[9.5px] opacity-75 mt-0.5">09h30-11h30 & 17h-20h (Cần tiết giảm phụ tải)</div>
                </button>
              </div>
            </div>

            {/* Group 2: Thời tiết & Năng lượng Mặt trời */}
            <div className="space-y-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Mô phỏng Bức xạ Solar Rooftop:
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setWeatherCondition('sunny')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    weatherCondition === 'sunny'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1">☀️ Nắng gắt (Cực đại)</span>
                    <strong className="text-amber-300">100% Solar</strong>
                  </div>
                  <div className="text-[9.5px] opacity-75 mt-0.5">Solar 5.4 MWp phát tối đa công suất</div>
                </button>

                <button
                  onClick={() => setWeatherCondition('cloudy')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    weatherCondition === 'cloudy'
                      ? 'bg-slate-750 border-teal-500 text-teal-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1"><CloudSun className="w-3.5 h-3.5" /> Nhiều mây (Vừa phải)</span>
                    <strong className="text-slate-300">60% Solar</strong>
                  </div>
                  <div className="text-[9.5px] opacity-75 mt-0.5">Bức xạ quang năng trung bình</div>
                </button>

                <button
                  onClick={() => setWeatherCondition('rainy')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    weatherCondition === 'rainy'
                      ? 'bg-sky-950/80 border-sky-500 text-sky-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5" /> Mưa bão (Suy giảm)</span>
                    <strong className="text-sky-300">15% Solar</strong>
                  </div>
                  <div className="text-[9.5px] opacity-75 mt-0.5">Cần bù điện nhận từ lưới quốc gia</div>
                </button>
              </div>
            </div>

            {/* Group 3: Live Stream SCADA Controls */}
            <div className="space-y-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-teal-400" />
                Tốc độ & Biên độ SCADA Live:
              </span>

              <button
                onClick={toggleStreaming}
                className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                  isLiveStreaming
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isLiveStreaming ? 'Tạm dừng Truyền dữ liệu' : 'Bắt đầu Truyền dữ liệu'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Tốc độ cập nhật:</span>
                  <select
                    value={streamInterval}
                    onChange={(e) => setStreamInterval(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-white outline-none cursor-pointer"
                  >
                    <option value={1500}>Nhanh (1.5s)</option>
                    <option value={3000}>Chuẩn (3.0s)</option>
                    <option value={6000}>Chậm (6.0s)</option>
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
                    <option value="medium">Vừa (±3.5%)</option>
                    <option value="high">Cao (±7%)</option>
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={playAlarmBeep}
                  className="w-full py-1.5 px-2 bg-slate-750 hover:bg-slate-700 border border-slate-650 rounded text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-[10.5px]"
                >
                  <Volume2 className="w-3 h-3 text-teal-400" />
                  <span>Thử âm thanh còi SCADA</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
