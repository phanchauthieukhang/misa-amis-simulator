'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import {
  Building2,
  Factory,
  Layers,
  Cpu,
  Plus,
  Search,
  Filter,
  Download,
  Zap,
  Flame,
  Droplet,
  CheckCircle2,
  X,
} from 'lucide-react';
import { MetricType, DeviceItem } from '@/types/esg';

export const ESGFacilitiesView: React.FC = () => {
  const { factories, selectedFactoryId, setSelectedFactoryId } = useESGSimulation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMetric, setFilterMetric] = useState<'all' | MetricType>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Device Form state
  const [newDevName, setNewDevName] = useState('');
  const [newDevCode, setNewDevCode] = useState('');
  const [newDevSpec, setNewDevSpec] = useState('');
  const [newDevPower, setNewDevPower] = useState('350');
  const [newDevCo2, setNewDevCo2] = useState('250');
  const [newDevWater, setNewDevWater] = useState('40');
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['power']);

  const currentFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];

  // Flatten devices for table
  const allDevices: (DeviceItem & { workshopName: string; factoryName: string })[] = [];
  factories.forEach((f) => {
    if (selectedFactoryId && selectedFactoryId !== 'all' && f.id !== selectedFactoryId) return;
    f.workshops.forEach((w) => {
      w.devices.forEach((d) => {
        allDevices.push({
          ...d,
          workshopName: w.name,
          factoryName: f.name,
        });
      });
    });
  });

  const filteredDevices = allDevices.filter((d) => {
    if (filterMetric !== 'all' && !d.metrics.includes(filterMetric)) return false;
    if (searchTerm) {
      const match =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.workshopName.toLowerCase().includes(searchTerm.toLowerCase());
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
    alert(`Đã thêm thiết bị mới: "${newDevName}" (${newDevCode || 'Tự sinh mã'}) vào hệ thống giám sát.`);
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
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Danh mục Cơ sở sản xuất & Thiết bị giám sát năng lượng
            </h2>
            <p className="text-xs text-slate-500">
              Quản lý định mức tiêu thụ, thông số kỹ thuật và nhãn chỉ số môi trường cho từng máy móc
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

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Factory Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-600">Nhà máy:</span>
            <select
              value={selectedFactoryId}
              onChange={(e) => setSelectedFactoryId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-medium text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="all">Tất cả nhà máy Vinamilk</option>
              {factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Tag Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterMetric('all')}
              className={`px-2 py-1 rounded transition-colors ${
                filterMetric === 'all' ? 'bg-white text-slate-800 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Tất cả chỉ số
            </button>
            <button
              onClick={() => setFilterMetric('power')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                filterMetric === 'power' ? 'bg-amber-500 text-white font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Zap className="w-3 h-3" /> Điện
            </button>
            <button
              onClick={() => setFilterMetric('co2')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                filterMetric === 'co2' ? 'bg-red-500 text-white font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Flame className="w-3 h-3" /> CO₂
            </button>
            <button
              onClick={() => setFilterMetric('water')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                filterMetric === 'water' ? 'bg-sky-500 text-white font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Droplet className="w-3 h-3" /> Nước
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên thiết bị, mã hoặc phân xưởng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-teal-500 w-[240px]"
          />
        </div>
      </div>

      {/* Main Asset Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Mã thiết bị</th>
                <th className="py-2.5 px-3">Tên thiết bị & Thông số</th>
                <th className="py-2.5 px-3">Nhà máy & Phân xưởng</th>
                <th className="py-2.5 px-3">Chỉ số theo dõi</th>
                <th className="py-2.5 px-3 text-right">Định mức an toàn</th>
                <th className="py-2.5 px-3">Bảo trì gần nhất</th>
                <th className="py-2.5 px-3 text-center">Tình trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDevices.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-teal-700">{dev.code}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{dev.name}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[280px]">
                      {dev.specification}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800">{dev.workshopName}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {dev.factoryName}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      {dev.metrics.includes('power') && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                          <Zap className="w-2.5 h-2.5" /> Điện
                        </span>
                      )}
                      {dev.metrics.includes('co2') && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded">
                          <Flame className="w-2.5 h-2.5" /> CO₂
                        </span>
                      )}
                      {dev.metrics.includes('water') && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded">
                          <Droplet className="w-2.5 h-2.5" /> Nước
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      {dev.readings.power && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded shadow-2xs">
                          <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <span>{dev.readings.power.max.toLocaleString('vi-VN')} kWh</span>
                        </span>
                      )}
                      {dev.readings.co2 && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono bg-red-50 text-red-800 border border-red-200/80 px-2 py-0.5 rounded shadow-2xs">
                          <Flame className="w-3 h-3 text-red-500 flex-shrink-0" />
                          <span>{dev.readings.co2.max.toLocaleString('vi-VN')} kg</span>
                        </span>
                      )}
                      {dev.readings.water && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono bg-sky-50 text-sky-800 border border-sky-200/80 px-2 py-0.5 rounded shadow-2xs">
                          <Droplet className="w-3 h-3 text-sky-500 flex-shrink-0" />
                          <span>{dev.readings.water.max.toLocaleString('vi-VN')} m³</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{dev.lastMaintenance}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-medium ${
                        dev.status === 'danger'
                          ? 'bg-red-50 text-red-700 border border-red-200 font-bold'
                          : dev.status === 'warning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {dev.status === 'danger'
                        ? 'Vượt ngưỡng'
                        : dev.status === 'warning'
                        ? 'Cận ngưỡng'
                        : 'Bình thường'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị <strong>{filteredDevices.length}</strong> / <strong>{allDevices.length}</strong> thiết bị
          </span>
          <span className="text-teal-700 font-medium">Hệ thống phân cấp tài sản Vinamilk</span>
        </div>
      </div>

      {/* Add New Device Modal (As requested by user: "nếu người dùng thêm thiết bị mới thì tự cấu hình") */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-teal-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Cấu hình & Thêm mới thiết bị giám sát
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
                  <label className="font-semibold text-slate-700 block mb-1">Mã thiết bị:</label>
                  <input
                    type="text"
                    placeholder="VD: EQ-NEW-01"
                    value={newDevCode}
                    onChange={(e) => setNewDevCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phân xưởng trực thuộc:</label>
                  <select className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-teal-500">
                    <option>PX Chế biến sữa tiệt trùng</option>
                    <option>PX Đóng gói & Thành phẩm</option>
                    <option>PX Năng lượng & Xử lý MT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên thiết bị sản xuất:</label>
                <input
                  type="text"
                  placeholder="VD: Máy chiết rót hộp tự động thế hệ mới"
                  value={newDevName}
                  onChange={(e) => setNewDevName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Thông số kỹ thuật:</label>
                <input
                  type="text"
                  placeholder="VD: Công suất 18.000 hộp/h, Tiết kiệm 15% điện năng"
                  value={newDevSpec}
                  onChange={(e) => setNewDevSpec(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-teal-500"
                />
              </div>

              {/* Metric Tag Selection */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Tự cấu hình nhãn chỉ số môi trường cần theo dõi:
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
                    <span>⚡ Điện (kWh)</span>
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
                    <span>🏭 Khí CO₂</span>
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
                    <span>💧 Nước thải</span>
                  </div>
                </div>
              </div>

              {/* Threshold limits */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-700 block">
                  Cấu hình định mức an toàn tối đa (Max Quota):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-200/70">
                    <label className="text-[11px] font-bold text-amber-800 flex items-center gap-1 mb-1">
                      <Zap className="w-3 h-3 text-amber-600" />
                      <span>Điện (kWh):</span>
                    </label>
                    <input
                      type="number"
                      value={newDevPower}
                      onChange={(e) => setNewDevPower(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded px-2 py-1 text-xs font-mono font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="bg-red-50/60 p-2 rounded-lg border border-red-200/70">
                    <label className="text-[11px] font-bold text-red-800 flex items-center gap-1 mb-1">
                      <Flame className="w-3 h-3 text-red-600" />
                      <span>CO₂ (kg):</span>
                    </label>
                    <input
                      type="number"
                      value={newDevCo2}
                      onChange={(e) => setNewDevCo2(e.target.value)}
                      className="w-full bg-white border border-red-300 rounded px-2 py-1 text-xs font-mono font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div className="bg-sky-50/60 p-2 rounded-lg border border-sky-200/70">
                    <label className="text-[11px] font-bold text-sky-800 flex items-center gap-1 mb-1">
                      <Droplet className="w-3 h-3 text-sky-600" />
                      <span>Nước (m³):</span>
                    </label>
                    <input
                      type="number"
                      value={newDevWater}
                      onChange={(e) => setNewDevWater(e.target.value)}
                      className="w-full bg-white border border-sky-300 rounded px-2 py-1 text-xs font-mono font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-sky-500"
                    />
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
                  Lưu & Áp dụng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
