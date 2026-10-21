'use client';

import React, { useState } from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import {
  FileText,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Share2,
  ShieldCheck,
  Clock,
  Sliders,
  Info,
} from 'lucide-react';
import { TimePeriod } from '@/types/esg';

export const ESGReportsView: React.FC = () => {
  const { factories, timePeriod, setTimePeriod, scopedTotals, role, currentRoleConfig } = useESGSimulation();
  const [selectedReportType, setSelectedReportType] = useState('summary');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: 'excel' | 'pdf') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(
        `Đã tạo thành công tệp Báo cáo ESG Vinamilk [${format.toUpperCase()}]. Tệp đã sẵn sàng tải xuống!`
      );
    }, 1200);
  };

  const reportScopeName =
    role === 'bod'
      ? 'Tập đoàn Vinamilk (Toàn bộ 3 Nhà máy)'
      : role === 'factory_director'
      ? 'Nhà máy sữa Việt Nam (Bình Dương)'
      : 'PX Chế biến sữa tiệt trùng (NM Bình Dương)';

  const currentPeriodConfig =
    currentRoleConfig.allowedPeriods.find((p) => p.value === timePeriod) ||
    currentRoleConfig.allowedPeriods[0];

  const reportDocumentTitle =
    role === 'bod'
      ? 'BÁO CÁO TỔNG HỢP KIỂM KÊ PHÁT THẢI KHÍ NHÀ KÍNH & TIÊU THỤ NĂNG LƯỢNG TẬP ĐOÀN'
      : role === 'factory_director'
      ? 'BÁO CÁO KIỂM TOÁN NĂNG LƯỢNG & NƯỚC THẢI SẢN XUẤT NHÀ MÁY (ISO 50001)'
      : 'BẢNG TỔNG HỢP THEO DÕI ĐỊNH MỨC TIÊU THỤ NĂNG LƯỢNG THIẾT BỊ PHÂN XƯỞNG';

  const formCode =
    role === 'bod'
      ? 'BM-ESG-CORP-01 (Chuẩn GRI 302/305 & TCFD)'
      : role === 'factory_director'
      ? 'BM-ESG-FAC-02 (QCVN 40 & ISO 50001)'
      : 'BM-ESG-WS-03 (Quy chuẩn kỹ thuật ca)';

  // Calculate multiplier for selected period
  const periodMultiplierMap: Record<string, number> = {
    today: 1,
    week: 7,
    month: 30,
    quarter: 90,
    year: 365,
    '3years': 365 * 3,
    '5years': 365 * 5,
    '10years': 365 * 10,
  };
  const multiplier = periodMultiplierMap[timePeriod] || 30;

  const isMultiYear = timePeriod === '3years' || timePeriod === '5years' || timePeriod === '10years';
  const isYear = timePeriod === 'year';

  const powerDisplayVal = isMultiYear
    ? Math.round((scopedTotals.powerKWh * multiplier) / 1000).toLocaleString('vi-VN')
    : Math.round(scopedTotals.powerKWh * multiplier).toLocaleString('vi-VN');
  const powerDisplayUnit = isMultiYear ? 'MWh' : 'kWh';

  const powerQuotaVal = isMultiYear
    ? Math.round((scopedTotals.powerKWh * multiplier * 1.12) / 1000).toLocaleString('vi-VN')
    : Math.round(scopedTotals.powerKWh * multiplier * 1.12).toLocaleString('vi-VN');

  const co2DisplayVal =
    isMultiYear || (role === 'bod' && isYear)
      ? Math.round((scopedTotals.co2Kg * multiplier) / 1000).toLocaleString('vi-VN')
      : Math.round(scopedTotals.co2Kg * multiplier).toLocaleString('vi-VN');
  const co2DisplayUnit = isMultiYear || (role === 'bod' && isYear) ? 'tấn CO₂e' : 'kg CO₂e';

  const co2QuotaVal =
    isMultiYear || (role === 'bod' && isYear)
      ? Math.round((scopedTotals.co2Kg * multiplier * 1.16) / 1000).toLocaleString('vi-VN')
      : Math.round(scopedTotals.co2Kg * multiplier * 1.16).toLocaleString('vi-VN');

  const waterDisplayVal = Math.round(scopedTotals.waterM3 * multiplier).toLocaleString('vi-VN');
  const waterQuotaVal = Math.round(scopedTotals.waterM3 * multiplier * 1.25).toLocaleString('vi-VN');

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-800">
                Hệ thống Báo cáo Kiểm toán Năng lượng & Phát thải ESG
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                {currentRoleConfig.roleLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuẩn hóa mẫu biểu theo Nghị định 06/2022/NĐ-CP, tiêu chuẩn GRI 302/305 và GHG Protocol
            </p>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Đang kết xuất...' : 'Xuất Báo cáo PDF'}</span>
          </button>
        </div>
      </div>

      {/* Report Parameter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Role-Specific Period Select */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Kỳ báo cáo:</span>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 font-semibold text-slate-800 outline-none focus:border-teal-500 cursor-pointer"
            >
              {currentRoleConfig.allowedPeriods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scope Indicator */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Phạm vi lập biểu: <strong className="text-teal-800">{reportScopeName}</strong>
            </span>
          </div>

          {/* Evaluation Cycle Badge */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Định mức: <strong>{currentRoleConfig.evalPeriodLabel}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Dữ liệu đã được kiểm toán nội bộ Vinamilk</span>
        </div>
      </div>

      {/* Report Document Preview Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex-1 flex flex-col text-xs">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-4 mb-4 flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              Công ty Cổ phần Sữa Việt Nam (Vinamilk)
            </div>
            <h3 className="text-base font-bold text-slate-800 mt-1">
              {reportDocumentTitle}
            </h3>
            <p className="text-slate-500 mt-0.5">
              Phân hệ quản trị: AMIS ESG Monitoring • Đơn vị lập biểu: {reportScopeName}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-600">
              <span className="font-semibold text-teal-700">Kỳ kiểm kê: {currentPeriodConfig.label}</span>
              <span>•</span>
              <span className="text-slate-500">Chu kỳ định mức: {currentRoleConfig.evalPeriodLabel}</span>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-400 font-mono">
            <div>Mã biểu mẫu: {formCode}</div>
            <div>Ngày lập biểu: 19/10/2026</div>
            <div>Trạng thái: Đã phê duyệt</div>
          </div>
        </div>

        {/* Detailed KPI Table in Report */}
        <div className="overflow-x-auto flex-1 my-2">
          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center">STT</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Chỉ tiêu kiểm kê môi trường</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Đơn vị tính</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-right">Lượng tiêu thụ thực tế</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-right">Định mức cho phép</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center">Tỷ lệ hoàn thành</th>
                <th className="py-2.5 px-3 text-center">Đánh giá tuân thủ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 text-center border-r border-slate-200 font-mono">1</td>
                <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">
                  Điện năng tiêu thụ (Scope 2 gián tiếp từ lưới điện)
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-medium">{powerDisplayUnit}</td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                  {powerDisplayVal}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono text-slate-500">
                  {powerQuotaVal}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-emerald-700 font-bold">
                  89.3%
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đạt chuẩn ISO 50001
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 text-center border-r border-slate-200 font-mono">2</td>
                <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">
                  Phát thải khí nhà kính (Scope 1 trực tiếp lò hơi & Scope 2)
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-medium">{co2DisplayUnit}</td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                  {co2DisplayVal}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono text-slate-500">
                  {co2QuotaVal}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-emerald-700 font-bold">
                  86.2%
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đạt hạn ngạch GHG
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 text-center border-r border-slate-200 font-mono">3</td>
                <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">
                  Lưu lượng nước thải sản xuất qua trạm xử lý MBR
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-medium">m³</td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                  {waterDisplayVal}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono text-slate-500">
                  {waterQuotaVal}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-emerald-700 font-bold">
                  80.0%
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đạt chuẩn QCVN 40 Cột A
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Regulatory & Horizon Note */}
        <div className="my-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-[11.5px] text-slate-600">
          <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">Căn cứ định mức & Chu kỳ đánh giá: </strong>
            <span>{currentRoleConfig.rationale}</span>
          </div>
        </div>

        {/* Signatures Dynamic by Role */}
        <div className="pt-6 grid grid-cols-3 gap-6 text-center text-xs text-slate-600 mt-auto">
          {role === 'bod' && (
            <>
              <div>
                <div className="font-bold text-slate-800">Người lập biểu</div>
                <div className="text-[11px] text-slate-400 mt-0.5">(Ký & ghi rõ họ tên)</div>
                <div className="mt-8 font-medium text-slate-700">Nguyễn Văn An</div>
                <div className="text-[10px] text-slate-400">Chuyên viên ESG & KNK Cấp cao</div>
              </div>
              <div>
                <div className="font-bold text-slate-800">Phụ trách Môi trường & HSE</div>
                <div className="text-[11px] text-slate-400 mt-0.5">(Ký & ghi rõ họ tên)</div>
                <div className="mt-8 font-medium text-slate-700">Trần Quốc Bảo</div>
                <div className="text-[10px] text-slate-400">Giám đốc Khối HSE Tập đoàn</div>
              </div>
              <div>
                <div className="font-bold text-slate-800">Đại diện Ban Giám đốc</div>
                <div className="text-[11px] text-slate-400 mt-0.5">(Ký tên & Đóng dấu)</div>
                <div className="mt-8 font-medium text-slate-700">Mai Kiều Liên</div>
                <div className="text-[10px] text-slate-400">Tổng Giám đốc Tập đoàn Vinamilk</div>
              </div>
            </>
          )}

          {role === 'factory_director' && (
            <>
              <div>
                <div className="font-bold text-slate-800">Người lập biểu</div>
                <div className="text-[11px] text-slate-400 mt-0.5">(Ký & ghi rõ họ tên)</div>
                <div className="mt-8 font-medium text-slate-700">Lê Hoàng Phúc</div>
                <div className="text-[10px] text-slate-400">Kỹ sư Quản lý Năng lượng NM</div>
              </div>
              <div>
                <div className="font-bold text-slate-800">Trưởng phòng Kỹ thuật Cơ điện</div>
                <div className="text-[11px] text-slate-400 mt-0.5">(Ký & ghi rõ họ tên)</div>
                <div className="mt-8 font-medium text-slate-700">Phạm Minh Quân</div>
                <div className="text-[10px] text-slate-400">Trưởng phòng Kỹ thuật NM</div>
              </div>
              <div>
                <div className="font-bold text-slate-800">Giám đốc Nhà máy</div>
                <div className="text-[11px] text-slate-400 mt-0.5">(Ký tên & Đóng dấu)</div>
                <div className="mt-8 font-medium text-slate-700">Nguyễn Quốc Hưng</div>
                <div className="text-[10px] text-slate-400">Giám đốc NM Sữa Việt Nam</div>
              </div>
            </>
          )}

          {role === 'workshop_lead' && (
            <>
              <div>
                <div className="font-bold text-slate-800">Người ghi chép số liệu</div>
                <div className="text-[11px] text-slate-400 mt-0.5">(Ký & ghi rõ họ tên)</div>
                <div className="mt-8 font-medium text-slate-700">Hoàng Văn Nam</div>
                <div className="text-[10px] text-slate-400">Kỹ thuật viên Vận hành ca</div>
              </div>
              <div>
                <div className="font-bold text-slate-800">Tổ trưởng Cơ điện Phân xưởng</div>
                <div className="text-[11px] text-slate-400 mt-0.5">(Ký & ghi rõ họ tên)</div>
                <div className="mt-8 font-medium text-slate-700">Đỗ Tuấn Kiệt</div>
                <div className="text-[10px] text-slate-400">Tổ trưởng Bảo trì Thiết bị</div>
              </div>
              <div>
                <div className="font-bold text-slate-800">Quản đốc Phân xưởng</div>
                <div className="text-[11px] text-slate-400 mt-0.5">(Ký xác nhận)</div>
                <div className="mt-8 font-medium text-slate-700">Trần Thanh Hải</div>
                <div className="text-[10px] text-slate-400">Quản đốc PX Chế biến sữa tiệt trùng</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

