'use client';

import React, { useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { Sidebar } from '@/components/Sidebar';
import { AppsLauncherModal } from '@/components/AppsLauncherModal';
import { StatsCards } from '@/components/StatsCards';
import { MainWorkspace } from '@/components/MainWorkspace';
import { ESGSimulationProvider } from '@/context/ESGSimulationContext';
import { SimulationControlPanel } from '@/components/esg/SimulationControlPanel';
import { ESGDashboard } from '@/components/esg/ESGDashboard';
import { ESGRealtimeMonitor } from '@/components/esg/ESGRealtimeMonitor';
import { ESGFacilitiesView } from '@/components/esg/ESGFacilitiesView';
import { ESGAlertsFullView } from '@/components/esg/ESGAlertsFullView';
import { ESGReportsView } from '@/components/esg/ESGReportsView';
import { ESGToast } from '@/components/esg/ESGToast';
import { RefreshCw, SlidersHorizontal, Plus } from 'lucide-react';

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAppsModalOpen, setIsAppsModalOpen] = useState(false);
  const [activeNavId, setActiveNavId] = useState('esg-dashboard');

  const navLabels: Record<string, string> = {
    dashboard: 'Bàn làm việc tổng quan',
    'esg-dashboard': 'Tổng quan Năng lượng & Phát thải ESG',
    'esg-realtime': 'Giám sát Cảm biến Thời gian thực',
    'esg-facilities': 'Danh mục Cơ sở & Thiết bị Vinamilk',
    'esg-alerts': 'Quản trị Cảnh báo & Ngưỡng An toàn',
    'esg-reports': 'Báo cáo Kiểm toán ESG & Phát thải',
    accounting: 'Kế toán tổng hợp',
    cash: 'Tiền mặt & Ngân hàng',
    sales: 'Bán hàng & Công nợ',
    purchase: 'Mua hàng & Nhà cung cấp',
    inventory: 'Quản lý Kho & Vật tư',
    hrm: 'Quản trị Nhân sự (HRM)',
    payroll: 'Chấm công - Tiền lương',
    tasks: 'Quản lý Công việc & Dự án',
    workflows: 'Quy trình xét duyệt',
    reports: 'Báo cáo phân tích',
    settings: 'Thiết lập hệ thống',
  };

  const navSubtitles: Record<string, string> = {
    dashboard: 'Tổng quan chỉ số điều hành, hồ sơ chờ duyệt và cảnh báo doanh nghiệp',
    'esg-dashboard': 'Kiểm soát lưu lượng điện, phát thải CO2 và nước thải phân cấp theo vai trò quản trị',
    'esg-realtime': 'Đo lường trực tuyến từng thiết bị sản xuất với dữ liệu vi mô theo giây',
    'esg-facilities': 'Quản lý định mức, thông số kỹ thuật và nhãn đo lường cho các tài sản máy móc',
    'esg-alerts': 'Nhật ký các sự cố vượt định mức và cấu hình giới hạn an toàn QCVN',
    'esg-reports': 'Mẫu biểu kiểm kê khí nhà kính và báo cáo phát triển bền vững theo chuẩn kiểm toán',
    accounting: 'Sổ sách, chứng từ kế toán và hạch toán phát sinh',
    cash: 'Theo dõi dòng tiền thu chi, số dư quỹ tiền mặt và tài khoản ngân hàng',
    sales: 'Đơn hàng, hợp đồng kinh tế và theo dõi công nợ khách hàng',
    purchase: 'Đơn mua hàng, nhập kho và công nợ phải trả nhà cung cấp',
    inventory: 'Nhập xuất tồn kho, định mức tồn và điều chuyển vật tư',
    hrm: 'Hồ sơ nhân viên, hợp đồng lao động và cơ cấu phòng ban',
    payroll: 'Bảng chấm công tổng hợp, tính lương và trích nộp bảo hiểm',
    tasks: 'Tiến độ công việc, dự án trọng điểm và phân công nhiệm vụ',
    workflows: 'Danh sách các luồng phê duyệt và hồ sơ đề xuất nội bộ',
    reports: 'Hệ thống báo cáo tài chính, quản trị và phân tích dữ liệu chuyên sâu',
    settings: 'Cấu hình danh mục tài khoản, người dùng và phân quyền phân hệ',
  };

  const isEsgNav = activeNavId.startsWith('esg-');

  return (
    <ESGSimulationProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f4f5f8] relative">
        {/* Toast Notification Container */}
        <ESGToast />

        {/* Thanh điều hướng trên cùng (Topbar MISA AMIS) */}
        <Topbar onToggleAppsModal={() => setIsAppsModalOpen(!isAppsModalOpen)} />

        {/* Thân ứng dụng: Sidebar nghiệp vụ + Không gian làm việc */}
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            activeId={activeNavId}
            onSelectNav={(id) => setActiveNavId(id)}
          />

          {/* Khu vực làm việc chính */}
          <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 gap-4">
            {/* Phân hệ ESG */}
            {activeNavId === 'esg-dashboard' && <ESGDashboard />}
            {activeNavId === 'esg-realtime' && <ESGRealtimeMonitor />}
            {activeNavId === 'esg-facilities' && <ESGFacilitiesView />}
            {activeNavId === 'esg-alerts' && <ESGAlertsFullView />}
            {activeNavId === 'esg-reports' && <ESGReportsView />}

            {/* Các phân hệ thông thường của MISA AMIS */}
            {!isEsgNav && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                  <div>
                    <h1 className="text-[20px] md:text-[22px] font-bold text-slate-800 tracking-tight">
                      {navLabels[activeNavId] || 'Bàn làm việc tổng quan'}
                    </h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">
                      {navSubtitles[activeNavId] || 'Hệ thống quản trị doanh nghiệp hợp nhất'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert('Đang làm mới dữ liệu hệ thống...')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Làm mới</span>
                    </button>
                    <button
                      onClick={() => alert('Mở bảng tùy biến chỉ số hiển thị')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tùy biến</span>
                    </button>
                    <button
                      onClick={() => alert('Thêm chứng từ / nghiệp vụ mới')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium text-white bg-[#0075c0] hover:bg-[#005a96] rounded-lg transition-colors shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm nhanh</span>
                    </button>
                  </div>
                </div>

                <StatsCards />

                <MainWorkspace
                  activeNavId={activeNavId}
                  navTitle={navLabels[activeNavId] || 'Nghiệp vụ'}
                />
              </>
            )}
          </main>
        </div>

        {/* Khay mở nhanh ứng dụng hệ sinh thái MISA AMIS (Launcher 9 chấm) */}
        <AppsLauncherModal
          isOpen={isAppsModalOpen}
          onClose={() => setIsAppsModalOpen(false)}
        />

        {/* Bảng điều khiển mô phỏng & Kiểm thử phân quyền nổi ở dưới đáy màn hình */}
        <SimulationControlPanel />
      </div>
    </ESGSimulationProvider>
  );
}
