'use client';

import React from 'react';
import { useApp } from '@/lib/store/app-context';
import { DEMO_PROFILES } from '@/lib/mock/initial-data';
import { Bug, Shield, Users, UserCheck } from 'lucide-react';
import Link from 'next/link';

export const Header: React.FC = () => {
  const { currentUser, setCurrentUserKey, userRoleMode, setUserRoleMode } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-cream-200 px-4 py-3 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-nature-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            🐾
          </div>
          <div>
            <span className="font-extrabold text-lg text-nature-900 leading-tight block tracking-tight">
              Sans Pattes
            </span>
            <span className="text-[10px] text-nature-600 font-medium block -mt-1">
              Entraide &amp; Respect Animal
            </span>
          </div>
        </Link>

        {/* Demo Account Switcher & Role Selector */}
        <div className="flex items-center gap-2">
          
          {/* User Profile Selector */}
          <div className="relative">
            <select
              aria-label="Changer de compte démonstration"
              className="bg-white border border-cream-300 text-xs font-semibold text-warmgray-800 rounded-full pl-8 pr-6 py-1.5 shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-nature-500"
              value={currentUser.id === DEMO_PROFILES['emma'].id ? 'emma' : 
                     currentUser.id === DEMO_PROFILES['lucas'].id ? 'lucas' : 
                     currentUser.id === DEMO_PROFILES['sofia'].id ? 'sofia' : 'nicolas'}
              onChange={(e) => setCurrentUserKey(e.target.value)}
            >
              <option value="emma">👩 Emma (Demandeur)</option>
              <option value="lucas">👨 Lucas (Helper 4.9⭐)</option>
              <option value="sofia">👩 Sofia (Helper 5.0⭐)</option>
              <option value="nicolas">👨 Nicolas (Helper 4.7⭐)</option>
            </select>
            <UserCheck className="w-3.5 h-3.5 text-nature-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mode Switcher Button */}
          <button
            onClick={() => setUserRoleMode(userRoleMode === 'requester' ? 'helper' : 'requester')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 border ${
              userRoleMode === 'helper' 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-nature-100 text-nature-800 border-nature-300'
            }`}
          >
            {userRoleMode === 'helper' ? (
              <>
                <span>🟢 Mode Helper</span>
              </>
            ) : (
              <>
                <span>🏠 Mode Demandeur</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
