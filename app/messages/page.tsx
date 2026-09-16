'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEMO_PROFILES } from '@/lib/mock/initial-data';
import { ArrowLeft, Send, Sparkles, MessageSquare, Check, Clock } from 'lucide-react';

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { alerts, messages, currentUser, sendMessage } = useApp();

  const selectedAlertId = searchParams.get('alertId');
  const [inputText, setInputText] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Active Alert for messaging
  const activeAlert = alerts.find(a => 
    a.id === selectedAlertId || 
    (a.status !== 'completed' && a.status !== 'cancelled' && (a.requester_id === currentUser.id || a.helper_id === currentUser.id))
  ) || alerts[0];

  const recipientProfile = activeAlert
    ? (activeAlert.requester_id === currentUser.id ? (activeAlert.helper || DEMO_PROFILES['lucas']) : (activeAlert.requester || DEMO_PROFILES['emma']))
    : DEMO_PROFILES['lucas'];

  const quickReplies = [
    "J'arrive 🚶",
    "Je suis devant chez vous 📍",
    "Où est-elle exactement ? ❓",
    "Je l'ai trouvée ! 🕸️",
    "Je ne la vois plus... 👀"
  ];

  const activeMessages = messages.filter(m => m.alert_id === activeAlert?.id);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeAlert) return;

    sendMessage(activeAlert.id, text, recipientProfile.id);
    setInputText('');
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-28 px-4 pt-4 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 mb-3">
          <button 
            onClick={() => router.push('/')}
            className="p-2 rounded-full hover:bg-cream-200 text-warmgray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <img 
              src={recipientProfile.avatar_url} 
              alt={recipientProfile.first_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-nature-600 shadow-sm" 
            />
            <div>
              <h2 className="font-extrabold text-sm text-nature-900 leading-tight">
                Conversation avec {recipientProfile.first_name}
              </h2>
              <p className="text-[11px] text-nature-600 font-semibold">
                Intervention : {activeAlert?.category || 'Animal'}
              </p>
            </div>
          </div>

          <div className="w-8" />
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2 px-1 mb-4 min-h-[350px] max-h-[500px]">
          {activeMessages.length === 0 ? (
            <div className="text-center py-12 text-warmgray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-warmgray-600">Aucun message pour le moment</p>
              <p className="text-[11px]">Utilisez les réponses rapides ci-dessous pour informer votre interlocuteur.</p>
            </div>
          ) : (
            activeMessages.map((msg) => {
              const isMe = msg.sender_id === currentUser.id;
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3.5 rounded-3xl text-xs font-semibold leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-nature-600 text-white rounded-br-none' 
                        : 'bg-white text-warmgray-900 border border-cream-200 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-warmgray-400 mt-1 px-1 font-medium">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Reply Chips */}
        <div className="mb-3">
          <span className="text-[10px] font-extrabold text-warmgray-500 uppercase tracking-wider block mb-1.5 px-1">
            Réponses rapides :
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickReplies.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 rounded-full bg-white border border-cream-300 text-warmgray-800 text-xs font-bold whitespace-nowrap hover:bg-nature-50 hover:border-nature-300 transition-all shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="relative flex items-center gap-2">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tapez un message..."
            className="flex-1 p-3.5 pl-5 pr-12 rounded-full border border-cream-300 bg-white text-xs font-semibold text-warmgray-900 focus:ring-2 focus:ring-nature-500 focus:outline-none shadow-sm"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-full bg-nature-600 text-white flex items-center justify-center shadow-md disabled:opacity-40 hover:bg-nature-700 transition-all shrink-0"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-warmgray-500">Chargement des messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
