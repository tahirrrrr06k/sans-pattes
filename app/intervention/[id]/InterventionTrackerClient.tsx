'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { OutcomeType, Alert } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, RewardBadge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { DEMO_PROFILES } from '@/lib/mock/initial-data';
import { 
  ArrowLeft, 
  MessageSquare, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Star,
  MapPin,
  Check,
} from 'lucide-react';
import Link from 'next/link';

import { alertRepository } from '@/lib/repositories';

export function InterventionTrackerClient({ alertId }: { alertId?: string }) {
  const router = useRouter();
  const params = useParams();
  const activeAlertId = alertId || (params?.id as string);

  const { alerts, currentUser, updateAlertStatus, completeIntervention, cancelAlert } = useApp();

  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<OutcomeType>('released_outside');
  const [outcomeNote, setOutcomeNote] = useState<string>('');
  const [fetchedAlert, setFetchedAlert] = useState<Alert | null>(null);
  const [loadingAlert, setLoadingAlert] = useState<boolean>(false);

  const alert = alerts.find(a => a.id === activeAlertId) || fetchedAlert;

  React.useEffect(() => {
    if (!alert && activeAlertId) {
      setLoadingAlert(true);
      alertRepository.getAlertById(activeAlertId).then((res) => {
        if (res) setFetchedAlert(res);
      }).catch(err => console.warn(err)).finally(() => setLoadingAlert(false));
    }
  }, [alert, activeAlertId]);

  if (loadingAlert) {
    return (
      <div className="min-h-screen bg-cream-50 p-6 flex flex-col items-center justify-center text-center">
        <div className="animate-spin text-3xl mb-3">⏳</div>
        <p className="text-sm font-bold text-nature-900">Chargement de l'intervention...</p>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-cream-50 p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-nature-900 mb-2">Intervention introuvable</h2>
        <Button onClick={() => router.push('/')}>Retour à l'accueil</Button>
      </div>
    );
  }

  const isRequester = alert.requester_id === currentUser.id;
  const isHelper = alert.helper_id === currentUser.id;

  const helperProfile = alert.helper || DEMO_PROFILES['lucas'];
  const requesterProfile = alert.requester || DEMO_PROFILES['emma'];

  const handleStepProgression = (nextStatus: 'helper_on_way' | 'helper_arrived') => {
    updateAlertStatus(alert.id, nextStatus);
  };

  const handleFinishSubmit = () => {
    completeIntervention(alert.id, outcome, outcomeNote);
    setShowCompletionModal(false);
    if (isRequester) {
      router.push(`/review/${alert.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-28 px-4 pt-4">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.push('/')}
            className="p-2 rounded-full hover:bg-cream-200 text-warmgray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm text-nature-900">
            Suivi d'Intervention en Direct
          </span>
          <StatusBadge status={alert.status} />
        </div>

        {/* TOP BANNER */}
        <Card className="bg-gradient-to-br from-nature-700 to-nature-600 text-white p-6 mb-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">
              {alert.category === 'Araignée' ? '🕷️' : '🐞'}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
              💰 {alert.reward_amount} CHF
            </span>
          </div>

          <h1 className="text-2xl font-black mb-1">
            {alert.status === 'completed' ? 'Intervention Terminée !' : 'Quelqu\'un arrive ! 🎉'}
          </h1>
          <p className="text-cream-100 text-xs leading-relaxed">
            {isRequester 
              ? `${helperProfile.first_name} est en route pour vous prêter main forte.` 
              : `Vous aidez ${requesterProfile.first_name} à retirer cette bête.`}
          </p>
        </Card>

        {/* HELPER CARD (Shown to Requester) */}
        {isRequester && (
          <Card className="p-5 mb-4 shadow-sm border-cream-200">
            <h3 className="text-xs font-extrabold text-warmgray-500 uppercase tracking-wider mb-3">
              Votre Helper Assigné
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={helperProfile.avatar_url} 
                  alt={helperProfile.first_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-nature-600 shadow" 
                />
                <div>
                  <h4 className="font-extrabold text-base text-nature-900 flex items-center gap-1.5">
                    {helperProfile.first_name}
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {helperProfile.rating}
                    </span>
                  </h4>
                  <p className="text-xs text-warmgray-600">
                    {helperProfile.total_interventions} interventions réussies
                  </p>
                  <p className="text-xs font-bold text-nature-700 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Arrivée estimée : ~8 min
                  </p>
                </div>
              </div>

              <Link href={`/messages?alertId=${alert.id}`}>
                <Button variant="primary" size="sm" className="rounded-2xl gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>Discuter</span>
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* ADDRESS & NAVIGATION (Shown to Helper after acceptance) */}
        {isHelper && (
          <Card className="p-5 mb-4 shadow-sm border-cream-200 bg-white">
            <h3 className="text-xs font-extrabold text-nature-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-nature-600" /> Adresse Exacte du Demandeur
            </h3>
            <p className="font-extrabold text-base text-nature-950 mb-1">
              {alert.exact_address}
            </p>
            <p className="text-xs text-warmgray-600 mb-4">
              Pièce : <span className="font-bold text-warmgray-800">{alert.room}</span>
              {alert.description && ` — "${alert.description}"`}
            </p>

            <div className="flex gap-2">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alert.exact_address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1"
              >
                <Button variant="secondary" size="md" fullWidth className="gap-1 text-xs">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Ouvrir dans Google Maps</span>
                </Button>
              </a>
              <Link href={`/messages?alertId=${alert.id}`}>
                <Button variant="primary" size="md" className="gap-1 text-xs">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* PROGRESSION TIMELINE / BUTTONS FOR HELPER */}
        {isHelper && alert.status !== 'completed' && (
          <Card className="p-5 mb-6 space-y-3">
            <h3 className="text-xs font-extrabold text-warmgray-500 uppercase tracking-wider mb-2">
              Progression de la mission
            </h3>

            {alert.status === 'accepted' && (
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth 
                onClick={() => handleStepProgression('helper_on_way')}
                className="gap-2"
              >
                <span>🚶 Je pars sur place</span>
              </Button>
            )}

            {alert.status === 'helper_on_way' && (
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth 
                onClick={() => handleStepProgression('helper_arrived')}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <span>📍 Je suis arrivé devant chez le demandeur</span>
              </Button>
            )}

            {(alert.status === 'helper_arrived' || alert.status === 'helper_on_way') && (
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth 
                onClick={() => setShowCompletionModal(true)}
                className="gap-2 bg-nature-800 hover:bg-nature-900 shadow-xl"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Intervention terminée</span>
              </Button>
            )}
          </Card>
        )}

        {/* COMPLETED INTERVENTION REVIEW LINK */}
        {alert.status === 'completed' && (
          <div className="space-y-4">
            <Card className="bg-emerald-50 border-emerald-200 p-5 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-extrabold text-emerald-950 text-base mb-1">
                Mission accomplie avec succès !
              </h3>
              <p className="text-xs text-emerald-800 mb-4">
                Résultat : {alert.outcome === 'released_outside' ? '🌿 Relâchée à l\'extérieur en sécurité' : alert.outcome}
              </p>
              
              {isRequester && (
                <Link href={`/review/${alert.id}`}>
                  <Button variant="primary" size="lg" fullWidth className="gap-2">
                    <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                    <span>Laisser un avis 5 étoiles</span>
                  </Button>
                </Link>
              )}
            </Card>
          </div>
        )}

        {/* CANCEL BUTTON FOR REQUESTER */}
        {isRequester && alert.status !== 'completed' && (
          <Button 
            variant="ghost" 
            size="sm" 
            fullWidth 
            onClick={() => { cancelAlert(alert.id); router.push('/'); }}
            className="text-warmgray-500 hover:text-rose-600 text-xs"
          >
            Annuler l'intervention
          </Button>
        )}

        {/* COMPLETION MODAL */}
        <Modal 
          isOpen={showCompletionModal} 
          onClose={() => setShowCompletionModal(false)}
          title="Fin de l'intervention"
        >
          <div className="space-y-4">
            <h4 className="font-extrabold text-nature-900 text-sm">
              La bête a-t-elle été retirée avec succès ?
            </h4>

            <div className="space-y-2">
              {[
                { type: 'released_outside', label: '🌿 Relâchée à l\'extérieur' },
                { type: 'already_gone', label: '💨 Déjà partie seule' },
                { type: 'not_found', label: '🔍 Impossible à trouver' },
                { type: 'pro_needed', label: '⚠️ Nécessite un professionnel' },
                { type: 'other', label: '💬 Autre raison' },
              ].map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setOutcome(opt.type as OutcomeType)}
                  className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                    outcome === opt.type 
                      ? 'bg-nature-600 text-white border-nature-600 shadow' 
                      : 'bg-white text-warmgray-800 border-cream-200 hover:border-nature-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {outcome === opt.type && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-warmgray-700 mb-1">
                Note ou commentaire facultatif
              </label>
              <textarea 
                rows={2}
                value={outcomeNote}
                onChange={(e) => setOutcomeNote(e.target.value)}
                placeholder="Ex: Petite araignée sautante relâchée dans le jardin..."
                className="w-full p-3 rounded-2xl border border-cream-300 bg-white text-xs focus:ring-2 focus:ring-nature-500 focus:outline-none"
              />
            </div>

            <Button 
              variant="primary" 
              size="lg" 
              fullWidth 
              onClick={handleFinishSubmit}
            >
              Confirmer et Clôturer
            </Button>
          </div>
        </Modal>

      </div>
    </div>
  );
}
