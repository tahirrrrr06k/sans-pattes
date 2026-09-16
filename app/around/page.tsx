'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UrgencyBadge, RewardBadge } from '@/components/ui/badge';
import { InteractiveMap } from '@/components/map/interactive-map';
import { MapPin, Filter, ChevronRight, SlidersHorizontal } from 'lucide-react';

export default function AroundMePage() {
  const router = useRouter();
  const { alerts, helperSettings } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const openAlerts = alerts.filter(a => {
    if (a.status !== 'searching') return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-cream-50 pb-28 px-4 pt-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-nature-900 tracking-tight">
              Autour de moi 📍
            </h1>
            <p className="text-xs text-warmgray-600 font-semibold">
              Rayon d'action actif : {helperSettings.max_distance_km} km (Lausanne)
            </p>
          </div>

          <button 
            onClick={() => router.push('/helper/availability')}
            className="p-2.5 rounded-full bg-white border border-cream-300 text-warmgray-700 shadow-sm hover:bg-cream-100"
            aria-label="Réglages rayon"
          >
            <SlidersHorizontal className="w-5 h-5 text-nature-600" />
          </button>
        </div>

        {/* Map */}
        <InteractiveMap alerts={openAlerts} />

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'Araignée', 'Insecte', 'Guêpe / abeille'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                categoryFilter === cat
                  ? 'bg-nature-600 text-white border-nature-600 shadow-sm'
                  : 'bg-white text-warmgray-700 border-cream-200 hover:border-nature-300'
              }`}
            >
              {cat === 'all' ? 'Toutes les bêtes' : cat}
            </button>
          ))}
        </div>

        {/* List of Requests */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold text-nature-900 uppercase tracking-wider">
            Demandes actives ({openAlerts.length})
          </h2>

          {openAlerts.length === 0 ? (
            <Card className="p-8 text-center text-warmgray-500">
              <span className="text-4xl block mb-2">🌿</span>
              <p className="font-bold text-warmgray-800 text-sm mb-1">Aucune alerte dans cette catégorie</p>
              <p className="text-xs">Revenez un peu plus tard ou élargissez votre rayon d'action.</p>
            </Card>
          ) : (
            openAlerts.map((alert) => (
              <Card 
                key={alert.id}
                onClick={() => router.push(`/alert/${alert.id}`)}
                className="p-4 hover:border-nature-400 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">
                      {alert.category === 'Araignée' ? '🕷️' : '🐞'}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-base text-nature-900 uppercase">
                        {alert.category}
                      </h3>
                      <p className="text-xs text-warmgray-500 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-nature-600" />
                        {alert.approximate_location}
                      </p>
                    </div>
                  </div>
                  <RewardBadge amount={alert.reward_amount} currency={alert.currency} />
                </div>

                <p className="text-xs text-warmgray-800 bg-cream-100 p-2.5 rounded-xl italic mb-3">
                  "{alert.description || `Dans la pièce : ${alert.room}`}"
                </p>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <UrgencyBadge urgency={alert.urgency} />
                  <Button variant="primary" size="sm" className="rounded-xl text-xs gap-1">
                    <span>Détails &amp; Accepter</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
