import React from 'react';
import { clsx } from 'clsx';
import { UrgencyLevel, AlertStatus } from '@/types';

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel }> = ({ urgency }) => {
  const config = {
    low: { label: '🟢 Pas pressé', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    medium: { label: '🟠 Rapide souhaité', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    high: { label: '🔴 Urgent, je panique', bg: 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse' },
  };

  const item = config[urgency];
  return (
    <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-xs border font-medium", item.bg)}>
      {item.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: AlertStatus }> = ({ status }) => {
  const config: Record<AlertStatus, { label: string; bg: string }> = {
    draft: { label: 'Brouillon', bg: 'bg-gray-100 text-gray-700 border-gray-200' },
    searching: { label: '🔍 En recherche', bg: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' },
    accepted: { label: '🎉 Intervention acceptée', bg: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold' },
    helper_on_way: { label: '🚶 Helper en route', bg: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold' },
    helper_arrived: { label: '📍 Helper arrivé sur place', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold' },
    completed: { label: '✅ Intervention terminée', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' },
    cancelled: { label: 'Annulée', bg: 'bg-gray-100 text-gray-500 border-gray-200' },
    expired: { label: 'Expirée', bg: 'bg-gray-100 text-gray-500 border-gray-200' },
  };

  const item = config[status] || { label: status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };

  return (
    <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-xs border font-medium", item.bg)}>
      {item.label}
    </span>
  );
};

export const RewardBadge: React.FC<{ amount: number; currency?: string }> = ({ amount, currency = 'CHF' }) => {
  if (amount === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        🤝 Gratuit / Entraide
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
      💰 {amount} {currency} proposés
    </span>
  );
};
