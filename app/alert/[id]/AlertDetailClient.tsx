'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UrgencyBadge, RewardBadge, StatusBadge } from '@/components/ui/badge';
import { InteractiveMap } from '@/components/map/interactive-map';
import { DangerousAnimalBanner } from '@/components/safety/dangerous-animal-banner';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  XCircle,
} from 'lucide-react';

import { Alert } from '@/types';
import { alertRepository } from '@/lib/repositories';


export function AlertDetailClient({ alertId }: { alertId?: string }) {
  const router = useRouter();
  const params = useParams();
  const activeAlertId = alertId || (params?.id as string);

  const { alerts, currentUser, userRoleMode, acceptAlert, cancelAlert } = useApp();

  const [fetchedAlert, setFetchedAlert] = useState<Alert | null>(null);
  const [loadingAlert, setLoadingAlert] = useState<boolean>(false);
  const [raceError, setRaceError] = useState<boolean>(false);

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
        <p className="text-sm font-bold text-nature-900">Chargement de l'alerte...</p>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-cream-50 p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-warmgray-400 mb-3" />
        <h2 className="text-xl font-bold text-nature-900 mb-2">Alerte introuvable</h2>
        <p className="text-warmgray-600 text-sm mb-6">Cette demande a peut-être été supprimée ou archivée.</p>
        <Button variant="primary" onClick={() => router.push('/')}>Retour à l'accueil</Button>
      </div>
    );
  }

  const isRequester = alert.requester_id === currentUser.id;
  const isAssignedHelper = alert.helper_id === currentUser.id;

  const handleAccept = () => {
    const success = acceptAlert(alert.id);
    if (success) {
      router.push(`/intervention/${alert.id}`);
    } else {
      setRaceError(true);
    }
  };

  const handleCancel = () => {
    cancelAlert(alert.id);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-28 px-4 pt-4">
      <div className="max-w-md mx-auto">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.push('/')}
            className="p-2 rounded-full hover:bg-cream-200 text-warmgray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm text-nature-900">
            Détail de l'Alerte
          </span>
          <StatusBadge status={alert.status} />
        </div>

        {/* Race Condition Error State Banner */}
        {raceError && (
          <Card className="bg-rose-50 border-rose-300 p-4 mb-4 text-rose-900 animate-shake">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-sm mb-1">Alerte déjà acceptée</h4>
                <p>Cette intervention vient d'être acceptée par quelqu'un d'autre à l'instant.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Alert Card */}
        <Card className="p-6 mb-4 shadow-md">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center text-4xl shadow-inner">
                {alert.category === 'Araignée' ? '🕷️' : alert.category === 'Guêpe / abeille' ? '🐝' : '🐞'}
              </div>
              <div>
                <h1 className="text-xl font-black text-nature-900 uppercase tracking-tight">
                  {alert.category}
                </h1>
                <p className="text-xs font-bold text-nature-700">
                  Dans la pièce : {alert.room}
                </p>
              </div>
            </div>

            <RewardBadge amount={alert.reward_amount} currency={alert.currency} />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <UrgencyBadge urgency={alert.urgency} />
            <span className="text-xs text-warmgray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Publié il y a quelques minutes
            </span>
          </div>

          {alert.photo_url && (
            <div className="mb-4">
              <img 
                src={alert.photo_url} 
                alt="Bête aperçue" 
                className="w-full h-56 object-cover rounded-2xl shadow-inner border border-cream-200" 
              />
            </div>
          )}

          {alert.description && (
            <div className="bg-cream-100 p-4 rounded-2xl text-xs text-warmgray-800 italic mb-4 leading-relaxed">
              "{alert.description}"
            </div>
          )}

          {/* Privacy & Location Box */}
          <div className="bg-white rounded-2xl p-4 border border-cream-200 shadow-sm flex items-start gap-3">
            <MapPin className="w-5 h-5 text-nature-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="text-warmgray-500 block">Localisation :</span>
              <span className="font-extrabold text-nature-900 text-sm block">
                {isAssignedHelper ? alert.exact_address : alert.approximate_location}
              </span>
              {!isAssignedHelper && (
                <span className="text-[11px] text-warmgray-500 italic mt-1 block">
                  🛡️ L'adresse exacte sera déverrouillée uniquement après acceptation.
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Map Overview */}
        <div className="mb-6">
          <InteractiveMap 
            alerts={[alert]} 
            selectedAlertId={alert.id}
            showExactAddress={isAssignedHelper}
          />
        </div>

        {/* Safety Warning */}
        {alert.category === 'Guêpe / abeille' && (
          <DangerousAnimalBanner category={alert.category} />
        )}

        {/* ACTIONS SECTION */}

        {/* 1. VIEWING AS HELPER FOR SEARCHING ALERT */}
        {userRoleMode === 'helper' && alert.status === 'searching' && (
          <div className="space-y-3">
            <Button 
              variant="primary" 
              size="xl" 
              fullWidth 
              onClick={handleAccept}
              className="gap-2 shadow-xl hover:scale-[1.01]"
            >
              <UserCheck className="w-6 h-6" />
              <span>Accepter l'intervention</span>
            </Button>
            <Button 
              variant="ghost" 
              size="md" 
              fullWidth 
              onClick={() => router.push('/')}
            >
              Ignorer cette alerte
            </Button>
          </div>
        )}

        {/* 2. VIEWING AS REQUESTER WAITING FOR HELPER */}
        {isRequester && alert.status === 'searching' && (
          <Card className="bg-nature-50 border-nature-200 p-6 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-nature-400/30 animate-ping" />
              <div className="w-12 h-12 rounded-full bg-nature-600 text-white flex items-center justify-center text-xl shadow-md">
                🔍
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-nature-900 text-base mb-1">
                Recherche de helpers autour de vous...
              </h3>
              <p className="text-xs text-warmgray-600">
                Les personnes disponibles à proximité reçoivent votre alerte. Restez calme !
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              className="text-rose-700 border-rose-300 hover:bg-rose-50"
            >
              Annuler l'alerte
            </Button>
          </Card>
        )}

        {/* 3. ASSIGNED INTERVENTION LINK */}
        {(isAssignedHelper || (isRequester && alert.status !== 'searching')) && (
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            onClick={() => router.push(`/intervention/${alert.id}`)}
            className="gap-2"
          >
            <span>Suivre l'intervention en direct</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Button>
        )}

      </div>
    </div>
  );
}
