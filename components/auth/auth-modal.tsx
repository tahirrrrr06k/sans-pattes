'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { registerRealUser, loginRealUser } from '@/lib/supabase/auth';
import { uploadAlertPhoto } from '@/lib/supabase/storage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lock, User, Camera, ShieldCheck, Sparkles, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { setCurrentUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [city, setCity] = useState<string>('Lausanne');
  const [isHelper, setIsHelper] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const url = await uploadAlertPhoto(file);
      setAvatarUrl(url);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (!firstName.trim() || !lastName.trim() || !password.trim()) {
        throw new Error('Veuillez entrer votre prénom, nom et mot de passe.');
      }

      if (mode === 'register') {
        const newProfile = await registerRealUser({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          password: password.trim(),
          city: city.trim(),
          is_helper: isHelper,
          avatar_url: avatarUrl,
        });

        setCurrentUser(newProfile);
        onClose();
      } else {
        const loggedInProfile = await loginRealUser(
          firstName.trim(),
          lastName.trim(),
          password.trim()
        );
        setCurrentUser(loggedInProfile);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-md w-full p-6 bg-white rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-cream-200 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-nature-600" />
            <h2 className="text-lg font-black text-nature-950">
              {mode === 'register' ? 'Créer un Compte Sans Pattes' : 'Se Connecter'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-cream-200 rounded-full text-warmgray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-cream-100 p-1.5 rounded-2xl mb-5 border border-cream-200">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-nature-700 text-white shadow-md'
                : 'text-warmgray-700 hover:text-nature-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Connexion</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-nature-700 text-white shadow-md'
                : 'text-warmgray-700 hover:text-nature-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Inscription</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* REGISTER PHOTO FIELD */}
          {mode === 'register' && (
            <div className="text-center">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleAvatarFileChange} 
                className="hidden" 
              />
              
              <div className="relative inline-block mb-2">
                <img
                  src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firstName || 'user')}`}
                  alt="Photo de profil"
                  className="w-20 h-20 rounded-full object-cover border-3 border-nature-600 shadow mx-auto bg-cream-100"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-nature-600 text-white rounded-full shadow hover:bg-nature-700 transition-transform hover:scale-110"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-warmgray-500 font-semibold">
                {isUploadingPhoto ? 'Envoi de la photo...' : 'Photo de profil (facultatif)'}
              </p>
            </div>
          )}

          {/* FIRST NAME & LAST NAME */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1">
                Prénom *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Anissa"
                  className="w-full p-3 pl-9 rounded-xl border border-cream-300 text-xs font-semibold text-warmgray-900 focus:ring-2 focus:ring-nature-500 focus:outline-none"
                />
                <User className="w-4 h-4 text-warmgray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1">
                Nom *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Dupont"
                  className="w-full p-3 pl-9 rounded-xl border border-cream-300 text-xs font-semibold text-warmgray-900 focus:ring-2 focus:ring-nature-500 focus:outline-none"
                />
                <User className="w-4 h-4 text-warmgray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1">
              Mot de passe *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full p-3 pl-9 rounded-xl border border-cream-300 text-xs font-semibold text-warmgray-900 focus:ring-2 focus:ring-nature-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-warmgray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* REGISTER EXTRA FIELDS */}
          {mode === 'register' && (
            <>
              {/* Ville */}
              <div>
                <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1">
                  Ville / NPA (Suisse)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: 1003 Lausanne"
                  className="w-full p-3 rounded-xl border border-cream-300 text-xs font-semibold text-warmgray-900 focus:ring-2 focus:ring-nature-500 focus:outline-none"
                />
              </div>

              {/* Inscription comme Helper */}
              <div className="p-3 bg-nature-50 border border-nature-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-nature-950 block">Proposer mon aide (Helper)</span>
                  <span className="text-[10px] text-warmgray-600 block">Je souhaite intervenir pour capturer doucement les bêtes.</span>
                </div>
                <input
                  type="checkbox"
                  checked={isHelper}
                  onChange={(e) => setIsHelper(e.target.checked)}
                  className="w-5 h-5 accent-nature-600 rounded cursor-pointer"
                />
              </div>
            </>
          )}

          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            type="submit" 
            disabled={isLoading}
            className="mt-2"
          >
            {isLoading ? (
              <span className="animate-spin text-lg">⏳</span>
            ) : mode === 'register' ? (
              'Créer mon compte'
            ) : (
              'Se connecter'
            )}
          </Button>

        </form>

      </Card>
    </div>
  );
}
