'use client';

import React from 'react';
import { DollarSign, TrendingDown, AlertTriangle, Sparkles, FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import { useESGSimulation } from '@/context/ESGSimulationContext';

export const ESGFinancialImpactWidget: React.FC = () => {
  const { scopedTotals, navigateTo } = useESGSimulation();

  // Accounting calculations based on scoped consumption
  // EVN industrial tariff averages ~1,850 VND/kWh across 3 time slots
  const estElectricityCostVND = Math.round(scopedTotals.powerKWh * 1850);

  // Peak-hour surcharge (~13.5% of total power cost from 09:30-11:30 & 17:00-20:00)
  const peakHourSurchargeVND = Math.round(estElectricityCostVND * 0.135);

  // Carbon ETS provision (~120,000 VND / ton CO2e)
  const carbonOffsetProvisionVND = Math.round((scopedTotals.co2Kg / 1000) * 120000);

  // Green Energy Cost Savings (34.8% self-generated from Solar Rooftop & Biomass)
  const greenEnergySavingsVND = Math.round(scopedTotals.powerKWh * 0.348 * 1850);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-600" />
              Tác động Tài chính & Chi phí Năng lượng
            </h3>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
              MISA AMIS ERP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dự toán chi phí tiền điện EVN 3 giá và dự phòng rủi ro tuân thủ tín chỉ Carbon
          </p>
        </div>

        {/* Ledger Tag */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
          <span>Hạch toán: <strong className="text-slate-800 font-mono">TK 627 / 642</strong></span>
        </div>
      </div>

      {/* 4 Financial Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-3">
        {/* Metric 1: Total Estimated Power Bill */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Chi phí tiền điện ước tính</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1 rounded">EVN 3 giá</span>
            </div>
            <div className="text-lg font-extrabold text-slate-800 font-mono mt-1">
              {estElectricityCostVND.toLocaleString('vi-VN')}{' '}
              <span className="text-xs font-normal text-slate-500">VNĐ</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
            <span>Đơn giá bình quân:</span>
            <span className="font-mono font-semibold text-slate-700">1.850 đ/kWh</span>
          </div>
        </div>

        {/* Metric 2: Peak Hour Surcharge */}
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-800">
              <span className="font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Phụ phí giờ cao điểm
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-bold">13.5%</span>
            </div>
            <div className="text-lg font-extrabold text-amber-900 font-mono mt-1">
              {peakHourSurchargeVND.toLocaleString('vi-VN')}{' '}
              <span className="text-xs font-normal text-amber-700">VNĐ</span>
            </div>
          </div>
          <div className="text-[11px] text-amber-800 mt-2 pt-1.5 border-t border-amber-200/60 flex items-center justify-between">
            <span>Khung cao điểm:</span>
            <span className="font-mono font-semibold text-amber-900">3.076 đ/kWh</span>
          </div>
        </div>

        {/* Metric 3: Carbon Offset Provision */}
        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-rose-800">
              <span className="font-medium">Dự phòng hạn ngạch Carbon</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-1 rounded font-bold">ETS</span>
            </div>
            <div className="text-lg font-extrabold text-rose-900 font-mono mt-1">
              {carbonOffsetProvisionVND.toLocaleString('vi-VN')}{' '}
              <span className="text-xs font-normal text-rose-700">VNĐ</span>
            </div>
          </div>
          <div className="text-[11px] text-rose-800 mt-2 pt-1.5 border-t border-rose-200/60 flex items-center justify-between">
            <span>Đơn giá tín chỉ:</span>
            <span className="font-mono font-semibold text-rose-900">120.000 đ/tấn</span>
          </div>
        </div>

        {/* Metric 4: Green Energy Savings */}
        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-800">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Tiết kiệm từ NL xanh
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">Đã trừ</span>
            </div>
            <div className="text-lg font-extrabold text-emerald-700 font-mono mt-1">
              +{greenEnergySavingsVND.toLocaleString('vi-VN')}{' '}
              <span className="text-xs font-normal text-emerald-600">VNĐ</span>
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 pt-1.5 border-t border-emerald-200/60 flex items-center justify-between">
            <span>Hiệu quả tự cấp:</span>
            <span className="font-mono font-semibold text-emerald-800">34.8% năng lượng</span>
          </div>
        </div>
      </div>

      {/* Footer Advisory & Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Khuyến nghị MISA: Dịch chuyển phụ tải ca chạy máy UHT sang giờ thấp điểm (22h-04h) giúp tiết kiệm thêm ~12% chi phí điện.
          </span>
        </div>
        <button
          onClick={() => navigateTo('accounting')}
          className="text-teal-700 hover:text-teal-800 font-semibold inline-flex items-center gap-1 transition-colors self-end sm:self-auto shrink-0 cursor-pointer"
        >
          <span>Xem chứng từ kế toán MISA AMIS</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
