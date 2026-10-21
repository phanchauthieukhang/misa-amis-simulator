'use client';

import React from 'react';
import {
  Wallet,
  Receipt,
  Users,
  ClipboardList,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { StatItemType } from '@/types';

const defaultStats: StatItemType[] = [
  {
    id: 'revenue',
    label: 'Doanh thu tháng này',
    value: '1.458.000.000 đ',
    trend: '+12.4% so với tháng trước',
    trendType: 'up',
    icon: 'wallet',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    id: 'debt',
    label: 'Công nợ phải thu',
    value: '324.500.000 đ',
    trend: '-4.8% (đã thu hồi)',
    trendType: 'down',
    icon: 'receipt',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'employees',
    label: 'Tổng nhân sự hoạt động',
    value: '128 nhân sự',
    trend: 'Chấm công đủ 98%',
    trendType: 'neutral',
    icon: 'users',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'tasks',
    label: 'Công việc cần xử lý',
    value: '14 nhiệm vụ',
    trend: '3 việc sắp đến hạn',
    trendType: 'up',
    icon: 'tasks',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
];

export const StatsCards: React.FC = () => {
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'wallet':
        return <Wallet className="w-5 h-5" />;
      case 'receipt':
        return <Receipt className="w-5 h-5" />;
      case 'users':
        return <Users className="w-5 h-5" />;
      case 'tasks':
        return <ClipboardList className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {defaultStats.map((stat) => (
        <div
          key={stat.id}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow transition-shadow flex items-center justify-between"
        >
          <div>
            <div className="text-[13px] font-medium text-slate-500">
              {stat.label}
            </div>
            <div className="text-[20px] font-bold text-slate-800 mt-1">
              {stat.value}
            </div>
            <div
              className={`text-xs mt-1.5 flex items-center gap-1 font-medium ${
                stat.trendType === 'up'
                  ? stat.id === 'tasks' ? 'text-amber-600' : 'text-emerald-600'
                  : stat.trendType === 'down'
                  ? 'text-emerald-600'
                  : 'text-slate-500'
              }`}
            >
              {stat.trendType === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {stat.trendType === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              <span>{stat.trend}</span>
            </div>
          </div>

          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}
          >
            {renderIcon(stat.icon)}
          </div>
        </div>
      ))}
    </div>
  );
};
