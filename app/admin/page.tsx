'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEMO_PROFILES } from '@/lib/mock/initial-data';
import { 
  ArrowLeft, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  Clock, 
  HeartHandshake,
  Coins,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { alerts, reviews } = useApp();

  const totalAlerts = alerts.length;
  const completedAlerts = alerts.filter(a => a.status === 'completed').length;
  const acceptedAlerts = alerts.filter(a => a.status !== 'searching' && a.status !== 'cancelled').length;
  const resolutionRate = totalAlerts > 0 ? Math.round((acceptedAlerts / totalAlerts) * 100) : 100;
  
  const totalRewards = alerts.reduce((acc, a) => acc + a.reward_amount, 0);
  const avgReward = totalAlerts > 0 ? Math.round(totalRewards / totalAlerts) : 10;

  return (
    <div className="min-h-screen bg-cream-50 pb-28 px-4 pt-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/profile')}
            className="p-2 rounded-full hover:bg-cream-200 text-warmgray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            👑 Dashboard Administration Admin
          </span>
          <div className="w-8" />
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-white border-cream-200 shadow-sm">
            <div className="flex items-center gap-2 text-nature-700 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Taux d'acceptation</span>
            </div>
            <span className="text-2xl font-black text-nature-950">{resolutionRate}%</span>
            <span className="text-[10px] text-warmgray-500 block mt-0.5">{acceptedAlerts} sur {totalAlerts} missions</span>
          </Card>

          <Card className="p-4 bg-white border-cream-200 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <HeartHandshake className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Animaux Sauvés</span>
            </div>
            <span className="text-2xl font-black text-emerald-900">115 🌿</span>
            <span className="text-[10px] text-warmgray-500 block mt-0.5">Capturés &amp; relâchés</span>
          </Card>

          <Card className="p-4 bg-white border-cream-200 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Récompense Moy.</span>
            </div>
            <span className="text-2xl font-black text-amber-950">{avgReward} CHF</span>
            <span className="text-[10px] text-warmgray-500 block mt-0.5">Gratification libre</span>
          </Card>

          <Card className="p-4 bg-white border-cream-200 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Temps Moyen</span>
            </div>
            <span className="text-2xl font-black text-blue-950">7.5 min</span>
            <span className="text-[10px] text-warmgray-500 block mt-0.5">Avant arrivée helper</span>
          </Card>
        </div>

        {/* RECENT USERS LOG */}
        <Card className="p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-nature-900 uppercase tracking-wider flex items-center justify-between">
            <span>Membres Démo Actifs</span>
            <span className="text-[10px] text-warmgray-500 font-normal">Lausanne Region</span>
          </h3>

          <div className="space-y-2 text-xs">
            {Object.values(DEMO_PROFILES).map((usr) => (
              <div key={usr.id} className="flex items-center justify-between p-2.5 rounded-xl bg-cream-100 border border-cream-200">
                <div className="flex items-center gap-2.5">
                  <img src={usr.avatar_url} alt={usr.first_name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <span className="font-extrabold text-nature-900 block">{usr.first_name} {usr.last_name}</span>
                    <span className="text-[10px] text-warmgray-500">{usr.city} • {usr.is_helper ? 'Helper' : 'Demandeur'}</span>
                  </div>
                </div>
                <span className="font-bold text-amber-900">⭐ {usr.rating}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ALERTS SYSTEM LOG */}
        <Card className="p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-nature-900 uppercase tracking-wider">
            Journal des Alertes en Temps Réel
          </h3>

          <div className="space-y-2 text-xs">
            {alerts.map((alt) => (
              <div key={alt.id} className="p-3 rounded-2xl border border-cream-200 bg-white flex items-center justify-between">
                <div>
                  <span className="font-bold text-nature-950 block">{alt.category} ({alt.room})</span>
                  <span className="text-[10px] text-warmgray-500">{alt.approximate_location} • 💰 {alt.reward_amount} CHF</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-nature-100 text-nature-800 rounded-full">
                  {alt.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
