'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Search,
  FileSpreadsheet,
  Eye,
  MoreVertical,
  TrendingUp,
  CreditCard,
  Building,
} from 'lucide-react';

interface MainWorkspaceProps {
  activeNavId: string;
  navTitle: string;
}

// Sample approval requests typical in MISA AMIS (AMIS Quy trình / Điều hành)
const mockApprovals = [
  {
    id: 'YC-2026-089',
    title: 'Đề nghị tạm ứng chi phí công tác quý IV',
    sender: 'Trần Thị Thu Thảo',
    department: 'Phòng Kinh doanh',
    amount: '15.000.000 đ',
    date: '19/10/2026 09:30',
    type: 'Chi tạm ứng',
    status: 'pending',
  },
  {
    id: 'YC-2026-088',
    title: 'Phê duyệt hợp đồng mua sắm thiết bị máy tính văn phòng',
    sender: 'Lê Hoàng Nam',
    department: 'Phòng Hành chính - IT',
    amount: '48.500.000 đ',
    date: '18/10/2026 15:45',
    type: 'Mua sắm tài sản',
    status: 'pending',
  },
  {
    id: 'YC-2026-085',
    title: 'Đơn xin nghỉ phép năm (3 ngày)',
    sender: 'Nguyễn Minh Quân',
    department: 'Phòng Kỹ thuật & R&D',
    amount: '—',
    date: '18/10/2026 10:15',
    type: 'Nghỉ phép',
    status: 'approved',
  },
  {
    id: 'YC-2026-082',
    title: 'Thanh toán tiền điện chiếu sáng & hạ tầng viễn thông T10',
    sender: 'Phạm Thị Lan',
    department: 'Phòng Kế toán',
    amount: '12.430.000 đ',
    date: '17/10/2026 14:20',
    type: 'Chi phí vận hành',
    status: 'approved',
  },
];

// Sample ledger / transactions for business modules
const mockLedgerItems = [
  {
    code: 'PC00192',
    date: '19/10/2026',
    partner: 'Công ty TNHH Giải pháp Công nghệ Việt',
    reason: 'Chi trả tiền dịch vụ bảo trì máy chủ quý III',
    amount: '22.000.000 đ',
    account: '1121 / 331',
    status: 'Đã ghi sổ',
  },
  {
    code: 'PT00451',
    date: '19/10/2026',
    partner: 'Tập đoàn Bán lẻ Á Châu',
    reason: 'Thu tiền bán hàng đợt 2 theo hợp đồng HD-89',
    amount: '145.000.000 đ',
    account: '1111 / 131',
    status: 'Đã ghi sổ',
  },
  {
    code: 'UNC0078',
    date: '18/10/2026',
    partner: 'Chi nhánh Ngân hàng Ngoại thương (VCB)',
    reason: 'Ủy nhiệm chi chuyển khoản thanh toán tiền thuê văn phòng',
    amount: '65.000.000 đ',
    account: '1121 / 331',
    status: 'Chờ duyệt',
  },
  {
    code: 'XK00093',
    date: '18/10/2026',
    partner: 'Kho Tổng KCN Tân Bình',
    reason: 'Xuất kho thành phẩm theo lệnh sản xuất LSX-10',
    amount: '89.500.000 đ',
    account: '632 / 155',
    status: 'Đã ghi sổ',
  },
  {
    code: 'HD00982',
    date: '17/10/2026',
    partner: 'Công ty CP Đầu tư Thương mại Sài Gòn',
    reason: 'Hóa đơn giá trị gia tăng dịch vụ tư vấn triển khai',
    amount: '38.500.000 đ',
    account: '131 / 511, 3331',
    status: 'Đã ghi sổ',
  },
];

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  activeNavId,
  navTitle,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Tháng này');
  const [activeTab, setActiveTab] = useState<'pending' | 'activities' | 'chart'>('pending');

  const isDashboard = activeNavId === 'dashboard';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col flex-1 overflow-hidden min-h-[480px]">
      {/* Workspace Sub-header & Action Toolbar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Kỳ báo cáo:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="Hôm nay">Hôm nay</option>
              <option value="Tuần này">Tuần này</option>
              <option value="Tháng này">Tháng này</option>
              <option value="Quý này">Quý này</option>
              <option value="Năm nay">Năm nay</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Đơn vị: Toàn công ty</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            onClick={() => alert('Đang xuất tệp dữ liệu...')}
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất dữ liệu</span>
          </button>

          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#0075c0] hover:bg-[#005a96] rounded-lg transition-colors shadow-2xs"
            onClick={() => alert(`Thêm chứng từ / nghiệp vụ mới trong phân hệ ${navTitle}`)}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm chứng từ</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {isDashboard ? (
        /* ================= VIEW: BÀN LÀM VIỆC TỔNG QUAN (DASHBOARD) ================= */
        <div className="p-5 flex-1 flex flex-col gap-5 overflow-y-auto">
          {/* Quick Tabs: Cần duyệt / Hoạt động gần đây */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`text-[13.5px] font-semibold pb-2 -mb-2 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'pending'
                    ? 'border-[#0075c0] text-[#0075c0]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Hồ sơ cần phê duyệt</span>
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  2
                </span>
              </button>

              <button
                onClick={() => setActiveTab('activities')}
                className={`text-[13.5px] font-semibold pb-2 -mb-2 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'activities'
                    ? 'border-[#0075c0] text-[#0075c0]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Giao dịch phát sinh gần đây</span>
              </button>

              <button
                onClick={() => setActiveTab('chart')}
                className={`text-[13.5px] font-semibold pb-2 -mb-2 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'chart'
                    ? 'border-[#0075c0] text-[#0075c0]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Tình hình tài chính nhanh</span>
              </button>
            </div>

            <button className="text-xs text-[#0075c0] hover:underline font-medium flex items-center gap-0.5">
              <span>Xem toàn bộ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tab 1: Approval Requests */}
          {activeTab === 'pending' && (
            <div className="flex flex-col gap-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                      <th className="py-2.5 px-3">Mã yêu cầu</th>
                      <th className="py-2.5 px-3">Nội dung đề xuất</th>
                      <th className="py-2.5 px-3">Người đề xuất</th>
                      <th className="py-2.5 px-3">Phòng ban</th>
                      <th className="py-2.5 px-3 text-right">Số tiền</th>
                      <th className="py-2.5 px-3">Thời gian</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                      <th className="py-2.5 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {mockApprovals.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#0075c0]">
                          {item.id}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {item.title}
                          <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                            Phân loại: {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-3">{item.sender}</td>
                        <td className="py-3 px-3 text-slate-500">{item.department}</td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-800">
                          {item.amount}
                        </td>
                        <td className="py-3 px-3 text-slate-500">{item.date}</td>
                        <td className="py-3 px-3 text-center">
                          {item.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Chờ phê duyệt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Đã duyệt
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {item.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => alert(`Đã phê duyệt ${item.id}`)}
                                className="px-2.5 py-1 text-xs font-medium text-white bg-[#0075c0] hover:bg-[#005a96] rounded transition-colors"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => alert(`Xem chi tiết hồ sơ ${item.id}`)}
                                className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                              >
                                Chi tiết
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => alert(`Xem chi tiết hồ sơ ${item.id}`)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                            >
                              Xem lại
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Recent transactions */}
          {activeTab === 'activities' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                    <th className="py-2.5 px-3">Số chứng từ</th>
                    <th className="py-2.5 px-3">Ngày hạch toán</th>
                    <th className="py-2.5 px-3">Đối tượng</th>
                    <th className="py-2.5 px-3">Diễn giải</th>
                    <th className="py-2.5 px-3">Tài khoản Nợ/Có</th>
                    <th className="py-2.5 px-3 text-right">Số tiền</th>
                    <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {mockLedgerItems.map((row) => (
                    <tr key={row.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#0075c0]">{row.code}</td>
                      <td className="py-3 px-3">{row.date}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">{row.partner}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-[260px] truncate">{row.reason}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono">{row.account}</td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-800">{row.amount}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Quick Financial Status */}
          {activeTab === 'chart' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Cơ cấu chi phí theo bộ phận ({selectedPeriod})
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Khối Kinh doanh & Marketing</span>
                      <span className="font-semibold text-slate-800">42% (612.000.000 đ)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0075c0] h-full rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Khối Vận hành & Sản xuất</span>
                      <span className="font-semibold text-slate-800">35% (510.300.000 đ)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Khối Hành chính & Nhân sự</span>
                      <span className="font-semibold text-slate-800">23% (335.700.000 đ)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Cảnh báo hạn thanh toán & Rủi ro
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2 mt-3">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>Có <strong>03 hợp đồng bán hàng</strong> sắp đến hạn thanh toán trong 5 ngày tới.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Tất cả các tờ khai thuế GTGT tháng trước đã được nộp thành công.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-200 mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Cập nhật: Hôm nay 14:00</span>
                  <button className="text-[#0075c0] font-semibold hover:underline">
                    Xem báo cáo phân tích chi tiết
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= VIEW: PHÂN HỆ NGHIỆP VỤ CHUYÊN BIỆT ================= */
        <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
          {/* Module Filter bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={`Tìm kiếm trong ${navTitle}...`}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#0075c0] w-[260px] transition-colors"
                />
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Bộ lọc</span>
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Tổng số bản ghi: <strong className="text-slate-800">{mockLedgerItems.length}</strong>
            </div>
          </div>

          {/* Module Data Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                  <th className="py-2.5 px-3">Mã chứng từ</th>
                  <th className="py-2.5 px-3">Ngày hạch toán</th>
                  <th className="py-2.5 px-3">Đối tượng</th>
                  <th className="py-2.5 px-3">Diễn giải nội dung</th>
                  <th className="py-2.5 px-3">Tài khoản</th>
                  <th className="py-2.5 px-3 text-right">Số tiền phát sinh</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Chức năng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mockLedgerItems.map((row) => (
                  <tr key={row.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#0075c0]">{row.code}</td>
                    <td className="py-3 px-3 text-slate-600">{row.date}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{row.partner}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-[280px] truncate">{row.reason}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono">{row.account}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800">{row.amount}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1 text-slate-500">
                        <button
                          onClick={() => alert(`Xem chi tiết chứng từ ${row.code}`)}
                          className="p-1 hover:text-[#0075c0] hover:bg-slate-100 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => alert(`Tùy chọn cho chứng từ ${row.code}`)}
                          className="p-1 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Thao tác khác"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
