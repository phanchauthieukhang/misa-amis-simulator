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

      {/* Root Node: Vinamilk */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 px-2 py-1.5 bg-slate-50 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span>Tập đoàn Vinamilk (Doanh nghiệp)</span>
        </div>

        {/* Level 1: Factories */}
        <div className="pl-3 space-y-1 mt-1 border-l-2 border-slate-200 ml-2">
          {visibleFactories.map((factory) => {
            const isFactExpanded = !!expandedNodes[factory.id];
            const isFactSelected = selectedFactoryId === factory.id;

            return (
              <div key={factory.id} className="space-y-1">
                <div
                  onClick={() => {
                    setSelectedFactoryId(factory.id);
                    if (factory.workshops.length > 0) {
                      setSelectedWorkshopId(factory.workshops[0].id);
                    }
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                    isFactSelected
                      ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
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
                  {getStatusDot(factory.status)}
                </div>

                {/* Level 2: Workshops */}
                {isFactExpanded && (
                  <div className="pl-4 space-y-1 border-l-2 border-slate-100 ml-3">
                    {factory.workshops
                      .filter((w) => (role === 'workshop_lead' ? w.id === selectedWorkshopId : true))
                      .map((workshop) => {
                        const isWsExpanded = !!expandedNodes[workshop.id];
                        const isWsSelected = selectedWorkshopId === workshop.id && selectedFactoryId === factory.id;

                        return (
                          <div key={workshop.id} className="space-y-1">
                            <div
                              onClick={() => {
                                setSelectedFactoryId(factory.id);
                                setSelectedWorkshopId(workshop.id);
                              }}
                              className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer transition-colors ${
                                isWsSelected
                                  ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                                  : 'hover:bg-slate-50 text-slate-600'
                              }`}
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
                              {getStatusDot(workshop.status)}
                            </div>

                            {/* Level 3: Devices (Shown for workshop lead or when expanded) */}
                            {isWsExpanded && role !== 'factory_director' && (
                              <div className="pl-4 space-y-0.5 border-l border-slate-100 ml-2">
                                {workshop.devices.map((device) => {
                                  const isDevSelected = selectedDeviceId === device.id;
                                  return (
                                    <div
                                      key={device.id}
                                      onClick={() => {
                                        setSelectedDeviceId(device.id);
                                        if (onSelectDevice) onSelectDevice(device.id);
                                      }}
                                      className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                                        isDevSelected
                                          ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200'
                                          : 'hover:bg-slate-50 text-slate-600'
                                      }`}
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
                                        {getStatusDot(device.status)}
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
