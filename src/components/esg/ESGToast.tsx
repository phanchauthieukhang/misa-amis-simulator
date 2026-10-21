'use client';

import React from 'react';
import { useESGSimulation } from '@/context/ESGSimulationContext';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export const ESGToast: React.FC = () => {
  const { toast, dismissToast } = useESGSimulation();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-teal-500" />;
    }
  };

  const getBorder = () => {
    switch (toast.type) {
      case 'danger':
        return 'border-red-400 bg-red-50/95 text-red-950';
      case 'warning':
        return 'border-amber-400 bg-amber-50/95 text-amber-950';
      case 'success':
        return 'border-emerald-400 bg-emerald-50/95 text-emerald-950';
      default:
        return 'border-teal-400 bg-teal-50/95 text-teal-950';
    }
  };

  return (
    <div className="fixed top-16 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-3 fade-in duration-200">
      <div className={`p-4 rounded-xl shadow-xl border backdrop-blur-md flex items-start justify-between gap-3 ${getBorder()}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
          <div>
            <div className="font-bold text-xs uppercase tracking-wider">{toast.title}</div>
            <p className="text-xs mt-0.5 leading-relaxed opacity-90">{toast.message}</p>
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
