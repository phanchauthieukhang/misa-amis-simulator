'use client';

import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  BadgeDollarSign,
  ShoppingCart,
  Package,
  Users,
  CalendarCheck,
  CheckSquare,
  BarChart3,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
  Landmark,
  GitBranch,
  Leaf,
  Activity,
  Building2,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { NavGroupType } from '@/types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeId: string;
  onSelectNav: (id: string) => void;
}

const navGroups: NavGroupType[] = [
  {
    title: 'Tổng quan',
    items: [
      { id: 'dashboard', title: 'Bàn làm việc', iconName: 'dashboard' },
    ],
  },
  {
    title: 'Năng lượng & Phát thải (ESG)',
    items: [
      { id: 'esg-dashboard', title: 'Tổng quan ESG', iconName: 'leaf', badge: 'Mới' },
      { id: 'esg-realtime', title: 'Giám sát thời gian thực', iconName: 'activity' },
      { id: 'esg-facilities', title: 'Danh sách cơ sở & thiết bị', iconName: 'building' },
      { id: 'esg-alerts', title: 'Cảnh báo & Ngưỡng an toàn', iconName: 'alert' },
      { id: 'esg-reports', title: 'Báo cáo ESG & Phát thải', iconName: 'report' },
    ],
  },
  {
    title: 'Tài chính - Kế toán',
    items: [
      { id: 'accounting', title: 'Kế toán tổng hợp', iconName: 'accounting' },
      { id: 'cash', title: 'Tiền mặt & Ngân hàng', iconName: 'cash' },
      { id: 'sales', title: 'Bán hàng & Công nợ', iconName: 'sales' },
      { id: 'purchase', title: 'Mua hàng & NCC', iconName: 'purchase' },
      { id: 'inventory', title: 'Quản lý Kho & Vật tư', iconName: 'inventory' },
    ],
  },
  {
    title: 'Nhân sự & Vận hành',
    items: [
      { id: 'hrm', title: 'Hồ sơ nhân sự', iconName: 'hrm' },
      { id: 'payroll', title: 'Chấm công - Tiền lương', iconName: 'payroll' },
      { id: 'tasks', title: 'Công việc & Dự án', iconName: 'tasks' },
      { id: 'workflows', title: 'Quy trình xét duyệt', iconName: 'workflows' },
    ],
  },
  {
    title: 'Báo cáo & Cấu hình',
    items: [
      { id: 'reports', title: 'Báo cáo phân tích', iconName: 'reports' },
      { id: 'settings', title: 'Thiết lập hệ thống', iconName: 'settings' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeId,
  onSelectNav,
}) => {
  const isEsgItem = (id: string) => id.startsWith('esg-');

  const renderIcon = (iconName: string, isEsg: boolean) => {
    const className = `w-[18px] h-[18px] flex-shrink-0 ${
      isEsg ? 'text-teal-400' : ''
    }`;
    switch (iconName) {
      case 'dashboard':
        return <LayoutDashboard className={className} />;
      case 'leaf':
        return <Leaf className={className} />;
      case 'activity':
        return <Activity className={className} />;
      case 'building':
        return <Building2 className={className} />;
      case 'alert':
        return <ShieldAlert className={className} />;
      case 'report':
        return <FileText className={className} />;
      case 'accounting':
        return <Calculator className={className} />;
      case 'cash':
        return <Landmark className={className} />;
      case 'sales':
        return <BadgeDollarSign className={className} />;
      case 'purchase':
        return <ShoppingCart className={className} />;
      case 'inventory':
        return <Package className={className} />;
      case 'hrm':
        return <Users className={className} />;
      case 'payroll':
        return <CalendarCheck className={className} />;
      case 'tasks':
        return <CheckSquare className={className} />;
      case 'workflows':
        return <GitBranch className={className} />;
      case 'reports':
        return <BarChart3 className={className} />;
      case 'settings':
        return <Sliders className={className} />;
      default:
        return <LayoutDashboard className={className} />;
    }
  };

  return (
    <aside
      className={`bg-[#1e2633] text-[#8b9db7] flex flex-col transition-all duration-200 select-none z-40 border-r border-slate-800 ${
        isCollapsed ? 'w-[64px]' : 'w-[240px]'
      }`}
    >
      {/* Sidebar Toggle Button */}
      <div
        onClick={onToggleCollapse}
        className={`h-10 flex items-center border-b border-white/5 cursor-pointer hover:text-white px-4 transition-colors ${
          isCollapsed ? 'justify-center px-0' : 'justify-end'
        }`}
        title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
      >
        {isCollapsed ? (
          <PanelLeftOpen className="w-[18px] h-[18px]" />
        ) : (
          <PanelLeftClose className="w-[18px] h-[18px]" />
        )}
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-4">
        {navGroups.map((group, gIdx) => {
          const isGroupEsg = group.title.includes('ESG');
          return (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div
                  className={`px-4 text-[10.5px] font-semibold uppercase tracking-wider py-1 ${
                    isGroupEsg ? 'text-teal-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  {group.title}
                </div>
              )}
              <ul>
                {group.items.map((item) => {
                  const isActive = activeId === item.id;
                  const itemIsEsg = isEsgItem(item.id);

                  let activeClass = 'bg-[#0075c0] text-white font-medium';
                  if (itemIsEsg) {
                    activeClass = 'bg-teal-600 text-white font-semibold shadow-xs';
                  }

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onSelectNav(item.id)}
                        className={`w-full flex items-center gap-3.5 px-4 py-2.5 text-[13.5px] text-left transition-colors relative ${
                          isCollapsed ? 'justify-center px-0' : ''
                        } ${
                          isActive
                            ? activeClass
                            : itemIsEsg
                            ? 'hover:bg-[#203338] text-slate-300 hover:text-teal-300'
                            : 'hover:bg-[#293445] hover:text-white'
                        }`}
                        title={isCollapsed ? item.title : undefined}
                      >
                        {renderIcon(item.iconName, itemIsEsg)}

                        {!isCollapsed && (
                          <span className="truncate flex-1">
                            {item.title}
                          </span>
                        )}

                        {item.badge && (
                          isCollapsed ? (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-400" />
                          ) : (
                            <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
