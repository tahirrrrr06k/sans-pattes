'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { 
  User, 
  ShieldCheck, 
  Clock, 
  Star, 
  Heart, 
  SlidersHorizontal, 
  History, 
  ShieldAlert, 
  Lock,
  LogOut,
  ChevronRight,
  Sparkles,
  Award,
  AlertTriangle
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, userRoleMode, helperSettings, resetDemoData } = useApp();

  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  const handleReportSubmit = () => {
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
      setReportReason('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-28 px-4 pt-4">
      <div className="max-w-md mx-auto space-y-5">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-nature-900 tracking-tight">
            Mon Profil
          </h1>
          <span className="px-3 py-1 bg-nature-100 text-nature-800 rounded-full text-xs font-bold border border-nature-200">
            {currentUser.is_helper ? 'Helper & Demandeur' : 'Demandeur'}
          </span>
        </div>

        {/* PROFILE HEADER CARD */}
        <Card className="p-6 text-center shadow-md bg-white">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <img 
              src={currentUser.avatar_url} 
              alt={currentUser.first_name}
              className="w-full h-full rounded-full object-cover border-4 border-nature-600 shadow-md" 
            />
            <div className="absolute bottom-0 right-0 bg-nature-600 text-white p-1.5 rounded-full border-2 border-white shadow">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-nature-900 mb-0.5">
            {currentUser.first_name} {currentUser.last_name}
          </h2>
          <p className="text-xs font-semibold text-warmgray-500 mb-4">
            📍 {currentUser.city} • Membre certifié
          </p>

          {/* STATS STRIP */}
          <div className="grid grid-cols-3 gap-2 bg-cream-100/70 p-3 rounded-2xl border border-cream-200">
            <div>
              <span className="text-base font-black text-amber-900 block flex items-center justify-center gap-0.5">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                {currentUser.rating}
              </span>
              <span className="text-[10px] text-warmgray-600 font-semibold block">Note globale</span>
            </div>
            <div>
              <span className="text-base font-black text-nature-900 block">
                {currentUser.total_interventions}
              </span>
              <span className="text-[10px] text-warmgray-600 font-semibold block">Interventions</span>
            </div>
            <div>
              <span className="text-base font-black text-emerald-700 block">
                {currentUser.animals_saved}
              </span>
              <span className="text-[10px] text-warmgray-600 font-semibold block">Animaux relâchés</span>
            </div>
          </div>
        </Card>

        {/* HELPER BADGES */}
        <Card className="p-4 space-y-2">
          <h3 className="text-xs font-extrabold text-warmgray-500 uppercase tracking-wider">
            Badges &amp; Engagements
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-2xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" /> Respect de l'animal
            </span>
            <span className="px-3 py-1.5 rounded-2xl bg-blue-100 text-blue-900 text-xs font-bold border border-blue-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-600" /> Helper Vérifié 18+
            </span>
          </div>
        </Card>

        {/* QUICK MENU ACTIONS */}
        <div className="space-y-2">
          
          <Link href="/helper/availability">
            <Card className="p-4 flex items-center justify-between hover:bg-cream-100 transition-colors">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-nature-600" />
                <div>
                  <span className="font-extrabold text-sm text-nature-900 block">
                    Mes Disponibilités Helper
                  </span>
                  <span className="text-xs text-warmgray-500">
                    {helperSettings.available_now ? '🟢 En ligne (Rayon 5 km)' : '⚫ Indisponible'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-warmgray-400" />
            </Card>
          </Link>

          <Link href="/history">
            <Card className="p-4 flex items-center justify-between hover:bg-cream-100 transition-colors">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-nature-600" />
                <div>
                  <span className="font-extrabold text-sm text-nature-900 block">
                    Historique des Interventions
                  </span>
                  <span className="text-xs text-warmgray-500">
                    Consulter vos demandes et aides apportées
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-warmgray-400" />
            </Card>
          </Link>

          <Link href="/security">
            <Card className="p-4 flex items-center justify-between hover:bg-cream-100 transition-colors">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-nature-600" />
                <div>
                  <span className="font-extrabold text-sm text-nature-900 block">
                    Sécurité &amp; Règles Communautaires
                  </span>
                  <span className="text-xs text-warmgray-500">
                    Consignes d'intervention et protection des données
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-warmgray-400" />
            </Card>
          </Link>

          <Link href="/admin">
            <Card className="p-4 flex items-center justify-between hover:bg-amber-50 transition-colors border-amber-200">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="font-extrabold text-sm text-amber-950 block">
                    Panneau d'Administration (MVP)
                  </span>
                  <span className="text-xs text-amber-700">
                    Statistiques de la plateforme &amp; modération
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-600" />
            </Card>
          </Link>

        </div>

        {/* MODERATION & SAFETY BUTTONS */}
        <div className="pt-2 space-y-2">
          <Button 
            variant="outline" 
            size="md" 
            fullWidth 
            onClick={() => setShowReportModal(true)}
            className="text-amber-800 border-amber-300 hover:bg-amber-50 gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Signaler un problème</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            fullWidth 
            onClick={resetDemoData}
            className="text-warmgray-500 hover:text-warmgray-900 text-xs gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Réinitialiser les données de démonstration</span>
          </Button>
        </div>

        {/* REPORT MODAL */}
        <Modal 
          isOpen={showReportModal} 
          onClose={() => setShowReportModal(false)}
          title="Signaler un problème ou un utilisateur"
        >
          {reportSuccess ? (
            <div className="text-center py-6 text-emerald-700 space-y-2">
              <Sparkles className="w-10 h-10 mx-auto" />
              <h4 className="font-bold text-base">Signalement transmis</h4>
              <p className="text-xs text-warmgray-600">Notre équipe de modération analyse votre rapport.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-warmgray-600">
                La sécurité et la bienveillance sont primordiales. Décrivez brièvement la situation :
              </p>
              <textarea 
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Ex: Comportement inapproprié, fausse alerte..."
                className="w-full p-3 rounded-2xl border border-cream-300 bg-white text-xs text-warmgray-900 focus:ring-2 focus:ring-nature-500 focus:outline-none"
              />
              <Button 
                variant="danger" 
                size="lg" 
                fullWidth 
                onClick={handleReportSubmit}
                disabled={!reportReason.trim()}
              >
                Envoyer le signalement
              </Button>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
}
