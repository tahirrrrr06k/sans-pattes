'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEMO_PROFILES } from '@/lib/mock/initial-data';
import { Star, Heart } from 'lucide-react';

export function RatingReviewClient({ alertId }: { alertId: string }) {
  const router = useRouter();
  const { alerts, submitReview } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([
    'Gentillesse', 'Rapidité', 'Respect', 'Précaution avec l\'animal'
  ]);
  const [comment, setComment] = useState<string>('');

  const alert = alerts.find(a => a.id === alertId) || alerts[0];
  const helperProfile = alert?.helper || DEMO_PROFILES['lucas'];

  const criteriaOptions = [
    'Gentillesse 🌸', 
    'Rapidité ⚡', 
    'Respect 🤝', 
    'Précaution avec l\'animal 🐾',
    'Ponctualité ⏰'
  ];

  const toggleCriteria = (item: string) => {
    if (selectedCriteria.includes(item)) {
      setSelectedCriteria(selectedCriteria.filter(c => c !== item));
    } else {
      setSelectedCriteria([...selectedCriteria, item]);
    }
  };

  const handleSubmit = () => {
    if (alert) {
      submitReview(alert.id, rating, selectedCriteria, comment);
    }
    router.push('/history');
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-28 px-4 pt-6">
      <div className="max-w-md mx-auto">
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
            🌟
          </div>
          <h1 className="text-2xl font-black text-nature-900 mb-1">
            Comment s'est passée l'intervention ?
          </h1>
          <p className="text-xs text-warmgray-600">
            Votre évaluation aide la communauté Sans Pattes à maintenir la confiance et le respect.
          </p>
        </div>

        {/* Helper Card */}
        <Card className="p-5 mb-6 text-center shadow-sm">
          <img 
            src={helperProfile.avatar_url} 
            alt={helperProfile.first_name}
            className="w-20 h-20 rounded-full object-cover border-4 border-nature-600 mx-auto mb-3 shadow-md" 
          />
          <h3 className="font-extrabold text-lg text-nature-900">
            {helperProfile.first_name} {helperProfile.last_name}
          </h3>
          <p className="text-xs text-warmgray-500 mb-4">
            Intervention : {alert?.category || 'Animal'} dans la {alert?.room || 'pièce'}
          </p>

          {/* Star Selector */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star 
                  className={`w-9 h-9 ${
                    star <= rating 
                      ? 'fill-amber-400 text-amber-400 drop-shadow' 
                      : 'text-warmgray-300'
                  }`} 
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-900">
            {rating === 5 ? 'Exceptionnel ! ⭐⭐⭐⭐⭐' : `${rating} étoile(s)`}
          </span>
        </Card>

        {/* Criteria Badges */}
        <div className="mb-6">
          <label className="block text-xs font-extrabold text-warmgray-700 uppercase tracking-wider mb-3">
            Qu'avez-vous particulièrement apprécié ?
          </label>
          <div className="flex flex-wrap gap-2">
            {criteriaOptions.map((item) => {
              const isSelected = selectedCriteria.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleCriteria(item)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-nature-600 text-white border-nature-600 shadow-sm'
                      : 'bg-white text-warmgray-700 border-cream-300 hover:border-nature-300'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Comment */}
        <div className="mb-6">
          <label className="block text-xs font-extrabold text-warmgray-700 uppercase tracking-wider mb-2">
            Un mot de remerciement ? (facultatif)
          </label>
          <textarea 
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ex: Merci mille fois Lucas d'être venu aussi vite, vous m'avez sauvé la soirée !"
            className="w-full p-4 rounded-2xl border border-cream-300 bg-white text-xs text-warmgray-900 focus:ring-2 focus:ring-nature-500 focus:outline-none shadow-sm"
          />
        </div>

        {/* Submit */}
        <Button 
          variant="primary" 
          size="xl" 
          fullWidth 
          onClick={handleSubmit}
          className="gap-2 shadow-xl"
        >
          <span>Envoyer mon évaluation</span>
          <Heart className="w-5 h-5 fill-rose-300 text-rose-300" />
        </Button>

      </div>
    </div>
  );
}
