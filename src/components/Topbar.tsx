'use client';

import React from 'react';
import {
  Grid,
  Search,
  Building2,
  ChevronDown,
  PlusCircle,
  Bell,
  HelpCircle,
  Settings,
} from 'lucide-react';

interface TopbarProps {
  onToggleAppsModal: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleAppsModal }) => {
  return (
    <header className="h-[52px] bg-[#0075c0] text-white flex items-center justify-between px-4 z-50 shadow-md flex-shrink-0 select-none">
      {/* Topbar Left: App Launcher & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleAppsModal}
          className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-white/20 transition-colors"
          title="Hệ sinh thái ứng dụng MISA AMIS (9 chấm)"
        >
          <Grid className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-[18px] font-bold tracking-wide">MISA AMIS</span>
          <span className="text-[11px] font-medium bg-white/20 px-1.5 py-0.5 rounded text-white/90">
            Platform
          </span>
        </div>
      </div>

      {/* Topbar Center: Global Search */}
      <div className="flex-1 max-w-[460px] mx-6">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-white/70 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm tính năng, tài liệu, nghiệp vụ (Ctrl + K)..."
            className="w-full h-[34px] bg-white/15 hover:bg-white/20 focus:bg-white focus:text-slate-800 text-white placeholder-white/70 text-[13px] rounded-full pl-9 pr-4 border border-white/25 focus:border-white outline-none transition-all"
          />
        </div>
      </div>

      {/* Topbar Right: Actions, Branch, Profile */}
      <div className="flex items-center gap-2">
        {/* Branch / Unit selector */}
        <div
          className="hidden md:flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-md text-[13px] font-medium cursor-pointer transition-colors"
          title="Chuyển đổi chi nhánh / đơn vị"
        >
          <Building2 className="w-4 h-4" />
          <span className="max-w-[200px] truncate">Công ty CP MISA - Trụ sở chính</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-80" />
        </div>

        {/* Quick Add Button */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          title="Thêm nhanh chứng từ / công việc"
        >
          <PlusCircle className="w-[19px] h-[19px]" />
        </button>

        {/* Notifications */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors relative"
          title="Thông báo hệ thống"
        >
          <Bell className="w-[19px] h-[19px]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0075c0]"></span>
        </button>

        {/* Help Center */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          title="Trợ giúp & Hướng dẫn"
        >
          <HelpCircle className="w-[19px] h-[19px]" />
        </button>

        {/* Settings */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          title="Thiết lập hệ thống"
        >
          <Settings className="w-[19px] h-[19px]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 ml-1 cursor-pointer hover:bg-white/15 py-1 px-2 rounded-md transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0075c0] font-bold text-xs flex items-center justify-center border border-white">
            NV
          </div>
          <span className="text-[13px] font-medium hidden sm:inline-block">Nguyễn Văn A</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-80" />
        </div>
      </div>
    </header>
  );
};
