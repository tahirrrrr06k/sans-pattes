'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { Card } from '@/components/ui/card';
import { StatusBadge, RewardBadge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MapPin, Star, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { alerts, currentUser, reviews } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'helps'>('requests');

  const myRequests = alerts.filter(a => a.requester_id === currentUser.id);
  const myHelps = alerts.filter(a => a.helper_id === currentUser.id);

  const displayedList = activeTab === 'requests' ? myRequests : myHelps;

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
          <span className="font-extrabold text-sm text-nature-900">
            Mes Interventions &amp; Historique
          </span>
          <div className="w-8" />
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-cream-200/60 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-white text-nature-900 shadow-sm'
                : 'text-warmgray-600 hover:text-warmgray-900'
            }`}
          >
            Demandes ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('helps')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'helps'
                ? 'bg-white text-nature-900 shadow-sm'
                : 'text-warmgray-600 hover:text-warmgray-900'
            }`}
          >
            Aides apportées ({myHelps.length})
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {displayedList.length === 0 ? (
            <Card className="p-8 text-center text-warmgray-500">
              <span className="text-4xl block mb-2">📜</span>
              <p className="font-bold text-warmgray-800 text-sm mb-1">Aucune intervention enregistrée</p>
              <p className="text-xs">Vos interventions passées apparaîtront ici.</p>
            </Card>
          ) : (
            displayedList.map((alert) => {
              const review = reviews.find(r => r.alert_id === alert.id);
              return (
                <Card 
                  key={alert.id}
                  onClick={() => router.push(`/intervention/${alert.id}`)}
                  className="p-4 hover:border-nature-300 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">
                        {alert.category === 'Araignée' ? '🕷️' : '🐞'}
                      </span>
                      <div>
                        <h3 className="font-extrabold text-sm text-nature-900 uppercase">
                          {alert.category} ({alert.room})
                        </h3>
                        <p className="text-[11px] text-warmgray-500 flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.created_at).toLocaleDateString('fr-CH')}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={alert.status} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-cream-200 text-xs">
                    <RewardBadge amount={alert.reward_amount} currency={alert.currency} />

                    {review ? (
                      <span className="font-extrabold text-amber-900 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {review.rating}.0
                      </span>
                    ) : (
                      <span className="text-nature-700 font-bold flex items-center gap-0.5">
                        Détails <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
