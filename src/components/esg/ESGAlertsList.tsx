'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Zap,
  Flame,
  Droplet,
  Calendar,
  Info,
  FileText,
  Paperclip,
  X,
  FileCheck2,
} from 'lucide-react';
import { MetricType, ESGAlert, AlertResolutionPayload } from '@/types/esg';

export const ESGAlertsList: React.FC = () => {
  const { roleFilteredAlerts, resolveAlert, role, currentRoleConfig } = useESGSimulation();
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  // Resolution Modal State
  const [resolvingAlert, setResolvingAlert] = useState<ESGAlert | null>(null);
  const [rootCause, setRootCause] = useState('');
  const [resolution, setResolution] = useState('');
  const [meetingCode, setMeetingCode] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingAttendees, setMeetingAttendees] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileSize, setAttachedFileSize] = useState('');
  const [resolverName, setResolverName] = useState('');
  const [formError, setFormError] = useState('');

  const filteredAlerts = roleFilteredAlerts.filter((a) => {
    if (filterStatus === 'unresolved') return a.status !== 'resolved';
    if (filterStatus === 'resolved') return a.status === 'resolved';
    return true;
  });

  const renderMetricIcon = (m: MetricType) => {
    switch (m) {
      case 'power':
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case 'co2':
        return <Flame className="w-3.5 h-3.5 text-red-500" />;
      case 'water':
        return <Droplet className="w-3.5 h-3.5 text-sky-500" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const handleOpenModal = (alt: ESGAlert) => {
    setResolvingAlert(alt);
    setFormError('');
    setRootCause('');
    setResolution('');
    setMeetingCode(`BB-2026/10-HSE-${alt.id.slice(-4)}`);
    setMeetingTitle(`Biên bản họp thống nhất phương án xử lý sự cố [${alt.id}]`);
    setAttachedFileName(`Bien-ban-hop-khac-phuc-${alt.id}.pdf`);
    setAttachedFileSize('2.4 MB');

    if (role === 'bod') {
      setMeetingAttendees('Mai Kiều Liên (Tổng Giám đốc), Trần Quốc Bảo (GĐ Khối HSE), Nguyễn Văn An (Chuyên viên ESG)');
      setResolverName('Nguyễn Văn An (Chuyên viên ESG Tập đoàn)');
    } else if (role === 'factory_director') {
      setMeetingAttendees('Nguyễn Quốc Hưng (GĐ Nhà máy), Phạm Minh Quân (TP Kỹ thuật NM), Lê Hoàng Phúc (KS Năng lượng)');
      setResolverName('Phạm Minh Quân (Trưởng phòng Kỹ thuật NM)');
    } else {
      setMeetingAttendees('Trần Thanh Hải (Quản đốc PX), Đỗ Tuấn Kiệt (Tổ trưởng Cơ điện), Hoàng Văn Nam (Kỹ thuật viên)');
      setResolverName('Trần Thanh Hải (Quản đốc Phân xưởng)');
    }
  };

  const handleSubmitResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingAlert) return;

    if (!rootCause.trim()) {
      setFormError('Vui lòng nhập nguyên nhân xác định qua điều tra.');
      return;
    }
    if (!resolution.trim()) {
      setFormError('Vui lòng nhập phương án & hướng giải quyết khắc phục.');
      return;
    }

    const payload: AlertResolutionPayload = {
      rootCause: rootCause.trim(),
      resolution: resolution.trim(),
      meetingMinuteCode: meetingCode,
      meetingMinuteTitle: meetingTitle,
      meetingMinuteAttendees: meetingAttendees,
      meetingMinuteFile: attachedFileName,
      meetingMinuteFileSize: attachedFileSize,
      resolvedBy: resolverName,
    };

    resolveAlert(resolvingAlert.id, payload);
    setResolvingAlert(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              Nhật ký cảnh báo an toàn & Vượt định mức ({currentRoleConfig.roleLabel})
            </h3>
            <p className="text-xs text-slate-500">
              {currentRoleConfig.evalPeriodLabel} • Báo động đỏ: &gt; {currentRoleConfig.thresholds.powerDanger.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.powerUnit}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setFilterStatus('unresolved')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterStatus === 'unresolved'
                ? 'bg-white text-red-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chưa xử lý ({roleFilteredAlerts.filter((a) => a.status !== 'resolved').length})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterStatus === 'resolved'
                ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đã xử lý ({roleFilteredAlerts.filter((a) => a.status === 'resolved').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterStatus === 'all'
                ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* Role Horizon Explanation Box */}
      <div className="my-2 p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
        <Info className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
        <span>
          <strong>Quy tắc kích hoạt:</strong> {currentRoleConfig.rationale}
        </span>
      </div>

      {/* Alerts Items */}
      <div className="space-y-2.5 my-2 flex-1 overflow-y-auto max-h-[300px] pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
            <span>Không có cảnh báo vượt định mức trong phạm vi này. Hệ thống vận hành an toàn!</span>
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3 rounded-lg border transition-all ${
                alt.status === 'resolved'
                  ? 'bg-slate-50/70 border-slate-200'
                  : alt.level === 'danger'
                  ? 'bg-red-50/60 border-red-200'
                  : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1">
                  <div className="mt-0.5">{renderMetricIcon(alt.metricType)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-800 font-mono">{alt.id}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          alt.level === 'danger'
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {alt.level === 'danger' ? 'VƯỢT NGƯỠNG' : 'CẬN NGƯỠNG'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        <Calendar className="w-2.5 h-2.5 text-teal-600" />
                        {alt.timeHorizon}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {alt.timestamp}
                      </span>
                    </div>

                    {/* Telemetry message */}
                    <p className="text-xs text-slate-800 font-medium mt-1">{alt.message}</p>

                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        Phạm vi: <strong>{alt.factoryName}</strong> • {alt.workshopName}
                      </span>
                      {alt.deviceName && (
                        <span>
                          Thiết bị: <strong className="text-slate-700">{alt.deviceName}</strong>
                        </span>
                      )}
                      <span>
                        Đo lường: <span className="text-red-700 font-bold font-mono">{alt.value}</span> / Định mức: <span className="font-mono font-semibold">{alt.threshold}</span>
                      </span>
                    </div>

                    {/* Resolved notes if available */}
                    {alt.status === 'resolved' && alt.rootCause ? (
                      <div className="mt-1.5 p-2 bg-emerald-50/80 border border-emerald-200 rounded text-[11px] text-slate-700 space-y-0.5">
                        <div><strong className="text-emerald-900 font-semibold">Nguyên nhân:</strong> {alt.rootCause}</div>
                        <div><strong className="text-emerald-900 font-semibold">Khắc phục:</strong> {alt.resolution}</div>
                        {alt.meetingMinute && (
                          <div className="text-teal-700 font-medium text-[10.5px] flex items-center gap-1 pt-0.5">
                            <Paperclip className="w-3 h-3" />
                            <span>{alt.meetingMinute.fileName} ({alt.meetingMinute.code})</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10.5px] text-slate-400 italic mt-1">
                        Chưa có biên bản điều tra nguyên nhân
                      </div>
                    )}
                  </div>
                </div>

                {/* Resolve Action Button */}
                <div className="flex-shrink-0">
                  {alt.status !== 'resolved' ? (
                    <button
                      onClick={() => handleOpenModal(alt)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-2xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Xử lý & Lập biên bản</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Đã khắc phục
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Tiếp nhận cảnh báo theo cấp thẩm quyền & chu kỳ tích lũy thời gian</span>
        <span className="text-teal-700 font-medium">{currentRoleConfig.scopeLabel}</span>
      </div>

      {/* Quick Modal inside Dashboard Alert List */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
            <div className="px-5 py-4 bg-teal-800 text-white flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm">Biên bản Điều tra & Khắc phục Sự cố</h3>
                <p className="text-xs text-teal-100 mt-0.5">Mã sự cố: {resolvingAlert.id} • {resolvingAlert.workshopName}</p>
              </div>
              <button onClick={() => setResolvingAlert(null)} className="text-teal-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitResolution} className="p-5 space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 border rounded-lg text-slate-600">
                <div className="font-bold text-slate-800">{resolvingAlert.message}</div>
                <div className="text-[11px] text-red-600 mt-0.5">Đo lường: {resolvingAlert.value} / {resolvingAlert.threshold} ({resolvingAlert.timeHorizon})</div>
              </div>

              {formError && <div className="text-red-600 font-medium">{formError}</div>}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nguyên nhân xác định qua điều tra <span className="text-red-500">*</span>:</label>
                <textarea
                  rows={2}
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="Ghi rõ nguyên nhân phát sinh qua kiểm tra thực tế..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phương án & Hướng giải quyết đã phê duyệt <span className="text-red-500">*</span>:</label>
                <textarea
                  rows={2}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Ghi rõ các biện pháp kỹ thuật và vận hành đã thống nhất..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white text-xs text-slate-800"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border rounded-lg space-y-2">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                  <span>Biên bản cuộc họp đính kèm:</span>
                </div>
                <div className="flex items-center justify-between bg-white p-2 border rounded">
                  <span className="font-mono text-slate-700">{attachedFileName}</span>
                  <span className="text-slate-400 text-[10px]">({attachedFileSize})</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cán bộ phê duyệt:</label>
                <input
                  type="text"
                  value={resolverName}
                  onChange={(e) => setResolverName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingAlert(null)}
                  className="px-3 py-1.5 rounded bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-teal-600 text-white font-bold hover:bg-teal-700 cursor-pointer"
                >
                  Lưu biên bản & Phê duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
