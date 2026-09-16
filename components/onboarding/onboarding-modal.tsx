'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Button } from '@/components/ui/button';
import { Heart, ShieldCheck, Users, Sparkles, ChevronRight, Check } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { onboardingCompleted, setOnboardingCompleted } = useApp();
  const [step, setStep] = useState<number>(0);

  if (onboardingCompleted) return null;

  const slides = [
    {
      icon: '🕷️',
      title: 'Une petite bête, un gros problème ?',
      description: 'Vous êtes seul(e) chez vous et terrifié(e) par une araignée ou un insecte ? Pas de panique, vous n\'êtes plus seul(e).',
      accentColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      icon: '🤝',
      title: 'Des voisins prêts à aider',
      description: 'Les helpers bienveillants disponibles autour de vous reçoivent instantanément votre alerte et interviennent chez vous.',
      accentColor: 'bg-blue-100 text-blue-800'
    },
    {
      icon: '🌿',
      title: 'Sans faire de mal à la bête',
      description: 'Tous les helpers s\'engagent à capturer l\'animal avec soin pour le relâcher dehors dans la nature.',
      accentColor: 'bg-nature-100 text-nature-800'
    },
    {
      icon: '💰',
      title: 'Entraide ou petite récompense',
      description: 'Gratuit ou avec une gratification libre (5 CHF, 10 CHF...), c\'est vous qui choisissez ce que vous voulez ou pouvez proposer.',
      accentColor: 'bg-amber-100 text-amber-900'
    }
  ];

  const current = slides[step];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      setOnboardingCompleted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        
        {/* Slide Icon */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner ${current.accentColor}`}>
          {current.icon}
        </div>

        {/* Slide Title */}
        <h2 className="text-2xl font-black text-nature-900 mb-3 leading-snug">
          {current.title}
        </h2>

        {/* Slide Description */}
        <p className="text-warmgray-600 text-sm leading-relaxed mb-8">
          {current.description}
        </p>

        {/* Dots Pagination */}
        <div className="flex items-center gap-2 mb-8">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === step ? 'w-8 bg-nature-600' : 'w-2.5 bg-cream-300'
              }`}
            />
          ))}
        </div>

        {/* Next / Start Button */}
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth
          onClick={handleNext}
          className="gap-2"
        >
          {step === slides.length - 1 ? (
            <>
              <Check className="w-5 h-5" />
              <span>Commencer</span>
            </>
          ) : (
            <>
              <span>Suivant</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </Button>

      </div>
    </div>
  );
};
