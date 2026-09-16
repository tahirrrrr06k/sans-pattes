import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert } from 'lucide-react';

export const DangerousAnimalBanner: React.FC<{ category?: string }> = ({ category }) => {
  const isDangerous = category === 'Guêpe / abeille';

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 text-amber-900 shadow-sm flex items-start gap-3.5 my-4">
      <div className="p-2.5 bg-amber-200 text-amber-900 rounded-2xl shrink-0">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div className="text-xs sm:text-sm leading-relaxed">
        <h4 className="font-extrabold text-amber-950 text-base mb-1 flex items-center gap-1.5">
          ⚠️ Sécurité &amp; Animaux Potentiellement Dangereux
        </h4>
        <p className="mb-2">
          Sans Pattes est dédié aux petites bêtes inoffensives du quotidien. En cas de nid d'insectes piquants massif (frelons asiatiques, essaim massif) ou d'animal dangereux :
        </p>
        <div className="font-bold text-amber-950 bg-amber-100/80 p-2.5 rounded-xl border border-amber-300">
          "Cette situation peut nécessiter du matériel professionnel spécialisé."
        </div>
        <div className="mt-2.5 flex items-center gap-3 font-semibold text-xs text-amber-900">
          <span className="flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5" /> Pompiers : 118 (Suisse)
          </span>
          <span>•</span>
          <span>Protection Animaux / Vétérinaire</span>
        </div>
      </div>
    </div>
  );
};
