'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, HeartHandshake, Lock, PhoneCall, AlertTriangle, UserCheck } from 'lucide-react';

export default function SecurityRulesPage() {
  const router = useRouter();

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
            Règles &amp; Sécurité Communautaire
          </span>
          <div className="w-8" />
        </div>

        {/* Hero Card */}
        <Card className="bg-nature-700 text-white p-6 rounded-3xl shadow-lg">
          <ShieldCheck className="w-10 h-10 text-emerald-300 mb-2" />
          <h1 className="text-xl font-black mb-1">
            Sécurité &amp; Confiance avant tout 🛡️
          </h1>
          <p className="text-xs text-cream-100 leading-relaxed">
            Parce que des particuliers se rencontrent pour s'entraider à domicile, nous appliquons des règles de sécurité strictes.
          </p>
        </Card>

        {/* Rule 1: Respect of Animals */}
        <Card className="p-5 space-y-2">
          <div className="flex items-center gap-2 text-nature-900 font-extrabold text-sm">
            <HeartHandshake className="w-5 h-5 text-nature-600" />
            <span>1. Respect des Animaux</span>
          </div>
          <p className="text-xs text-warmgray-600 leading-relaxed">
            Tous les helpers s'engagent à capturer l'animal sans violence et à le relâcher dans un endroit extérieur approprié. L'application interdit le massacre volontaire des animaux.
          </p>
        </Card>

        {/* Rule 2: Privacy Shield */}
        <Card className="p-5 space-y-2">
          <div className="flex items-center gap-2 text-nature-900 font-extrabold text-sm">
            <Lock className="w-5 h-5 text-nature-600" />
            <span>2. Protection de la vie privée</span>
          </div>
          <p className="text-xs text-warmgray-600 leading-relaxed">
            Votre adresse exacte et votre numéro ne sont jamais publics. Ils ne sont transmis qu'au helper ayant formellement accepté la mission.
          </p>
        </Card>

        {/* Rule 3: Doorstep option */}
        <Card className="p-5 space-y-2">
          <div className="flex items-center gap-2 text-nature-900 font-extrabold text-sm">
            <UserCheck className="w-5 h-5 text-nature-600" />
            <span>3. Option "Devant la porte"</span>
          </div>
          <p className="text-xs text-warmgray-600 leading-relaxed">
            Si la bête est dans un bocal ou sur un balcon, vous pouvez demander au helper de rester devant la porte ou sur le palier pour la récupérer.
          </p>
        </Card>

        {/* Rule 4: Dangerous Animals */}
        <Card className="bg-amber-50 border-amber-300 p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-950 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <span>4. Animaux dangereux &amp; Frelons</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Sans Pattes n'est pas un service d'extermination ou de gestion des serpents/frelons. Pour les situations dangereuses, appelez directement les professionnels (Pompiers 118 en Suisse).
          </p>
        </Card>

      </div>
    </div>
  );
}
