'use client';

import React, { useState, useEffect } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import {
  Building2,
  Factory,
  Layers,
  Cpu,
  Plus,
  Search,
  Filter,
  Zap,
  Flame,
  Droplet,
  CheckCircle2,
  X,
  ShieldCheck,
  Calendar,
  Wrench,
  Clock,
  ArrowRight,
  Lock,
  FileText,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { MetricType, DeviceItem, WorkshopItem, FactoryItem } from '@/types/esg';

export const ESGFacilitiesView: React.FC = () => {
  const {
    factories,
    role,
    selectedFactoryId,
    setSelectedFactoryId,
    selectedWorkshopId,
    setSelectedWorkshopId,
    currentRoleConfig,
    navigateTo,
  } = useESGSimulation();

  // Active view tab (tailored by role)
  // BOD can toggle: 'factories' | 'workshops' | 'devices'
  // Factory Director can toggle: 'workshops' | 'devices'
  // Workshop Lead only views: 'devices' (dedicated workshop view)
  const [activeTab, setActiveTab] = useState<'factories' | 'workshops' | 'devices'>('devices');

  useEffect(() => {
    if (role === 'bod') {
      setActiveTab('factories');
    } else if (role === 'factory_director') {
      setActiveTab('workshops');
    } else {
      setActiveTab('devices');
    }
  }, [role]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMetric, setFilterMetric] = useState<'all' | MetricType>('all');
  const [filterWorkshopId, setFilterWorkshopId] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDeviceProfile, setSelectedDeviceProfile] = useState<
    (DeviceItem & { workshopName: string; factoryName: string }) | null
  >(null);

  // Form state for New Device
  const [newDevName, setNewDevName] = useState('');
  const [newDevCode, setNewDevCode] = useState('');
  const [newDevSpec, setNewDevSpec] = useState('');
  const [newDevInstallDate, setNewDevInstallDate] = useState('21/10/2026');
  const [newDevMaintenanceCycle, setNewDevMaintenanceCycle] = useState('Định kỳ 6 tháng/lần');
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['power']);

  // Role Scope Resolution
  const currentFactory =
    factories.find((f) => f.id === selectedFactoryId) || factories[0];
  const currentWorkshop =
    currentFactory.workshops.find((w) => w.id === selectedWorkshopId) ||
    currentFactory.workshops[0];

  // =========================================================================
  // 1. FACTORIES LIST (Only for BOD)
  // =========================================================================
  const filteredFactories = factories.filter((f) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.name.toLowerCase().includes(term) ||
      f.code.toLowerCase().includes(term) ||
      f.director.toLowerCase().includes(term) ||
      f.location.toLowerCase().includes(term)
    );
  });

  // =========================================================================
  // 2. WORKSHOPS LIST (For BOD and Factory Director)
  // =========================================================================
  const scopedWorkshops: (WorkshopItem & { factoryName: string; factoryCode: string })[] = [];
  const factoryPoolForWorkshops =
    role === 'bod'
      ? factories
      : factories.filter((f) => f.id === selectedFactoryId);

  factoryPoolForWorkshops.forEach((f) => {
    f.workshops.forEach((w) => {
      scopedWorkshops.push({
        ...w,
        factoryName: f.name,
        factoryCode: f.code,
      });
    });
  });

  const filteredWorkshops = scopedWorkshops.filter((w) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      w.name.toLowerCase().includes(term) ||
      w.code.toLowerCase().includes(term) ||
      w.manager.toLowerCase().includes(term) ||
      w.factoryName.toLowerCase().includes(term)
    );
  });

  // =========================================================================
  // 3. DEVICES LIST (Scoped strictly according to user role)
  // =========================================================================
  const scopedDevices: (DeviceItem & { workshopName: string; factoryName: string })[] = [];

  if (role === 'workshop_lead') {
    // Only devices of current workshop
    currentWorkshop.devices.forEach((d) => {
      scopedDevices.push({
        ...d,
        workshopName: currentWorkshop.name,
        factoryName: currentFactory.name,
      });
    });
  } else if (role === 'factory_director') {
    // Only devices within current factory
    currentFactory.workshops.forEach((w) => {
      if (filterWorkshopId !== 'all' && w.id !== filterWorkshopId) return;
      w.devices.forEach((d) => {
        scopedDevices.push({
          ...d,
          workshopName: w.name,
          factoryName: currentFactory.name,
        });
      });
    });
  } else {
    // BOD sees all devices across the enterprise
    factories.forEach((f) => {
      if (selectedFactoryId && selectedFactoryId !== 'all' && f.id !== selectedFactoryId) return;
      f.workshops.forEach((w) => {
        if (filterWorkshopId !== 'all' && w.id !== filterWorkshopId) return;
        w.devices.forEach((d) => {
          scopedDevices.push({
            ...d,
            workshopName: w.name,
            factoryName: f.name,
          });
        });
      });
    });
  }

  const filteredDevices = scopedDevices.filter((d) => {
    if (filterMetric !== 'all' && !d.metrics.includes(filterMetric)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        d.name.toLowerCase().includes(term) ||
        d.code.toLowerCase().includes(term) ||
        d.workshopName.toLowerCase().includes(term) ||
        d.specification.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  const toggleMetricSelection = (m: MetricType) => {
    setSelectedMetrics((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  const handleCreateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevName) {
      alert('Vui lòng nhập tên thiết bị');
      return;
    }
    const targetWsName =
      role === 'workshop_lead' ? currentWorkshop.name : currentFactory.workshops[0].name;
    alert(
      `Đã thêm thiết bị mới: "${newDevName}" (${newDevCode || 'Tự sinh mã'}) vào hồ sơ phân xưởng ${targetWsName}.`
    );
    setIsAddModalOpen(false);
    setNewDevName('');
    setNewDevCode('');
    setNewDevSpec('');
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Header and Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">
                Hồ sơ Danh mục Cơ sở sản xuất & Thiết bị kỹ thuật
              </h2>
              {role === 'bod' && (
                <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                  CẤP TẬP ĐOÀN (TOÀN QUYỀN)
                </span>
              )}
              {role === 'factory_director' && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> PHẠM VI NHÀ MÁY
                </span>
              )}
              {role === 'workshop_lead' && (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> PHẠM VI PHÂN XƯỞNG
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {role === 'bod' &&
                'Quản lý hồ sơ cơ sở hạ tầng 3 Nhà máy, 7 Phân xưởng và 28 Thiết bị SCADA toàn hệ thống Vinamilk.'}
              {role === 'factory_director' &&
                `Quản lý phân xưởng & tài sản máy móc trực thuộc ${currentFactory.name} (Giám đốc: ${currentFactory.director}).`}
              {role === 'workshop_lead' &&
                `Quản lý hồ sơ vận hành máy móc trực thuộc ${currentWorkshop.name} (Quản đốc: ${currentWorkshop.manager}).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thiết bị mới</span>
          </button>
        </div>
      </div>

      {/* Role-tailored Tabs & Filters Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navigation Tabs based on Role */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          {role === 'bod' && (
            <button
              onClick={() => setActiveTab('factories')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'factories'
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Cơ sở / Nhà máy ({factories.length})</span>
            </button>
          )}

          {(role === 'bod' || role === 'factory_director') && (
            <button
              onClick={() => setActiveTab('workshops')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'workshops'
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                Phân xưởng sản xuất (
                {role === 'bod' ? scopedWorkshops.length : currentFactory.workshops.length})
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('devices')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'devices'
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>
              {role === 'workshop_lead'
                ? `Thiết bị trong ${currentWorkshop.name} (${scopedDevices.length})`
                : `Thiết bị & Cảm biến (${scopedDevices.length})`}
            </span>
          </button>
        </div>

        {/* Dynamic Filters depending on active tab & role */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Workshop filter for Factory Director or BOD when viewing devices */}
          {activeTab === 'devices' && role === 'factory_director' && (
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Phân xưởng:</span>
              <select
                value={filterWorkshopId}
                onChange={(e) => setFilterWorkshopId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-800 outline-none focus:border-teal-500"
              >
                <option value="all">Tất cả phân xưởng</option>
                {currentFactory.workshops.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Factory & Workshop filters for BOD when viewing devices */}
          {activeTab === 'devices' && role === 'bod' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-medium">Nhà máy:</span>
                <select
                  value={selectedFactoryId}
                  onChange={(e) => {
                    setSelectedFactoryId(e.target.value);
                    setFilterWorkshopId('all');
                  }}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-800 outline-none focus:border-teal-500"
                >
                  <option value="all">Tất cả nhà máy</option>
                  {factories.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedFactoryId !== 'all' && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-medium">PX:</span>
                  <select
                    value={filterWorkshopId}
                    onChange={(e) => setFilterWorkshopId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 max-w-[140px]"
                  >
                    <option value="all">Tất cả PX</option>
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

          {/* Metric tag filter for devices */}
          {activeTab === 'devices' && (
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterMetric('all')}
                className={`px-2 py-1 rounded transition-colors ${
                  filterMetric === 'all'
                    ? 'bg-white text-slate-800 font-semibold shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterMetric('power')}
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  filterMetric === 'power'
                    ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                <Zap className="w-3 h-3" /> Điện
              </button>
              <button
                onClick={() => setFilterMetric('co2')}
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  filterMetric === 'co2'
                    ? 'bg-red-500 text-white font-semibold shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                <Flame className="w-3 h-3" /> CO₂
              </button>
              <button
                onClick={() => setFilterMetric('water')}
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  filterMetric === 'water'
                    ? 'bg-sky-500 text-white font-semibold shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                <Droplet className="w-3 h-3" /> Nước
              </button>
            </div>
          )}

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={
                activeTab === 'factories'
                  ? 'Tìm theo tên nhà máy, giám đốc...'
                  : activeTab === 'workshops'
                  ? 'Tìm theo tên phân xưởng, quản đốc...'
                  : 'Tìm tên thiết bị, mã máy móc...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-teal-500 w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* VIEW 1: FACTORIES DIRECTORY (Accessible by BOD)                     */}
      {/* =================================================================== */}
      {activeTab === 'factories' && role === 'bod' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Mã đơn vị</th>
                  <th className="py-2.5 px-3">Tên Nhà máy sản xuất</th>
                  <th className="py-2.5 px-3">Giám đốc điều hành</th>
                  <th className="py-2.5 px-3">Địa điểm / Khu công nghiệp</th>
                  <th className="py-2.5 px-3 text-center">Số phân xưởng</th>
                  <th className="py-2.5 px-3 text-center">Thiết bị SCADA</th>
                  <th className="py-2.5 px-3">Tiêu chuẩn tuân thủ</th>
                  <th className="py-2.5 px-3 text-center">Tình trạng</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFactories.map((factory) => {
                  const devCount = factory.workshops.reduce(
                    (acc, ws) => acc + ws.devices.length,
                    0
                  );
                  return (
                    <tr key={factory.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-teal-700">
                        {factory.code}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{factory.name}</div>
                        <span className="text-[11px] text-slate-400">
                          Thành lập theo chuẩn Vinamilk Green Farm / Net Zero
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {factory.director}
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-[240px] truncate" title={factory.location}>
                        {factory.location}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {factory.workshops.length} Phân xưởng
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-teal-700">
                        {devCount} Thiết bị
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                            ISO 50001
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                            ISO 14001
                          </span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                            QCVN 40
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Hoạt động 100%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedFactoryId(factory.id);
                            setActiveTab('workshops');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <span>Xem Phân xưởng</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị <strong>{filteredFactories.length}</strong> / <strong>{factories.length}</strong> Nhà máy thành viên
            </span>
            <span className="text-teal-700 font-semibold">Tập đoàn Vinamilk (Doanh nghiệp)</span>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 2: WORKSHOPS DIRECTORY (BOD and Factory Director)              */}
      {/* =================================================================== */}
      {activeTab === 'workshops' && (role === 'bod' || role === 'factory_director') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Mã phân xưởng</th>
                  <th className="py-2.5 px-3">Tên Phân xưởng sản xuất</th>
                  <th className="py-2.5 px-3">Nhà máy trực thuộc</th>
                  <th className="py-2.5 px-3">Quản đốc phân xưởng</th>
                  <th className="py-2.5 px-3 text-center">Số lượng thiết bị</th>
                  <th className="py-2.5 px-3">Dây chuyền & Công nghệ chính</th>
                  <th className="py-2.5 px-3 text-center">Tình trạng</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredWorkshops.map((workshop) => (
                  <tr key={workshop.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {workshop.code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{workshop.name}</div>
                      <span className="text-[11px] text-slate-400">
                        Vận hành liên tục 3 ca sản xuất
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{workshop.factoryName}</div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {workshop.factoryCode}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {workshop.manager}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                      {workshop.devices.length} Thiết bị
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div className="flex flex-wrap gap-1 max-w-[260px]">
                        {workshop.devices.slice(0, 2).map((d) => (
                          <span
                            key={d.id}
                            className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[120px]"
                            title={d.name}
                          >
                            {d.name}
                          </span>
                        ))}
                        {workshop.devices.length > 2 && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">
                            +{workshop.devices.length - 2} máy khác
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Đang sản xuất
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedFactoryId(workshop.factoryId);
                          setSelectedWorkshopId(workshop.id);
                          setFilterWorkshopId(workshop.id);
                          setActiveTab('devices');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors inline-flex items-center gap-1"
                      >
                        <span>Danh sách thiết bị</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị <strong>{filteredWorkshops.length}</strong> / <strong>{scopedWorkshops.length}</strong> Phân xưởng sản xuất
            </span>
            <span className="text-emerald-700 font-semibold">
              {role === 'factory_director' ? currentFactory.name : 'Toàn tập đoàn Vinamilk'}
            </span>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 3: DEVICES & ASSETS DIRECTORY (Scoped strictly by role)        */}
      {/* =================================================================== */}
      {activeTab === 'devices' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Mã tài sản</th>
                  <th className="py-2.5 px-3">Tên thiết bị & Thông số chế tạo</th>
                  <th className="py-2.5 px-3">Đơn vị quản lý trực tiếp</th>
                  <th className="py-2.5 px-3">Cảm biến IoT kết nối SCADA</th>
                  <th className="py-2.5 px-3">Ngày vận hành</th>
                  <th className="py-2.5 px-3">Bảo dưỡng gần nhất</th>
                  <th className="py-2.5 px-3 text-center">Tình trạng kỹ thuật</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDevices.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Asset Code */}
                    <td className="py-3 px-3 font-mono font-bold text-teal-700">
                      {dev.code}
                    </td>

                    {/* Name & Specification */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{dev.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[280px]" title={dev.specification}>
                        {dev.specification}
                      </div>
                    </td>

                    {/* Facility & Workshop Assignment */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{dev.workshopName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {dev.factoryName}
                      </div>
                    </td>

                    {/* Connected IoT Sensors */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {dev.metrics.includes('power') && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded">
                            <Zap className="w-3 h-3 text-amber-500" /> Cảm biến Điện
                          </span>
                        )}
                        {dev.metrics.includes('co2') && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold bg-red-50 text-red-800 border border-red-200/80 px-2 py-0.5 rounded">
                            <Flame className="w-3 h-3 text-red-500" /> Cảm biến CO₂
                          </span>
                        )}
                        {dev.metrics.includes('water') && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold bg-sky-50 text-sky-800 border border-sky-200/80 px-2 py-0.5 rounded">
                            <Droplet className="w-3 h-3 text-sky-500" /> Cảm biến Nước
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Installed Date */}
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {dev.installedDate}
                    </td>

                    {/* Last Maintenance & Cycle */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-[11px] text-slate-800 font-medium">
                        {dev.lastMaintenance}
                      </div>
                      <span className="text-[10px] text-slate-400">Định kỳ 6 tháng/lần</span>
                    </td>

                    {/* Technical Status with Live Quota / Incident Evaluation */}
                    <td className="py-3 px-3 text-center">
                      {dev.status === 'danger' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                          ⚠️ Vượt định mức
                        </span>
                      ) : dev.status === 'warning' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          ⚠️ Cận định mức
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đang vận hành
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            navigateTo('esg-realtime', {
                              factoryId: dev.factoryId,
                              workshopId: dev.workshopId,
                              deviceId: dev.id,
                              viewLevel: 'device',
                            });
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Soi trực tiếp trên hệ thống SCADA IoT"
                        >
                          <Zap className="w-3 h-3 text-teal-600" />
                          <span>SCADA ➔</span>
                        </button>

                        <button
                          onClick={() => setSelectedDeviceProfile(dev)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Hồ sơ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị <strong>{filteredDevices.length}</strong> / <strong>{scopedDevices.length}</strong> thiết bị kỹ thuật
            </span>
            <span className="text-teal-700 font-semibold">
              {role === 'workshop_lead'
                ? `Phân xưởng: ${currentWorkshop.name}`
                : role === 'factory_director'
                ? `Nhà máy: ${currentFactory.name}`
                : 'Toàn hệ thống Tập đoàn Vinamilk'}
            </span>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: ADD NEW ASSET / DEVICE                                     */}
      {/* =================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-teal-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Đăng ký hồ sơ thiết bị kỹ thuật mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDevice} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã thiết bị / Tài sản:</label>
                  <input
                    type="text"
                    placeholder="VD: EQ-CB-06"
                    value={newDevCode}
                    onChange={(e) => setNewDevCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Đơn vị quản lý trực tiếp:</label>
                  <input
                    type="text"
                    value={
                      role === 'workshop_lead'
                        ? currentWorkshop.name
                        : `${currentWorkshop.name} (${currentFactory.name})`
                    }
                    disabled
                    className="w-full bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên thiết bị sản xuất:</label>
                <input
                  type="text"
                  placeholder="VD: Máy chiết rót vô trùng thế hệ mới Tetra Pak A3"
                  value={newDevName}
                  onChange={(e) => setNewDevName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Thông số kỹ thuật / Hãng chế tạo:</label>
                <input
                  type="text"
                  placeholder="VD: Công suất 24.000 hộp/giờ, Động cơ Servo biến tần tiết kiệm điện"
                  value={newDevSpec}
                  onChange={(e) => setNewDevSpec(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày đưa vào vận hành:</label>
                  <input
                    type="text"
                    value={newDevInstallDate}
                    onChange={(e) => setNewDevInstallDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chu kỳ bảo dưỡng:</label>
                  <select
                    value={newDevMaintenanceCycle}
                    onChange={(e) => setNewDevMaintenanceCycle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-teal-500"
                  >
                    <option>Định kỳ 3 tháng/lần</option>
                    <option>Định kỳ 6 tháng/lần</option>
                    <option>Định kỳ 1 năm/lần</option>
                  </select>
                </div>
              </div>

              {/* IoT Sensor Tags Assignment */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Cảm biến đo lường IoT cần kết nối vào SCADA:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => toggleMetricSelection('power')}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${
                      selectedMetrics.includes('power')
                        ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>⚡ Cảm biến Điện</span>
                  </div>

                  <div
                    onClick={() => toggleMetricSelection('co2')}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${
                      selectedMetrics.includes('co2')
                        ? 'bg-red-50 border-red-400 text-red-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>🏭 Cảm biến CO₂</span>
                  </div>

                  <div
                    onClick={() => toggleMetricSelection('water')}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${
                      selectedMetrics.includes('water')
                        ? 'bg-sky-50 border-sky-400 text-sky-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Droplet className="w-4 h-4 text-sky-500" />
                    <span>💧 Cảm biến Nước</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
                >
                  Lưu vào danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: DEVICE TECHNICAL PROFILE (Hồ sơ kỹ thuật thiết bị)          */}
      {/* =================================================================== */}
      {selectedDeviceProfile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-sm">
                  Hồ sơ Kỹ thuật & Quản lý Tài sản
                </h3>
              </div>
              <button
                onClick={() => setSelectedDeviceProfile(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedDeviceProfile.code}
                  </span>
                  <h4 className="text-base font-bold text-slate-800 mt-1">
                    {selectedDeviceProfile.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedDeviceProfile.workshopName} • {selectedDeviceProfile.factoryName}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Đang hoạt động
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Thông số kỹ thuật:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[280px]">
                    {selectedDeviceProfile.specification}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Ngày nghiệm thu & vận hành:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedDeviceProfile.installedDate}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Lịch bảo dưỡng gần nhất:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedDeviceProfile.lastMaintenance}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Tiêu chuẩn kiểm định:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Quatest 3 • ISO 50001
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500">Giao thức truyền thông SCADA:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    Modbus TCP/IP (Moxa NPort)
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setSelectedDeviceProfile(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg"
                >
                  Đóng hồ sơ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
