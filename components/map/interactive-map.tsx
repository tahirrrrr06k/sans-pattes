'use client';

import React, { useEffect, useState } from 'react';
import { Alert, HelperSettings } from '@/types';
import { MapPin, Navigation, ShieldCheck } from 'lucide-react';

interface MapProps {
  alerts?: Alert[];
  userLocation?: { lat: number; lng: number };
  center?: [number, number];
  zoom?: number;
  onSelectAlert?: (alert: Alert) => void;
  selectedAlertId?: string;
  showExactAddress?: boolean;
}

export const InteractiveMap: React.FC<MapProps> = ({
  alerts = [],
  userLocation = { lat: 46.5197, lng: 6.6323 }, // Default Lausanne
  center = [46.5197, 6.6323],
  zoom = 13,
  onSelectAlert,
  selectedAlertId,
  showExactAddress = false
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-64 bg-cream-100 rounded-3xl animate-pulse flex items-center justify-center text-warmgray-500 text-sm">
        Chargement de la carte interactive...
      </div>
    );
  }

  return (
    <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-cream-200 shadow-inner bg-[#e5e9ec]">
      {/* Visual Canvas Representation / Leaflet Map Container */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-cream-100 to-blue-50/50 p-4 flex flex-col justify-between">
        
        {/* Top Floating Badge */}
        <div className="flex items-center justify-between z-10">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-nature-900 border border-cream-200 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Zone : Lausanne &amp; environ (~5 km)</span>
          </div>

          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-warmgray-700 border border-cream-200 shadow-sm flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-nature-600" />
            <span>Position protégée</span>
          </div>
        </div>

        {/* Center Map Grid & Markers Simulation */}
        <div className="relative flex-1 my-2 flex items-center justify-center">
          
          {/* User Marker Dot */}
          <div className="absolute flex flex-col items-center group cursor-pointer z-20">
            <div className="w-8 h-8 rounded-full bg-nature-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold animate-bounce">
              📍
            </div>
            <span className="bg-nature-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md mt-1 backdrop-blur-sm">
              Vous êtes ici
            </span>
          </div>

          {/* Active Alerts Pins on Map */}
          {alerts.map((alert, index) => {
            const isSelected = alert.id === selectedAlertId;
            // Offsets for demo display on map grid
            const offsetX = (index % 2 === 0 ? 1 : -1) * (60 + index * 40);
            const offsetY = (index % 3 === 0 ? -40 : 50);

            return (
              <button
                key={alert.id}
                onClick={() => onSelectAlert && onSelectAlert(alert)}
                style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
                className={`absolute z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg transition-all duration-300 border ${
                  isSelected 
                    ? 'bg-rose-600 text-white border-white scale-110 ring-4 ring-rose-300' 
                    : 'bg-white text-nature-900 border-cream-300 hover:scale-105'
                }`}
              >
                <span className="text-base">
                  {alert.category === 'Araignée' ? '🕷️' : alert.category === 'Guêpe / abeille' ? '🐝' : '🐞'}
                </span>
                <span className="text-xs font-bold whitespace-nowrap">
                  {alert.reward_amount > 0 ? `${alert.reward_amount} CHF` : 'Entraide'}
                </span>
              </button>
            );
          })}

          {/* Helper Radar Ring Circles */}
          <div className="absolute w-48 h-48 rounded-full border border-nature-500/20 pointer-events-none animate-pulse" />
          <div className="absolute w-72 h-72 rounded-full border border-nature-500/10 pointer-events-none" />
        </div>

        {/* Bottom Legend */}
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-cream-200 shadow-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="font-semibold text-warmgray-800">
              {alerts.length} alerte(s) active(s) à proximité
            </span>
          </div>
          <span className="text-[11px] text-warmgray-500 italic">
            {showExactAddress ? 'Adresse exacte visible' : 'Rayon anonymisé'}
          </span>
        </div>

      </div>
    </div>
  );
};
