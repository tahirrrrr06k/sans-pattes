'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { AuthModal } from '@/components/auth/auth-modal';
import { User, LogIn, UserCheck } from 'lucide-react';
import Link from 'next/link';

export const Header: React.FC = () => {
  const { currentUser, userRoleMode, setUserRoleMode } = useApp();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  return (
    <>
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

          {/* User Account & Role Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Logged-In User Profile Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white border border-cream-300 hover:border-nature-400 text-xs font-bold text-warmgray-800 rounded-full px-3 py-1.5 shadow-sm flex items-center gap-2 transition-all"
            >
              <img
                src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.first_name)}`}
                alt={currentUser.first_name}
                className="w-5 h-5 rounded-full object-cover border border-nature-600"
              />
              <span className="max-w-[100px] truncate">{currentUser.first_name}</span>
            </button>

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
                <span>🟢 Helper</span>
              ) : (
                <span>🏠 Demandeur</span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* Auth & Registration Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};
