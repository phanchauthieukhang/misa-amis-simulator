'use client';

import React from 'react';
import {
  X,
  Calculator,
  Handshake,
  Banknote,
  CalendarClock,
  CheckCircle2,
  GitBranch,
  Boxes,
  ShoppingBag,
  FileText,
  PenTool,
  UserPlus,
  Archive,
} from 'lucide-react';
import { AmisAppType } from '@/types';

interface AppsLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const amisApps: AmisAppType[] = [
  {
    id: 'amis-ke-toan',
    name: 'AMIS Kế toán',
    icon: 'calculator',
    colorGradient: 'from-sky-600 to-sky-800',
  },
  {
    id: 'amis-crm',
    name: 'AMIS CRM',
    icon: 'handshake',
    colorGradient: 'from-amber-500 to-amber-700',
  },
  {
    id: 'amis-tien-luong',
    name: 'AMIS Tiền lương',
    icon: 'banknote',
    colorGradient: 'from-emerald-500 to-emerald-700',
  },
  {
    id: 'amis-cham-cong',
    name: 'AMIS Chấm công',
    icon: 'calendar-clock',
    colorGradient: 'from-indigo-500 to-indigo-700',
  },
  {
    id: 'amis-cong-viec',
    name: 'AMIS Công việc',
    icon: 'check-circle-2',
    colorGradient: 'from-purple-500 to-purple-700',
  },
  {
    id: 'amis-quy-trinh',
    name: 'AMIS Quy trình',
    icon: 'git-branch',
    colorGradient: 'from-pink-500 to-pink-700',
  },
  {
    id: 'amis-kho',
    name: 'AMIS Quản lý Kho',
    icon: 'boxes',
    colorGradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'amis-mua-hang',
    name: 'AMIS Mua hàng',
    icon: 'shopping-bag',
    colorGradient: 'from-teal-500 to-teal-700',
  },
  {
    id: 'meinvoice',
    name: 'meInvoice',
    icon: 'file-text',
    colorGradient: 'from-orange-500 to-orange-700',
  },
  {
    id: 'esign',
    name: 'MISA eSign',
    icon: 'pen-tool',
    colorGradient: 'from-blue-500 to-blue-700',
  },
  {
    id: 'amis-tuyen-dung',
    name: 'AMIS Tuyển dụng',
    icon: 'user-plus',
    colorGradient: 'from-cyan-600 to-cyan-800',
  },
  {
    id: 'amis-tai-san',
    name: 'AMIS Tài sản',
    icon: 'archive',
    colorGradient: 'from-lime-600 to-green-700',
  },
];

export const AppsLauncherModal: React.FC<AppsLauncherModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const renderIcon = (iconName: string) => {
    const iconClass = 'w-6 h-6 text-white';
    switch (iconName) {
      case 'calculator':
        return <Calculator className={iconClass} />;
      case 'handshake':
        return <Handshake className={iconClass} />;
      case 'banknote':
        return <Banknote className={iconClass} />;
      case 'calendar-clock':
        return <CalendarClock className={iconClass} />;
      case 'check-circle-2':
        return <CheckCircle2 className={iconClass} />;
      case 'git-branch':
        return <GitBranch className={iconClass} />;
      case 'boxes':
        return <Boxes className={iconClass} />;
      case 'shopping-bag':
        return <ShoppingBag className={iconClass} />;
      case 'file-text':
        return <FileText className={iconClass} />;
      case 'pen-tool':
        return <PenTool className={iconClass} />;
      case 'user-plus':
        return <UserPlus className={iconClass} />;
      case 'archive':
        return <Archive className={iconClass} />;
      default:
        return <Calculator className={iconClass} />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 top-[52px] bg-slate-900/40 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Popup */}
      <div className="fixed top-[60px] left-3 z-50 w-[580px] max-w-[calc(100vw-24px)] bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Hệ sinh thái ứng dụng MISA AMIS
            </h3>
            <p className="text-xs text-slate-500">
              Truy cập nhanh tất cả nghiệp vụ được cấp quyền
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 columns Grid */}
        <div className="grid grid-cols-4 gap-3 max-h-[70vh] overflow-y-auto pr-1">
          {amisApps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-transparent hover:border-sky-200 transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => {
                alert(`Mở ứng dụng ${app.name}`);
                onClose();
              }}
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${app.colorGradient} flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform`}
              >
                {renderIcon(app.icon)}
              </div>
              <span className="text-[12px] font-medium text-slate-700 group-hover:text-[#0075c0] leading-tight">
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
