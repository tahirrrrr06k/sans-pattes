'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useApp } from '@/lib/store/app-context';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { messages, currentUser } = useApp();

  const unreadCount = messages.filter(
    m => m.recipient_id === currentUser.id
  ).length;

  const navItems = [
    { label: 'Accueil', href: '/', icon: Home },
    { label: 'Autour de moi', href: '/around', icon: MapPin },
    { label: 'Alerte', href: '/alert/new', icon: PlusCircle, isMain: true },
    { label: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
    { label: 'Profil', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-200 px-2 py-2 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-nature-700 to-nature-500 text-white flex items-center justify-center shadow-lg shadow-nature-600/30 group-hover:scale-105 active:scale-95 transition-all border-4 border-cream-50">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-extrabold text-nature-800 mt-0.5">
                  Alerte
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all relative ${
                isActive ? 'text-nature-600 font-bold' : 'text-warmgray-500 hover:text-warmgray-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
