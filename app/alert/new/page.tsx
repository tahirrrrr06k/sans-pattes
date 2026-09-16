'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { CategoryType, RoomType, UrgencyLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DangerousAnimalBanner } from '@/components/safety/dangerous-animal-banner';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  MapPin, 
  Check, 
  ShieldAlert, 
  Coins, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function NewAlertPage() {
  const router = useRouter();
  const { createAlert } = useApp();

  const [step, setStep] = useState<number>(1);

  // Form State
  const [category, setCategory] = useState<CategoryType>('Araignée');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomType>('Chambre');
  const [description, setDescription] = useState<string>('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [rewardAmount, setRewardAmount] = useState<number>(10);
  const [customReward, setCustomReward] = useState<string>('');
  const [isCustomReward, setIsCustomReward] = useState<boolean>(false);
  const [exactAddress, setExactAddress] = useState<string>('Rue de Bourg 14, 1003 Lausanne');
  const [approxLocation, setApproxLocation] = useState<string>('Lausanne Centre – ~1.2 km');

  const categories: { type: CategoryType; label: string; icon: string }[] = [
    { type: 'Araignée', label: 'Araignée', icon: '🕷️' },
    { type: 'Insecte', label: 'Insecte', icon: '🐞' },
    { type: 'Guêpe / abeille', label: 'Guêpe / abeille', icon: '🐝' },
    { type: 'Papillon / mite', label: 'Papillon / mite', icon: '🦋' },
    { type: 'Coléoptère', label: 'Coléoptère', icon: '🪲' },
    { type: 'Autre petite bête', label: 'Autre petite bête', icon: '🦎' },
    { type: 'Je ne sais pas', label: 'Je ne sais pas', icon: '❓' },
  ];

  const rooms: RoomType[] = [
    'Chambre', 'Salle de bain', 'Cuisine', 'Salon', 
    'Balcon', 'Cave', 'Garage', 'Autre'
  ];

  const urgencyOptions: { level: UrgencyLevel; title: string; desc: string; color: string }[] = [
    { level: 'low', title: '🟢 Pas pressé', desc: 'Prenez votre temps, dans la journée.', color: 'border-emerald-300 bg-emerald-50' },
    { level: 'medium', title: '🟠 Rapide souhaité', desc: 'Idéalement d\'ici 30 à 60 minutes.', color: 'border-amber-300 bg-amber-50' },
    { level: 'high', title: '🔴 Urgent, je panique !', desc: 'Je n\'ose plus bouger, au secours !', color: 'border-rose-400 bg-rose-50 font-bold' },
  ];

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.push('/');
  };

  const handleSubmit = () => {
    const finalReward = isCustomReward ? (parseInt(customReward) || 0) : rewardAmount;
    const alert = createAlert({
      category,
      description,
      room,
      photo_url: photoUrl,
      urgency,
      reward_amount: finalReward,
      exact_address: exactAddress,
      approximate_location: approxLocation,
      latitude: 46.5197,
      longitude: 6.6323,
    });

    router.push(`/alert/${alert.id}`);
  };

  // Mock Photo Upload / Camera simulation
  const handleSimulatePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1577741314755-048d8525d31e?w=600',
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600',
    ];
    setPhotoUrl(samplePhotos[Math.floor(Math.random() * samplePhotos.length)]);
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-24 px-4 pt-4">
      <div className="max-w-md mx-auto">
        
        {/* Header Progress Bar */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-cream-200 text-warmgray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 mx-4">
            <div className="flex justify-between text-xs text-warmgray-500 font-semibold mb-1">
              <span>Étape {step} sur 7</span>
              <span>{Math.round((step / 7) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-cream-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-nature-600 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* STEP 1: CATEGORY */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-black text-nature-900 mb-2">
              Quel est le problème ? 🐾
            </h1>
            <p className="text-warmgray-600 text-sm mb-6">
              Sélectionnez le type d'animal aperçu pour informer au mieux les helpers.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat.type}
                  onClick={() => setCategory(cat.type)}
                  className={`p-4 rounded-3xl border text-left transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 ${
                    category === cat.type
                      ? 'bg-nature-600 text-white border-nature-600 shadow-lg scale-[1.02]'
                      : 'bg-white text-warmgray-800 border-cream-200 hover:border-nature-300'
                  }`}
                >
                  <span className="text-4xl">{cat.icon}</span>
                  <span className="text-sm font-bold">{cat.label}</span>
                </button>
              ))}
            </div>

            {category === 'Guêpe / abeille' && (
              <DangerousAnimalBanner category={category} />
            )}

            <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
              Continuer
            </Button>
          </div>
        )}

        {/* STEP 2: PHOTO */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-black text-nature-900 mb-2">
              Une photo de la bête ? 📸
            </h1>
            <p className="text-warmgray-600 text-sm mb-6">
              Facultatif mais très utile pour que le helper prépare le bon bocal ou verre !
            </p>

            {photoUrl ? (
              <Card className="p-3 mb-6 text-center">
                <img 
                  src={photoUrl} 
                  alt="Aperçu bête" 
                  className="w-full h-56 object-cover rounded-2xl mb-3 shadow-inner" 
                />
                <button
                  onClick={() => setPhotoUrl(null)}
                  className="text-xs text-rose-600 font-bold underline"
                >
                  Supprimer ou changer de photo
                </button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 mb-6">
                <button
                  onClick={handleSimulatePhoto}
                  className="p-6 rounded-3xl border-2 border-dashed border-nature-400 bg-nature-50/50 hover:bg-nature-100/50 flex flex-col items-center justify-center text-nature-900 gap-2 transition-colors"
                >
                  <Camera className="w-10 h-10 text-nature-600" />
                  <span className="font-extrabold text-sm">Prendre une photo</span>
                  <span className="text-xs text-warmgray-500">(Utilise la caméra de votre appareil)</span>
                </button>

                <button
                  onClick={handleSimulatePhoto}
                  className="p-4 rounded-2xl border border-cream-300 bg-white hover:bg-cream-100 flex items-center justify-center gap-2 text-warmgray-700 font-bold text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Importer depuis la galerie</span>
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => { setPhotoUrl(null); handleNext(); }}
                className="w-1/3"
              >
                Passer
              </Button>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleNext}
                className="w-2/3"
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: ROOM & COMMENT */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-black text-nature-900 mb-2">
              Où est la bête ? 📍
            </h1>
            <p className="text-warmgray-600 text-sm mb-6">
              Indiquez la pièce pour que le helper sache où intervenir à son arrivée.
            </p>

            <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-2">
              Pièce du logement
            </label>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {rooms.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoom(r)}
                  className={`p-3 rounded-2xl border text-sm font-bold transition-all text-center ${
                    room === r
                      ? 'bg-nature-600 text-white border-nature-600 shadow'
                      : 'bg-white text-warmgray-800 border-cream-200 hover:border-nature-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-2">
              Précisions complémentaires (facultatif)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Elle est au plafond au-dessus de mon lit, derrière la porte..."
              className="w-full p-4 rounded-2xl border border-cream-300 bg-white text-sm text-warmgray-900 placeholder:text-warmgray-400 focus:ring-2 focus:ring-nature-500 focus:outline-none mb-6 shadow-sm"
            />

            <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
              Continuer
            </Button>
          </div>
        )}

        {/* STEP 4: URGENCY LEVEL */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-black text-nature-900 mb-2">
              Niveau de stress / Urgence ⏱️
            </h1>
            <p className="text-warmgray-600 text-sm mb-6">
              Rassurez-vous, un helper va recevoir votre alerte tout près.
            </p>

            <div className="space-y-3 mb-8">
              {urgencyOptions.map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => setUrgency(opt.level)}
                  className={`w-full p-5 rounded-3xl border-2 text-left transition-all flex items-start gap-4 ${
                    urgency === opt.level
                      ? `${opt.color} shadow-md scale-[1.01]`
                      : 'bg-white border-cream-200 text-warmgray-800 hover:border-cream-300'
                  }`}
                >
                  <div className="text-lg font-bold flex-1">
                    <div className="text-base font-extrabold mb-1">{opt.title}</div>
                    <div className="text-xs text-warmgray-600 font-normal">{opt.desc}</div>
                  </div>
                  {urgency === opt.level && (
                    <Check className="w-5 h-5 text-nature-700 shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
              Continuer
            </Button>
          </div>
        )}

        {/* STEP 5: REWARD SELECTION */}
        {step === 5 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-black text-nature-900 mb-2">
              Rémunération proposée 💰
            </h1>
            <p className="text-warmgray-600 text-sm mb-6">
              Sans Pattes prône l'entraide accessible. Vous choisissez ce que vous pouvez ou souhaitez proposer.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[0, 5, 10, 15, 20].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setIsCustomReward(false);
                    setRewardAmount(amt);
                  }}
                  className={`p-4 rounded-2xl border text-center transition-all font-bold ${
                    !isCustomReward && rewardAmount === amt
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-[1.02]'
                      : 'bg-white text-warmgray-800 border-cream-200 hover:border-amber-300'
                  }`}
                >
                  {amt === 0 ? '🤝 Gratuit / Entraide' : `${amt} CHF`}
                </button>
              ))}

              <button
                onClick={() => setIsCustomReward(true)}
                className={`p-4 rounded-2xl border text-center transition-all font-bold ${
                  isCustomReward
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-[1.02]'
                    : 'bg-white text-warmgray-800 border-cream-200 hover:border-amber-300'
                }`}
              >
                ✏️ Personnalisé
              </button>
            </div>

            {isCustomReward && (
              <div className="mb-6">
                <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-2">
                  Montant personnalisé en CHF
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={customReward}
                    onChange={(e) => setCustomReward(e.target.value)}
                    placeholder="Ex: 25"
                    className="w-full p-4 pl-12 rounded-2xl border border-cream-300 bg-white font-bold text-lg text-warmgray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <Coins className="w-5 h-5 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <Card className="bg-cream-100 p-4 mb-6 border-cream-200">
              <p className="text-xs text-warmgray-600 leading-relaxed flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                Le montant sera clairement visible par le helper AVANT qu'il n'accepte la mission.
              </p>
            </Card>

            <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
              Continuer
            </Button>
          </div>
        )}

        {/* STEP 6: LOCATION & PRIVACY */}
        {step === 6 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-black text-nature-900 mb-2">
              Votre Adresse 🏠
            </h1>
            <p className="text-warmgray-600 text-sm mb-6">
              Votre vie privée est strictement protégée.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-2">
                Adresse exacte du logement
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={exactAddress}
                  onChange={(e) => setExactAddress(e.target.value)}
                  className="w-full p-4 pl-12 rounded-2xl border border-cream-300 bg-white text-sm font-semibold text-warmgray-900 focus:ring-2 focus:ring-nature-500 focus:outline-none"
                />
                <MapPin className="w-5 h-5 text-nature-600 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Card className="bg-emerald-50 border-emerald-200 p-4 mb-6">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <span className="font-extrabold block mb-0.5">Confidentialité garantie :</span>
                  Avant acceptation, les helpers ne voient que :
                  <div className="font-bold text-emerald-950 mt-1 bg-white/80 p-2 rounded-xl border border-emerald-300 inline-block">
                    "{approxLocation}"
                  </div>
                  <br />Votre adresse exacte ne sera révélée QU'AU helper qui accepte la mission.
                </div>
              </div>
            </Card>

            <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
              Vérifier le résumé
            </Button>
          </div>
        )}

        {/* STEP 7: SUMMARY & CONFIRMATION */}
        {step === 7 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-black text-nature-900 mb-2">
              Résumé de votre alerte 📋
            </h1>
            <p className="text-warmgray-600 text-sm mb-6">
              Tout est prêt. Vérifiez les informations avant l'envoi aux helpers.
            </p>

            <Card className="p-5 mb-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-cream-200 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {category === 'Araignée' ? '🕷️' : category === 'Guêpe / abeille' ? '🐝' : '🐞'}
                  </span>
                  <div>
                    <span className="font-extrabold text-base text-nature-900 block">{category}</span>
                    <span className="text-xs text-warmgray-500">{room}</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                  💰 {isCustomReward ? `${customReward || 0} CHF` : `${rewardAmount} CHF`}
                </span>
              </div>

              {photoUrl && (
                <img 
                  src={photoUrl} 
                  alt="Bête" 
                  className="w-full h-40 object-cover rounded-xl shadow-inner" 
                />
              )}

              {description && (
                <div className="bg-cream-100 p-3 rounded-xl text-xs text-warmgray-800 italic">
                  "{description}"
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-warmgray-500 block">Urgence :</span>
                  <span className="font-bold text-warmgray-800">
                    {urgency === 'high' ? '🔴 Panique' : urgency === 'medium' ? '🟠 Rapide' : '🟢 Pas pressé'}
                  </span>
                </div>
                <div>
                  <span className="text-warmgray-500 block">Zone :</span>
                  <span className="font-bold text-warmgray-800">{approxLocation}</span>
                </div>
              </div>
            </Card>

            <Button 
              variant="primary" 
              size="xl" 
              fullWidth 
              onClick={handleSubmit}
              className="gap-2 shadow-xl hover:scale-[1.01]"
            >
              <span>Envoyer l'alerte maintenant</span>
              <Sparkles className="w-5 h-5" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
