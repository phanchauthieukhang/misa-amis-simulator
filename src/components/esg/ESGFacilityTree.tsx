'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import {
  Building2,
  Factory,
  Layers,
  Cpu,
  ChevronRight,
  ChevronDown,
  Zap,
  Flame,
  Droplet,
  Lock,
} from 'lucide-react';

interface ESGFacilityTreeProps {
  onSelectDevice?: (deviceId: string) => void;
}

export const ESGFacilityTree: React.FC<ESGFacilityTreeProps> = ({ onSelectDevice }) => {
  const {
    factories,
    role,
    viewLevel,
    setViewLevel,
    selectedFactoryId,
    setSelectedFactoryId,
    selectedWorkshopId,
    setSelectedWorkshopId,
    selectedDeviceId,
    setSelectedDeviceId,
  } = useESGSimulation();

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'nm-vnm-bd': true,
    'px-che-bien': true,
  });

  const toggleNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusDot = (status: 'normal' | 'warning' | 'danger') => {
    if (status === 'danger') {
      return <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" title="Vượt định mức" />;
    }
    if (status === 'warning') {
      return <span className="w-2 h-2 rounded-full bg-amber-500" title="Cận định mức" />;
    }
    return <span className="w-2 h-2 rounded-full bg-emerald-500" title="Bình thường" />;
  };

  const getFactoryStatus = (f: typeof factories[0]): 'normal' | 'warning' | 'danger' => {
    const p = f.totals.powerKWh / 5000;
    const c = f.totals.co2Kg / 3500;
    const w = f.totals.waterM3 / 400;
    const max = Math.max(p, c, w);
    if (max >= 1.0) return 'danger';
    if (max >= 0.8) return 'warning';
    return 'normal';
  };

  const getWorkshopStatus = (w: typeof factories[0]['workshops'][0]): 'normal' | 'warning' | 'danger' => {
    const p = w.totals.powerKWh / 2500;
    const c = w.totals.co2Kg / 1800;
    const wRatio = w.totals.waterM3 / 250;
    const max = Math.max(p, c, wRatio);
    if (max >= 1.0) return 'danger';
    if (max >= 0.8) return 'warning';
    return 'normal';
  };

  const getDeviceStatus = (d: typeof factories[0]['workshops'][0]['devices'][0]): 'normal' | 'warning' | 'danger' => {
    const p = d.readings.power ? d.readings.power.value / d.readings.power.max : 0;
    const c = d.readings.co2 ? d.readings.co2.value / d.readings.co2.max : 0;
    const w = d.readings.water ? d.readings.water.value / d.readings.water.max : 0;
    const max = Math.max(p, c, w);
    if (max >= 1.0) return 'danger';
    if (max >= 0.8) return 'warning';
    return 'normal';
  };

  // Determine allowed factories based on role
  const visibleFactories =
    role === 'bod'
      ? factories
      : factories.filter((f) => f.id === selectedFactoryId);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs text-xs overflow-y-auto max-h-[640px]">
      <div className="pb-2.5 mb-2 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Building2 className="w-4 h-4 text-teal-600" />
          <span>Cây phân cấp cơ sở Vinamilk</span>
        </div>
        {role !== 'bod' && (
          <span className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
            <Lock className="w-2.5 h-2.5" /> Giới hạn quyền
          </span>
        )}
      </div>

      {/* Root Node: Vinamilk (Enterprise Level) */}
      <div className="space-y-1">
        <div
          onClick={() => {
            setViewLevel('enterprise');
            setSelectedDeviceId(null);
          }}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
            viewLevel === 'enterprise'
              ? 'bg-teal-50 text-teal-900 font-bold border border-teal-300 shadow-2xs'
              : 'hover:bg-slate-100 text-slate-800 font-semibold'
          }`}
          title="Xem thông số tổng quan toàn Tập đoàn Vinamilk (3 Nhà máy)"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 flex-shrink-0" />
            <span className="truncate">Tập đoàn Vinamilk (Doanh nghiệp)</span>
          </div>
          <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0">
            {factories.length} Nhà máy
          </span>
        </div>

        {/* Level 1: Factories */}
        <div className="pl-3 space-y-1 mt-1 border-l-2 border-slate-200 ml-2">
          {visibleFactories.map((factory) => {
            const isFactExpanded = !!expandedNodes[factory.id];
            const isFactActive = selectedFactoryId === factory.id && viewLevel === 'factory';
            const isFactInPath = selectedFactoryId === factory.id && viewLevel !== 'enterprise';

            return (
              <div key={factory.id} className="space-y-1">
                <div
                  onClick={() => {
                    setSelectedFactoryId(factory.id);
                    setViewLevel('factory');
                    setSelectedDeviceId(null);
                    if (!expandedNodes[factory.id]) {
                      setExpandedNodes((prev) => ({ ...prev, [factory.id]: true }));
                    }
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                    isFactActive
                      ? 'bg-teal-50 text-teal-900 font-bold border border-teal-300 shadow-2xs'
                      : isFactInPath
                      ? 'bg-slate-50 text-teal-800 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                  title={`Xem phân xưởng của ${factory.name}`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <button
                      onClick={(e) => toggleNode(factory.id, e)}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-500"
                    >
                      {isFactExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <Factory className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span className="truncate">{factory.name}</span>
                  </div>
                  {getStatusDot(getFactoryStatus(factory))}
                </div>

                {/* Level 2: Workshops */}
                {isFactExpanded && (
                  <div className="pl-4 space-y-1 border-l-2 border-slate-100 ml-3">
                    {factory.workshops
                      .filter((w) => (role === 'workshop_lead' ? w.id === selectedWorkshopId : true))
                      .map((workshop) => {
                        const isWsExpanded = !!expandedNodes[workshop.id];
                        const isWsActive =
                          selectedWorkshopId === workshop.id &&
                          selectedFactoryId === factory.id &&
                          viewLevel === 'workshop';
                        const isWsInPath =
                          selectedWorkshopId === workshop.id &&
                          selectedFactoryId === factory.id &&
                          viewLevel === 'device';

                        return (
                          <div key={workshop.id} className="space-y-1">
                            <div
                              onClick={() => {
                                setSelectedFactoryId(factory.id);
                                setSelectedWorkshopId(workshop.id);
                                setViewLevel('workshop');
                                setSelectedDeviceId(null);
                                if (!expandedNodes[workshop.id]) {
                                  setExpandedNodes((prev) => ({ ...prev, [workshop.id]: true }));
                                }
                              }}
                              className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer transition-colors ${
                                isWsActive
                                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300 shadow-2xs'
                                  : isWsInPath
                                  ? 'bg-slate-50 text-emerald-800 font-semibold'
                                  : 'hover:bg-slate-50 text-slate-600'
                              }`}
                              title={`Xem thiết bị trong ${workshop.name}`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {role !== 'factory_director' && (
                                  <button
                                    onClick={(e) => toggleNode(workshop.id, e)}
                                    className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
                                  >
                                    {isWsExpanded ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                                <Layers className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                <span className="truncate">{workshop.name}</span>
                              </div>
                              {getStatusDot(getWorkshopStatus(workshop))}
                            </div>

                            {/* Level 3: Devices (Shown for workshop lead or when expanded) */}
                            {isWsExpanded && role !== 'factory_director' && (
                              <div className="pl-4 space-y-0.5 border-l border-slate-100 ml-2">
                                {workshop.devices.map((device) => {
                                  const isDevActive =
                                    selectedDeviceId === device.id && viewLevel === 'device';
                                  return (
                                    <div
                                      key={device.id}
                                      onClick={() => {
                                        setSelectedFactoryId(factory.id);
                                        setSelectedWorkshopId(workshop.id);
                                        setSelectedDeviceId(device.id);
                                        setViewLevel('device');
                                        if (onSelectDevice) onSelectDevice(device.id);
                                      }}
                                      className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                                        isDevActive
                                          ? 'bg-sky-50 text-sky-900 font-bold border border-sky-300 shadow-2xs'
                                          : 'hover:bg-slate-50 text-slate-600'
                                      }`}
                                      title={`Xem telemetry thời gian thực: ${device.name}`}
                                    >
                                      <div className="flex items-center gap-1.5 truncate">
                                        <Cpu className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                        <span className="truncate max-w-[160px]">{device.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {device.metrics.includes('power') && (
                                          <Zap className="w-2.5 h-2.5 text-amber-500" />
                                        )}
                                        {device.metrics.includes('co2') && (
                                          <Flame className="w-2.5 h-2.5 text-red-500" />
                                        )}
                                        {device.metrics.includes('water') && (
                                          <Droplet className="w-2.5 h-2.5 text-sky-500" />
                                        )}
                                        {getStatusDot(getDeviceStatus(device))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
