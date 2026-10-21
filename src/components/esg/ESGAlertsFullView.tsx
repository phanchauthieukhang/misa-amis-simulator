'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Flame,
  Droplet,
  Sliders,
  Bell,
  Search,
  Info,
  Calendar,
  FileText,
  Paperclip,
  X,
  Eye,
  Download,
  Check,
  UserCheck,
  Building,
  Sparkles,
  FileCheck2,
  Activity,
} from 'lucide-react';
import { MetricType, ESGAlert, AlertResolutionPayload } from '@/types/esg';

export const ESGAlertsFullView: React.FC = () => {
  const { alerts, roleFilteredAlerts, currentRoleConfig, resolveAlert, triggerAnomaly, role, navigateTo } = useESGSimulation();
  const [filterType, setFilterType] = useState<'all' | MetricType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'resolved'>('all');
  const [filterScope, setFilterScope] = useState<'role' | 'all'>('role');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Viewing Resolved Modal State
  const [viewingAlert, setViewingAlert] = useState<ESGAlert | null>(null);

  const baseAlerts = filterScope === 'role' ? roleFilteredAlerts : alerts;

  const filteredAlerts = baseAlerts.filter((a) => {
    if (filterType !== 'all' && a.metricType !== filterType) return false;
    if (filterStatus === 'new' && a.status === 'resolved') return false;
    if (filterStatus === 'resolved' && a.status !== 'resolved') return false;
    if (searchTerm) {
      const match =
        a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.factoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.workshopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.deviceName && a.deviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.excessDuration && a.excessDuration.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.timeHorizon && a.timeHorizon.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.rootCause && a.rootCause.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.resolution && a.resolution.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  // Open Resolution Modal with smart defaults
  const handleOpenResolveModal = (alt: ESGAlert) => {
    setResolvingAlert(alt);
    setFormError('');
    setRootCause('');
    setResolution('');
    setMeetingCode(`BB-2026/10-HSE-${alt.id.slice(-4)}`);
    setMeetingTitle(`Biên bản họp thống nhất phương án xử lý sự cố vượt định mức [${alt.id}]`);
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

  // Submit Resolution
  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingAlert) return;

    if (!rootCause.trim()) {
      setFormError('Vui lòng nhập hoặc chọn Nguyên nhân xác định qua điều tra.');
      return;
    }
    if (!resolution.trim()) {
      setFormError('Vui lòng nhập hoặc chọn Phương án & Hướng giải quyết đã phê duyệt.');
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

  // Quick suggestion templates based on metric
  const getSuggestions = (metric: MetricType) => {
    if (metric === 'power') {
      return {
        rootCauses: [
          'Mô tơ thiết bị bị mòn bạc đạn dẫn tới kẹt tải và tăng dòng điện tiêu thụ bất thường.',
          'Dây chuyền hoạt động liên tục 3 ca để đáp ứng tiến độ đơn hàng xuất khẩu, thiếu thời gian nghỉ máy.',
          'Bộ biến tần của hệ thống hoạt động sai hệ số công suất cos phi sụt giảm dưới 0.85.',
        ],
        resolutions: [
          'Đã bảo dưỡng thay thế cụm bạc đạn SKF mới, hiệu chỉnh khe hở cơ khí và bôi trơn định kỳ.',
          'Điều chuyển bớt 30% phụ tải sang dây chuyền dự phòng và lập lịch chạy lệch giờ cao điểm.',
          'Đóng bổ sung giàn tụ bù công suất phản kháng, đưa hệ số cos phi đạt 0.95 theo quy định.',
        ],
      };
    }
    if (metric === 'co2') {
      return {
        rootCauses: [
          'Cụm vòi phun dầu lò hơi bị bám muội than, làm giảm hiệu suất sinh nhiệt và tăng lượng nhiên liệu đốt.',
          'Nhiên liệu sinh khối Biomass đầu vào có độ ẩm vượt chuẩn (32% so với định mức < 20%).',
          'Hệ thống van thu hồi nhiệt khói thải bị kẹt muội xỉ làm suy giảm tỷ lệ trao đổi nhiệt.',
        ],
        resolutions: [
          'Vệ sinh súc rửa toàn bộ béc phun, cân chỉnh tỷ lệ cấp gió tự động đạt nồng độ O₂ dư 3.5%.',
          'Từ chối lô nhiên liệu ẩm, chuyển sang đốt lô Biomass đạt chuẩn và tăng nhiệt độ buồng sấy sơ bộ.',
          'Xử lý thông xỉ van trao đổi nhiệt và lập lịch đo kiểm nồng độ phát thải 2 tuần/lần.',
        ],
      };
    }
    return {
      rootCauses: [
        'Van phao điện tử bồn chứa nước rửa CIP bị lỗi đóng ngắt, dẫn đến hiện tượng xả tràn lưu lượng.',
        'Tăng đột biến chu kỳ súc rửa màng lọc RO do chất lượng nguồn nước cấp đầu vào có độ đục cao.',
        'Áp lực bơm đẩy bùn trạm xử lý MBR quá tải trong giờ cao điểm vệ sinh tổng thể ca 3.',
      ],
      resolutions: [
        'Thay thế cụm van phao từ tính đóng ngắt tự động mới và kiểm tra hiệu chuẩn cảm biến đo mức.',
        'Tái tuần hoàn 45% nước xả tráng bước cuối sang hệ thống tưới cây và làm mát ngưng tụ.',
        'Điều tiết lưu lượng xả về bể điều hòa ổn định, vận hành bơm theo tần số biến tần tự động.',
      ],
    };
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-800">
                Nhật ký Cảnh báo An toàn & Vượt định mức Môi trường
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                {currentRoleConfig.roleLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống tự động phát hiện vượt ngưỡng • Quy trình điều tra nguyên nhân & phê duyệt biên bản khắc phục
            </p>
          </div>
        </div>

        {/* Quick Test Trigger Buttons Scaled to Role */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => triggerAnomaly('power')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title={`Kích hoạt sự cố vượt ngưỡng ${currentRoleConfig.thresholds.powerDanger.toLocaleString('vi-VN')} ${currentRoleConfig.thresholds.powerUnit}`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {role === 'bod'
                ? 'Kích hoạt sự cố Điện (+54.000 kW)'
                : role === 'factory_director'
                ? 'Kích hoạt sự cố Điện (+5.400 kW)'
                : 'Kích hoạt sự cố Điện (+545 kW)'}
            </span>
          </button>
          <button
            onClick={() => triggerAnomaly('co2')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title={`Kích hoạt sự cố vượt hạn ngạch ${currentRoleConfig.thresholds.co2Danger.toLocaleString('vi-VN')} ${currentRoleConfig.thresholds.co2Unit}`}
          >
            <Flame className="w-3.5 h-3.5 text-red-600" />
            <span>
              {role === 'bod'
                ? 'Kích hoạt sự cố CO₂ (+38.000 kg)'
                : role === 'factory_director'
                ? 'Kích hoạt sự cố CO₂ (+3.800 kg)'
                : 'Kích hoạt sự cố CO₂ (+380 kg)'}
            </span>
          </button>
        </div>
      </div>

      {/* Threshold Configuration Card - Role Adaptive */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-teal-600" />
            Quy chuẩn định mức & Ngưỡng an toàn phân cấp (QCVN / ISO 50001)
          </h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {currentRoleConfig.scopeLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <Clock className="w-3 h-3 text-amber-600" />
              {currentRoleConfig.evalPeriodLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-600" /> Điện năng tiêu thụ</span>
              <span className="font-mono text-amber-800">&gt; {currentRoleConfig.thresholds.powerDanger.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.powerUnit}</span>
            </div>
            <p className="text-slate-600 text-[11.5px] leading-relaxed">
              Cảnh báo vàng: <strong>{currentRoleConfig.thresholds.powerWarning.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.powerUnit}</strong> (80% định mức)<br />
              Báo động đỏ: <strong>&gt; {currentRoleConfig.thresholds.powerDanger.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.powerUnit}</strong> ({currentRoleConfig.evalPeriodLabel.toLowerCase()})
            </p>
          </div>

          <div className="p-3 rounded-lg border border-red-200 bg-red-50/50">
            <div className="flex items-center justify-between font-bold text-red-900 mb-1">
              <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-red-600" /> Khí phát thải CO₂</span>
              <span className="font-mono text-red-800">&gt; {currentRoleConfig.thresholds.co2Danger.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.co2Unit}</span>
            </div>
            <p className="text-slate-600 text-[11.5px] leading-relaxed">
              Cảnh báo vàng: <strong>{currentRoleConfig.thresholds.co2Warning.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.co2Unit}</strong> (80% hạn ngạch)<br />
              Báo động đỏ: <strong>&gt; {currentRoleConfig.thresholds.co2Danger.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.co2Unit}</strong> ({currentRoleConfig.evalPeriodLabel.toLowerCase()})
            </p>
          </div>

          <div className="p-3 rounded-lg border border-sky-200 bg-sky-50/50">
            <div className="flex items-center justify-between font-bold text-sky-900 mb-1">
              <span className="flex items-center gap-1"><Droplet className="w-3.5 h-3.5 text-sky-600" /> Nước thải sản xuất</span>
              <span className="font-mono text-sky-800">&gt; {currentRoleConfig.thresholds.waterDanger.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.waterUnit}</span>
            </div>
            <p className="text-slate-600 text-[11.5px] leading-relaxed">
              Cảnh báo vàng: <strong>{currentRoleConfig.thresholds.waterWarning.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.waterUnit}</strong> (80% trạm MBR)<br />
              Báo động đỏ: <strong>&gt; {currentRoleConfig.thresholds.waterDanger.toLocaleString('vi-VN')} {currentRoleConfig.thresholds.waterUnit}</strong> ({currentRoleConfig.evalPeriodLabel.toLowerCase()})
            </p>
          </div>
        </div>

        {/* Business Rationale Banner */}
        <div className="mt-3 p-2.5 rounded-lg bg-teal-50/60 border border-teal-200 flex items-start gap-2 text-slate-700 text-[11.5px]">
          <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-teal-900">Quy trình điều tra & biên bản xử lý: </strong>
            <span>Hệ thống chỉ đưa ra cảnh báo định lượng theo dữ liệu cảm biến; nguyên nhân sự cố và biện pháp khắc phục được xác lập thông qua cuộc họp điều tra hiện trường và lưu trữ bằng biên bản có chữ ký phê duyệt.</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Scope Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg font-medium">
            <button
              onClick={() => setFilterScope('role')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterScope === 'role' ? 'bg-white text-teal-800 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Trong quyền hạn ({roleFilteredAlerts.length})
            </button>
            <button
              onClick={() => setFilterScope('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterScope === 'all' ? 'bg-white text-slate-800 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Toàn hệ thống ({alerts.length})
            </button>
          </div>

          {/* Metric Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'all' ? 'bg-white text-slate-800 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Tất cả chỉ số
            </button>
            <button
              onClick={() => setFilterType('power')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'power' ? 'bg-amber-500 text-white font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              ⚡ Điện
            </button>
            <button
              onClick={() => setFilterType('co2')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'co2' ? 'bg-red-500 text-white font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              🏭 CO₂
            </button>
            <button
              onClick={() => setFilterType('water')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'water' ? 'bg-sky-500 text-white font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              💧 Nước
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg font-medium">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterStatus === 'all' ? 'bg-white text-slate-800 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Tất cả trạng thái
            </button>
            <button
              onClick={() => setFilterStatus('new')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterStatus === 'new' ? 'bg-red-600 text-white font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Chưa xử lý
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterStatus === 'resolved' ? 'bg-emerald-600 text-white font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Đã khắc phục
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã sự cố, nội dung, nguyên nhân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-teal-500 w-[240px]"
          />
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Mã sự cố</th>
                <th className="py-2.5 px-3">Thời gian & Chu kỳ</th>
                <th className="py-2.5 px-3">Mức độ</th>
                <th className="py-2.5 px-3">Cấp quản lý</th>
                <th className="py-2.5 px-3">Cảnh báo hệ thống & Kết luận nguyên nhân</th>
                <th className="py-2.5 px-3">Vị trí & Thiết bị</th>
                <th className="py-2.5 px-3 text-right">Đo lường / Định mức</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không có cảnh báo nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alt) => (
                  <tr key={alt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{alt.id}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-600 font-mono text-[11px]">{alt.timestamp}</div>
                      <div className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {alt.timeHorizon}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          alt.level === 'danger'
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {alt.level === 'danger' ? 'VƯỢT NGƯỠNG' : 'CẬN NGƯỠNG'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          alt.scopeLevel === 'enterprise'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : alt.scopeLevel === 'factory'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                        }`}
                      >
                        {alt.scopeLevel === 'enterprise'
                          ? 'Cấp Doanh nghiệp'
                          : alt.scopeLevel === 'factory'
                          ? 'Cấp Nhà máy'
                          : 'Cấp Bộ phận'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 max-w-[320px]">
                      {/* Objective telemetry alert */}
                      <div className="text-slate-800">{alt.message}</div>
                      <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                        ⏱ {alt.excessDuration}
                      </div>

                      {/* Display root cause if already investigated and resolved */}
                      {alt.status === 'resolved' && alt.rootCause ? (
                        <div className="mt-1.5 p-2 bg-emerald-50/70 border border-emerald-200/80 rounded text-[11px] text-slate-700 space-y-1">
                          <div className="flex items-start gap-1">
                            <strong className="text-emerald-900 font-semibold flex-shrink-0">Nguyên nhân:</strong>
                            <span className="line-clamp-2">{alt.rootCause}</span>
                          </div>
                          {alt.meetingMinute && (
                            <div className="flex items-center gap-1 text-[10.5px] text-teal-700 font-medium pt-0.5">
                              <Paperclip className="w-3 h-3" />
                              <span>{alt.meetingMinute.fileName} ({alt.meetingMinute.code})</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[10.5px] text-slate-400 italic mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Chưa có biên bản điều tra nguyên nhân & hướng giải quyết</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{alt.factoryName}</div>
                      <div className="text-[11px] text-slate-400">
                        {alt.workshopName} {alt.deviceName ? `• ${alt.deviceName}` : ''}
                      </div>
                      <button
                        onClick={() => {
                          let targetFactId = alt.factoryId || 'nm-vnm-bd';
                          if (!alt.factoryId) {
                            if (alt.factoryName.includes('Mega')) targetFactId = 'nm-mega-dairy';
                            else if (alt.factoryName.includes('Thống Nhất')) targetFactId = 'nm-thong-nhat';
                          }
                          let targetWsId = alt.workshopId || 'px-che-bien';
                          if (!alt.workshopId) {
                            if (alt.workshopName.includes('Đóng gói')) targetWsId = 'px-dong-goi';
                            else if (alt.workshopName.includes('Năng lượng')) targetWsId = 'px-nang-luong';
                            else if (alt.workshopName.includes('Sữa tươi')) targetWsId = 'px-sua-tuoi';
                            else if (alt.workshopName.includes('Kho lạnh')) targetWsId = 'px-kho-lanh-mega';
                          }
                          let targetDevId = alt.deviceId || null;
                          if (!alt.deviceId && alt.deviceName) {
                            if (alt.deviceName.includes('UHT')) targetDevId = 'tb-uht-01';
                            else if (alt.deviceName.includes('Lò hơi')) targetDevId = 'tb-lo-hoi';
                            else if (alt.deviceName.includes('Chiller')) targetDevId = 'tb-chiller-01';
                          }
                          navigateTo('esg-realtime', {
                            factoryId: targetFactId,
                            workshopId: targetWsId,
                            deviceId: targetDevId,
                            viewLevel: targetDevId ? 'device' : 'workshop',
                          });
                        }}
                        className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-1.5 py-0.5 rounded mt-1 transition-colors cursor-pointer"
                        title="Chuyển đến màn hình giám sát thời gian thực SCADA của vị trí này"
                      >
                        <Activity className="w-3 h-3 text-teal-600" />
                        <span>Xem SCADA ➔</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-red-700">
                      {alt.value} <span className="text-slate-400 font-normal">/ {alt.threshold}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {alt.status !== 'resolved' ? (
                        <button
                          onClick={() => handleOpenResolveModal(alt)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Lập biên bản xử lý</span>
                        </button>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã khắc phục
                          </span>
                          <button
                            onClick={() => setViewingAlert(alt)}
                            className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 font-medium hover:underline cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Xem biên bản họp</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Investigation & Resolution Modal */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-teal-800 to-teal-700 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-200" />
                  <h3 className="font-bold text-sm tracking-wide">
                    Biên bản Điều tra & Phê duyệt Xử lý Vượt định mức Môi trường
                  </h3>
                </div>
                <p className="text-xs text-teal-100/90 mt-1">
                  Mã sự cố: <strong>{resolvingAlert.id}</strong> • {resolvingAlert.factoryName} • {resolvingAlert.workshopName}
                </p>
              </div>
              <button
                onClick={() => setResolvingAlert(null)}
                className="text-teal-200 hover:text-white p-1 rounded-lg hover:bg-teal-600/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveResolution} className="p-5 space-y-4 text-xs">
              {/* Telemetry Snapshot Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                <div>
                  <span className="text-[10.5px] text-slate-400 block">Chỉ số vi phạm:</span>
                  <span className="font-bold text-slate-800 uppercase flex items-center gap-1 mt-0.5">
                    {resolvingAlert.metricType === 'power' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                    {resolvingAlert.metricType === 'co2' && <Flame className="w-3.5 h-3.5 text-red-500" />}
                    {resolvingAlert.metricType === 'water' && <Droplet className="w-3.5 h-3.5 text-sky-500" />}
                    {resolvingAlert.metricType === 'power' ? 'Điện năng' : resolvingAlert.metricType === 'co2' ? 'Khí thải CO₂' : 'Nước thải'}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 block">Đo lường / Định mức:</span>
                  <span className="font-mono font-bold text-red-600 mt-0.5 block">
                    {resolvingAlert.value} / {resolvingAlert.threshold}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 block">Chu kỳ tích lũy:</span>
                  <span className="font-semibold text-amber-700 mt-0.5 block">{resolvingAlert.timeHorizon}</span>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 block">Thời gian phát hiện:</span>
                  <span className="font-mono text-slate-600 mt-0.5 block">{resolvingAlert.timestamp}</span>
                </div>
              </div>

              {/* Alert telemetry note */}
              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-900 text-[11.5px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Cảnh báo ghi nhận tự động: </strong>
                  <span>{resolvingAlert.message} ({resolvingAlert.excessDuration})</span>
                </div>
              </div>

              {/* Error Message if any */}
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* 1. Root Cause Section */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. Nguyên nhân xác định qua điều tra hiện trường <span className="text-red-500">*</span>:
                </label>
                <textarea
                  rows={2}
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="Ghi rõ kết luận nguyên nhân kỹ thuật hoặc quy trình gây ra việc tăng tải / phát thải..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-teal-500 text-slate-800 leading-relaxed"
                />

                {/* Quick suggestions chips */}
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10.5px] text-slate-400 font-medium">Gợi ý nhanh:</span>
                  {getSuggestions(resolvingAlert.metricType).rootCauses.map((sg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRootCause(sg)}
                      className="text-[10.5px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer text-left"
                    >
                      + {sg.slice(0, 36)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Resolution Action Section */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. Phương án & Hướng giải quyết khắc phục đã thống nhất <span className="text-red-500">*</span>:
                </label>
                <textarea
                  rows={2}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Ghi rõ giải pháp kỹ thuật, điều chỉnh công suất, bảo dưỡng hoặc chuyển đổi nguồn cấp..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-teal-500 text-slate-800 leading-relaxed"
                />

                {/* Quick suggestions chips */}
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10.5px] text-slate-400 font-medium">Gợi ý nhanh:</span>
                  {getSuggestions(resolvingAlert.metricType).resolutions.map((sg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setResolution(sg)}
                      className="text-[10.5px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer text-left"
                    >
                      + {sg.slice(0, 36)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Meeting Minutes & Evidence Attachment */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                  <span>3. Biên bản cuộc họp & Tài liệu đính kèm chốt phương án:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10.5px] text-slate-500 mb-0.5">Số hiệu biên bản họp:</label>
                    <input
                      type="text"
                      value={meetingCode}
                      onChange={(e) => setMeetingCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] text-slate-500 mb-0.5">Tiêu đề cuộc họp:</label>
                    <input
                      type="text"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-0.5">Thành phần họp & chốt kết luận:</label>
                  <input
                    type="text"
                    value={meetingAttendees}
                    onChange={(e) => setMeetingAttendees(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:border-teal-500"
                  />
                </div>

                {/* Attached File Simulation */}
                <div className="flex items-center justify-between p-2.5 bg-white border border-dashed border-teal-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-xs">{attachedFileName}</div>
                      <div className="text-[10px] text-slate-400">Dung lượng: {attachedFileSize} • Tệp biên bản có chữ ký</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newName = prompt('Nhập tên tệp biên bản đính kèm:', attachedFileName);
                      if (newName) setAttachedFileName(newName);
                    }}
                    className="px-2 py-1 text-[11px] font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 transition-colors cursor-pointer"
                  >
                    Đổi tệp đính kèm
                  </button>
                </div>
              </div>

              {/* 4. Approver & Resolver */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  4. Cán bộ chủ trì & Ký duyệt biên bản:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={resolverName}
                    onChange={(e) => setResolverName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:bg-white focus:border-teal-500"
                  />
                  <span className="text-[11px] text-slate-400 font-mono">
                    Ngày lập: 19/10/2026
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingAlert(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu biên bản & Phê duyệt khắc phục</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Resolved Minute Details */}
      {viewingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6 animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <h3 className="font-bold text-sm tracking-wide">
                    Hồ sơ Biên bản Xử lý Sự cố & Khắc phục Môi trường
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Mã sự cố: <strong className="text-teal-400">{viewingAlert.id}</strong> • Trạng thái: Đã hoàn tất xử lý
                </p>
              </div>
              <button
                onClick={() => setViewingAlert(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Sheet */}
            <div className="p-5 space-y-4 text-xs">
              {/* Incident Summary */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Vị trí sự cố:</span>
                  <span className="font-semibold text-slate-800">
                    {viewingAlert.factoryName} • {viewingAlert.workshopName} {viewingAlert.deviceName ? `• ${viewingAlert.deviceName}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Số liệu vượt định mức:</span>
                  <span className="font-mono font-bold text-red-600">
                    {viewingAlert.value} (Ngưỡng: {viewingAlert.threshold}) • {viewingAlert.timeHorizon}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Cảnh báo cảm biến:</span>
                  <span className="text-slate-700 italic">{viewingAlert.message}</span>
                </div>
              </div>

              {/* Root cause */}
              <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl">
                <span className="font-bold text-red-900 block mb-1">
                  🔍 Nguyên nhân xác định qua điều tra hiện trường:
                </span>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">
                  {viewingAlert.rootCause || 'Đã kiểm tra kỹ thuật và xác nhận sự cố quá tải phụ tải.'}
                </p>
              </div>

              {/* Resolution plan */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                <span className="font-bold text-emerald-900 block mb-1">
                  🛠️ Phương án & Biện pháp kỹ thuật đã khắc phục:
                </span>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">
                  {viewingAlert.resolution || 'Đã hoàn tất bảo dưỡng, cân chỉnh thông số và đưa thiết bị về chế độ tiết kiệm.'}
                </p>
              </div>

              {/* Meeting minute details */}
              {viewingAlert.meetingMinute && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                      <span>Biên bản cuộc họp đính kèm:</span>
                    </span>
                    <span className="font-mono text-teal-700 text-[11px]">
                      {viewingAlert.meetingMinute.code}
                    </span>
                  </div>

                  <div className="text-[11.5px] text-slate-700 space-y-1">
                    <div><strong>Tiêu đề:</strong> {viewingAlert.meetingMinute.title}</div>
                    <div><strong>Thời gian họp:</strong> {viewingAlert.meetingMinute.date}</div>
                    <div><strong>Thành phần tham gia:</strong> {viewingAlert.meetingMinute.attendees}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-slate-800">{viewingAlert.meetingMinute.fileName}</span>
                      <span className="text-[10px] text-slate-400">({viewingAlert.meetingMinute.fileSize})</span>
                    </div>

                    <button
                      onClick={() => alert(`Đang tải xuống tệp biên bản đính kèm: ${viewingAlert.meetingMinute?.fileName}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-white hover:bg-teal-50 border border-teal-300 rounded shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải biên bản PDF</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Signoff metadata */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Cán bộ phê duyệt: <strong className="text-slate-800">{viewingAlert.resolvedBy || 'Cán bộ HSE'}</strong></span>
                <span>Thời điểm hoàn tất: <strong className="font-mono text-slate-700">{viewingAlert.resolvedAt || viewingAlert.timestamp}</strong></span>
              </div>

              {/* Footer Button */}
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setViewingAlert(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
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


