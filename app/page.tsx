'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UrgencyBadge, RewardBadge, StatusBadge } from '@/components/ui/badge';
import { InteractiveMap } from '@/components/map/interactive-map';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';
import { 
  PlusCircle, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Users, 
  CheckCircle2, 
  MessageSquare,
  ChevronRight,
  HeartHandshake
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, userRoleMode, alerts, helperSettings } = useApp();

  const activeUserAlerts = alerts.filter(
    a => a.requester_id === currentUser.id && a.status !== 'completed' && a.status !== 'cancelled'
  );

  const activeHelperInterventions = alerts.filter(
    a => a.helper_id === currentUser.id && a.status !== 'completed' && a.status !== 'cancelled'
  );

  const openAlertsForHelper = alerts.filter(
    a => a.status === 'searching' && a.requester_id !== currentUser.id
  );

  return (
    <div className="min-h-screen bg-cream-50 pb-28 px-4 pt-4">
      <OnboardingModal />

      <div className="max-w-md mx-auto space-y-5">
        
        {/* TOP WELCOME HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-nature-900 tracking-tight flex items-center gap-2">
              Bonjour, {currentUser.first_name} 👋
            </h1>
            <p className="text-xs font-semibold text-warmgray-600 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>🟢 4 helpers disponibles autour de vous à {currentUser.city}</span>
            </p>
          </div>

          <Link href="/profile">
            <img 
              src={currentUser.avatar_url} 
              alt={currentUser.first_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-nature-600 shadow-sm hover:scale-105 transition-transform" 
            />
          </Link>
        </div>

        {/* ACTIVE USER INTERVENTIONS BANNER */}
        {activeUserAlerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold text-nature-900 uppercase tracking-wider">
              Votre Demande en cours 🚨
            </h2>
            {activeUserAlerts.map(alert => (
              <Card 
                key={alert.id}
                onClick={() => router.push(`/intervention/${alert.id}`)}
                className="bg-gradient-to-br from-nature-700 to-nature-800 text-white p-5 shadow-lg border-none"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">
                    {alert.category === 'Araignée' ? '🕷️' : '🐞'}
                  </span>
                  <StatusBadge status={alert.status} />
                </div>
                <h3 className="font-extrabold text-lg mb-1">
                  Alerte {alert.category} ({alert.room})
                </h3>
                <p className="text-xs text-cream-100 flex items-center gap-1">
                  <span>Suivre l'intervention en direct</span>
                  <ChevronRight className="w-4 h-4" />
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* ACTIVE HELPER ASSIGNMENT BANNER */}
        {userRoleMode === 'helper' && activeHelperInterventions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              Mission d'aide acceptée 🚶
            </h2>
            {activeHelperInterventions.map(alert => (
              <Card 
                key={alert.id}
                onClick={() => router.push(`/intervention/${alert.id}`)}
                className="bg-amber-500 text-white p-5 shadow-lg border-none"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">
                    {alert.category === 'Araignée' ? '🕷️' : '🐞'}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 bg-white/20 rounded-full">
                    💰 {alert.reward_amount} CHF
                  </span>
                </div>
                <h3 className="font-extrabold text-lg mb-1">
                  Intervenir chez {alert.requester?.first_name || 'un voisin'}
                </h3>
                <p className="text-xs text-amber-50 font-bold flex items-center gap-1">
                  <span>Voir l'adresse et avancer</span>
                  <ChevronRight className="w-4 h-4" />
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* MAP PREVIEW */}
        <InteractiveMap alerts={openAlertsForHelper} />

        {/* CENTRAL HERO CALL TO ACTION (REQUESTER MODE) */}
        {userRoleMode === 'requester' && (
          <div className="text-center py-2 space-y-3">
            <Link href="/alert/new">
              <Button 
                variant="primary" 
                size="xl" 
                fullWidth 
                className="py-5 text-xl font-black rounded-3xl gap-3 shadow-xl shadow-nature-600/30 hover:scale-[1.02] bg-gradient-to-r from-nature-700 via-nature-600 to-nature-700"
              >
                <PlusCircle className="w-8 h-8 text-cream-200" />
                <span>J'AI BESOIN D'AIDE</span>
              </Button>
            </Link>

            <Link href="/around">
              <Button variant="secondary" size="md" fullWidth className="rounded-2xl gap-2 font-bold text-warmgray-800">
                <MapPin className="w-4 h-4 text-nature-600" />
                <span>Voir les demandes autour de moi</span>
              </Button>
            </Link>
          </div>
        )}

        {/* HELPER MODE STREAM */}
        {userRoleMode === 'helper' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-nature-900 uppercase tracking-wider">
                Demandes proches ({openAlertsForHelper.length})
              </h2>
              <Link href="/helper/availability" className="text-xs font-bold text-nature-700 hover:underline">
                {helperSettings.available_now ? '🟢 Disponible' : '⚫ Indisponible'} (Regler)
              </Link>
            </div>

            {openAlertsForHelper.length === 0 ? (
              <Card className="p-6 text-center text-warmgray-500">
                <span className="text-4xl block mb-2">🕷️</span>
                <p className="font-bold text-warmgray-800 text-sm mb-1">Tout est calme autour de vous</p>
                <p className="text-xs">Aucune alerte active dans votre rayon d'intervention pour le moment.</p>
              </Card>
            ) : (
              openAlertsForHelper.map((alert) => (
                <Card 
                  key={alert.id}
                  onClick={() => router.push(`/alert/${alert.id}`)}
                  className="p-4 hover:border-nature-400 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {alert.category === 'Araignée' ? '🕷️' : '🐞'}
                      </span>
                      <div>
                        <span className="font-extrabold text-sm text-nature-900 block uppercase">
                          {alert.category}
                        </span>
                        <span className="text-xs text-warmgray-500 font-semibold">
                          📍 {alert.approximate_location}
                        </span>
                      </div>
                    </div>
                    <RewardBadge amount={alert.reward_amount} currency={alert.currency} />
                  </div>

                  <p className="text-xs text-warmgray-700 italic line-clamp-2 mb-3 bg-cream-100 p-2.5 rounded-xl">
                    "{alert.description || `Dans la pièce : ${alert.room}`}"
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <UrgencyBadge urgency={alert.urgency} />
                    <span className="font-bold text-nature-700 flex items-center gap-1">
                      Voir la demande <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* HUMANE ETHICS FOOTER CARD */}
        <Card className="bg-nature-50 border-nature-200 p-4 rounded-3xl flex items-center gap-3">
          <HeartHandshake className="w-8 h-8 text-nature-700 shrink-0" />
          <div className="text-xs text-nature-950">
            <span className="font-bold block mb-0.5">Philosophie Sans Pattes :</span>
            Aider la personne tout en respectant l'animal. Les insectes et araignées sont capturés et relâchés dehors sans leur faire de mal.
          </div>
        </Card>

      </div>
    </div>
  );
}
