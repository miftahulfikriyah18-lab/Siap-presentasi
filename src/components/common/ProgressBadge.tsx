import React from 'react';
import { StudentReadyStatus, PracticeStatus } from '../../types';

interface StatusBadgeProps {
  status: StudentReadyStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-bold px-3.5 py-1.5',
  }[size];

  switch (status) {
    case 'siap':
      return (
        <span
          id="badge-status-siap"
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          SIAP PRESENTASI
        </span>
      );
    case 'sedang_proses':
      return (
        <span
          id="badge-status-proses"
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          SEDANG PROSES
        </span>
      );
    case 'perlu_dilengkapi':
      return (
        <span
          id="badge-status-perlu-lengkap"
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          PERLU DILENGKAPI
        </span>
      );
    case 'belum_mulai':
    default:
      return (
        <span
          id="badge-status-belum"
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          BELUM MULAI
        </span>
      );
  }
};

interface StepBadgeProps {
  isComplete: boolean;
  stepNumber: number;
  label?: string;
}

export const StepBadge: React.FC<StepBadgeProps> = ({ isComplete, stepNumber, label }) => {
  if (isComplete) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
        title={`Latihan ${stepNumber} Selesai`}
      >
        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        {label || `L${stepNumber}`}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 border border-slate-200"
      title={`Latihan ${stepNumber} Belum`}
    >
      <span className="w-2.5 h-0.5 bg-slate-300 rounded"></span>
      {label || `L${stepNumber}`}
    </span>
  );
};
