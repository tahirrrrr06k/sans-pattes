'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Check, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  HeartHandshake,
  Sparkles
} from 'lucide-react';

export default function HelperAvailabilityPage() {
  const router = useRouter();
  const { helperSettings, updateHelperSettings } = useApp();

  const [availableNow, setAvailableNow] = useState<boolean>(helperSettings.available_now);
  const [maxDistance, setMaxDistance] = useState<number>(helperSettings.max_distance_km);
  const [acceptSpiders, setAcceptSpiders] = useState<boolean>(helperSettings.accept_spiders);
  const [acceptInsects, setAcceptInsects] = useState<boolean>(helperSettings.accept_insects);
  const [acceptWasps, setAcceptWasps] = useState<boolean>(helperSettings.accept_wasps);
  const [acceptOther, setAcceptOther] = useState<boolean>(helperSettings.accept_other);
  const [commitmentAccepted, setCommitmentAccepted] = useState<boolean>(
    helperSettings.humane_commitment_accepted
  );

  const days: { key: keyof typeof helperSettings.weekly_schedule; label: string }[] = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' },
  ];

  const handleSave = () => {
    updateHelperSettings({
      available_now: availableNow,
      max_distance_km: maxDistance,
      accept_spiders: acceptSpiders,
      accept_insects: acceptInsects,
      accept_wasps: acceptWasps,
      accept_other: acceptOther,
      humane_commitment_accepted: commitmentAccepted,
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-28 px-4 pt-4">
      <div className="max-w-md mx-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="p-2 rounded-full hover:bg-cream-200 text-warmgray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm text-nature-900">
            Mes Disponibilités &amp; Paramètres Helper
          </span>
          <div className="w-9" />
        </div>

        {/* QUICK TOGGLE SWITCH */}
        <Card className={`p-5 transition-all border-2 ${availableNow ? 'bg-emerald-50 border-emerald-300' : 'bg-warmgray-50 border-warmgray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-nature-950 flex items-center gap-2">
                {availableNow ? '🟢 Disponible maintenant' : '⚫ Indisponible'}
              </h2>
              <p className="text-xs text-warmgray-600 mt-0.5">
                {availableNow 
                  ? 'Vous recevrez les alertes en direct dans votre secteur.' 
                  : 'Aucune alerte ne vous sera envoyée.'}
              </p>
            </div>

            <button
              onClick={() => setAvailableNow(!availableNow)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                availableNow ? 'bg-emerald-600' : 'bg-warmgray-300'
              }`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                availableNow ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </Card>

        {/* MAX DISTANCE RADIUS */}
        <Card className="p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-nature-900 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-nature-600" /> Rayon maximum d'intervention
          </h3>
          
          <div className="flex items-center justify-between text-sm font-bold text-warmgray-900">
            <span>Distance max :</span>
            <span className="text-base text-nature-700 px-3 py-1 bg-nature-100 rounded-full">
              {maxDistance} km
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-1">
            {[1, 2, 5, 10, 20].map((dist) => (
              <button
                key={dist}
                onClick={() => setMaxDistance(dist)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  maxDistance === dist
                    ? 'bg-nature-600 text-white border-nature-600 shadow'
                    : 'bg-white text-warmgray-700 border-cream-200 hover:border-nature-300'
                }`}
              >
                {dist} km
              </button>
            ))}
          </div>
        </Card>

        {/* ANIMAL CATEGORIES PREFERENCES */}
        <Card className="p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-nature-900 uppercase tracking-wider">
            Catégories d'animaux acceptées
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '🕷️ Araignées', state: acceptSpiders, set: setAcceptSpiders },
              { label: '🐞 Insectes', state: acceptInsects, set: setAcceptInsects },
              { label: '🐝 Guêpes / Abeilles', state: acceptWasps, set: setAcceptWasps },
              { label: '🦋 Autre petite bête', state: acceptOther, set: setAcceptOther },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => item.set(!item.state)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                  item.state 
                    ? 'bg-nature-100 text-nature-900 border-nature-300' 
                    : 'bg-white text-warmgray-400 border-cream-200'
                }`}
              >
                <span>{item.label}</span>
                {item.state && <Check className="w-4 h-4 text-nature-700" />}
              </button>
            ))}
          </div>
        </Card>

        {/* WEEKLY SCHEDULE */}
        <Card className="p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-nature-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-nature-600" /> Plages horaires de disponibilité
          </h3>

          <div className="space-y-2 text-xs">
            {days.map((d) => {
              const dayConfig = helperSettings.weekly_schedule[d.key];
              return (
                <div key={d.key} className="flex items-center justify-between p-2.5 rounded-xl bg-cream-100/60 border border-cream-200">
                  <span className="font-bold text-warmgray-800">{d.label}</span>
                  {dayConfig.enabled ? (
                    <span className="font-bold text-nature-700 bg-white px-2.5 py-1 rounded-lg border border-cream-300">
                      {dayConfig.start} → {dayConfig.end}
                    </span>
                  ) : (
                    <span className="text-warmgray-400 italic">Indisponible</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* HUMANE COMMITMENT */}
        <Card className="bg-amber-50 border-amber-300 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <HeartHandshake className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <h4 className="font-extrabold text-sm mb-1">
                Engagement éthique du Helper Sans Pattes 🌿
              </h4>
              <p className="mb-3">
                "En devenant Helper Sans Pattes, je m'engage à intervenir avec calme et à éviter de blesser ou tuer volontairement les animaux."
              </p>
              <button
                onClick={() => setCommitmentAccepted(!commitmentAccepted)}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
                  commitmentAccepted 
                    ? 'bg-amber-600 text-white border-amber-600 shadow' 
                    : 'bg-white text-amber-900 border-amber-300'
                }`}
              >
                {commitmentAccepted && <Check className="w-4 h-4" />}
                <span>{commitmentAccepted ? 'Engagement accepté ✓' : 'J\'accepte l\'engagement'}</span>
              </button>
            </div>
          </div>
        </Card>

        {/* SAVE BUTTON */}
        <Button 
          variant="primary" 
          size="xl" 
          fullWidth 
          onClick={handleSave}
          className="shadow-xl"
        >
          Enregistrer mes disponibilités
        </Button>

      </div>
    </div>
  );
}
