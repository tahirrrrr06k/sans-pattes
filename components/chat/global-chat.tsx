'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlobalChatMessage } from '@/types';
import { globalChatRepository } from '@/lib/repositories';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  Reply, 
  Trash2, 
  Flag, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  X, 
  AlertTriangle,
  MessageSquare,
  Check,
  UserCheck
} from 'lucide-react';

const AVATAR_COLORS = [
  { id: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'sky', bg: 'bg-sky-500', text: 'text-sky-700', border: 'border-sky-200' },
  { id: 'amber', bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200' },
  { id: 'purple', bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200' },
  { id: 'rose', bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200' },
];

export function GlobalChat() {
  const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [avatarColor, setAvatarColor] = useState<string>('emerald');
  const [anonymousId, setAnonymousId] = useState<string>('');
  
  // Modals & UI States
  const [showNicknameModal, setShowNicknameModal] = useState<boolean>(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState<boolean>(false);
  const [reportTargetMsg, setReportTargetMsg] = useState<GlobalChatMessage | null>(null);
  const [reportReason, setReportReason] = useState<string>('Contenu inapproprié');
  const [reportSuccessToast, setReportSuccessToast] = useState<string | null>(null);

  // Composer States
  const [replyToMsg, setReplyToMsg] = useState<GlobalChatMessage | null>(null);
  const [lastSentTimestamp, setLastSentTimestamp] = useState<number>(0);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize User Anonymous Session & Nickname from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let anonId = localStorage.getItem('sp_chat_anon_id');
      if (!anonId) {
        anonId = 'anon_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
        localStorage.setItem('sp_chat_anon_id', anonId);
      }
      setAnonymousId(anonId);

      const savedNick = localStorage.getItem('sp_chat_nickname');
      const savedColor = localStorage.getItem('sp_chat_avatar_color') || 'emerald';
      
      if (savedNick) {
        setNickname(savedNick);
        setAvatarColor(savedColor);
      } else {
        setShowNicknameModal(true);
      }
    }
  }, []);

  // 2. Load Messages & Subscribe to Realtime Updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadInitialAndSubscribe = async () => {
      const initial = await globalChatRepository.getMessages();
      setMessages(initial);

      unsubscribe = globalChatRepository.subscribeToMessages(
        (newMsg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        },
        (deletedId) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === deletedId
                ? { ...m, is_deleted: true, content: 'Message supprimé' }
                : m
            )
          );
        }
      );
    };

    loadInitialAndSubscribe();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Scroll to bottom on message change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cooldown timer logic
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Save Nickname
  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim().replace(/[^a-zA-Z0-9_\-À-ÿ ]/g, '');
    if (!cleanNick) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_chat_nickname', cleanNick);
      localStorage.setItem('sp_chat_avatar_color', avatarColor);
    }
    setNickname(cleanNick);
    setShowNicknameModal(false);
  };

  // Send Message with Rate Limiting (3s cooldown)
  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    if (!nickname) {
      setShowNicknameModal(true);
      return;
    }

    const now = Date.now();
    const timeSinceLast = (now - lastSentTimestamp) / 1000;
    if (timeSinceLast < 3) {
      setCooldownSeconds(Math.ceil(3 - timeSinceLast));
      return;
    }

    setIsSending(true);

    try {
      const created = await globalChatRepository.sendMessage({
        anonymous_user_id: anonymousId,
        nickname: nickname,
        avatar_color: avatarColor,
        content: inputText.trim(),
        reply_to_id: replyToMsg?.id || null,
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        return [...prev, created];
      });

      setInputText('');
      setReplyToMsg(null);
      setLastSentTimestamp(Date.now());
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Soft Delete
  const handleSoftDelete = async (msgId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, is_deleted: true, content: 'Message supprimé' } : m
      )
    );

    await globalChatRepository.softDeleteMessage(msgId);
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (!reportTargetMsg) return;

    await globalChatRepository.reportMessage(
      reportTargetMsg.id,
      nickname || 'Anonyme',
      reportReason
    );

    setReportTargetMsg(null);
    setReportSuccessToast('Merci. Le message a été signalé à l\'équipe de modération.');
    setTimeout(() => setReportSuccessToast(null), 4000);
  };

  const getColorClasses = (colorName?: string) => {
    const matched = AVATAR_COLORS.find((c) => c.id === colorName);
    return matched || AVATAR_COLORS[0];
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* Header Info & Guidelines Link */}
      <div className="bg-nature-50 border border-nature-200 p-3 rounded-2xl mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-nature-900 font-medium">
          <ShieldCheck className="w-4 h-4 text-nature-600 shrink-0" />
          <span>
            Connecté en tant que <strong className="font-black text-nature-950">{nickname || 'Anonyme'}</strong>
          </span>
          <button 
            onClick={() => setShowNicknameModal(true)}
            className="text-[10px] text-nature-700 font-bold underline ml-1 hover:text-nature-900"
          >
            (Modifier)
          </button>
        </div>
        <button
          onClick={() => setShowGuidelinesModal(true)}
          className="flex items-center gap-1 font-bold text-nature-800 bg-white px-2.5 py-1 rounded-full border border-nature-300 hover:bg-nature-100 transition-colors shrink-0"
        >
          <span>📜 Charte</span>
        </button>
      </div>

      {/* Success Toast */}
      {reportSuccessToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold p-3 rounded-2xl mb-3 flex items-center gap-2 animate-fade-in shadow-md">
          <Check className="w-4 h-4" />
          <span>{reportSuccessToast}</span>
        </div>
      )}

      {/* Messages List Container */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-white rounded-3xl border border-cream-200 min-h-[350px] max-h-[500px] mb-3">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-warmgray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-bold text-warmgray-600">Aucun message sur le chat public</p>
            <p className="text-[11px] text-warmgray-400">Soyez le premier à poster dans la communauté !</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMyMsg = msg.anonymous_user_id === anonymousId;
            const colorObj = getColorClasses(msg.avatar_color);
            const repliedTarget = msg.reply_to_id 
              ? messages.find((m) => m.id === msg.reply_to_id)
              : null;

            return (
              <div 
                key={msg.id}
                className={`flex gap-2.5 ${isMyMsg ? 'flex-row-reverse' : 'flex-row'} items-start group`}
              >
                {/* Avatar */}
                <div 
                  className={`w-8 h-8 rounded-full ${colorObj.bg} text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm uppercase`}
                >
                  {msg.nickname ? msg.nickname.charAt(0) : '?'}
                </div>

                {/* Content Box */}
                <div className={`max-w-[80%] flex flex-col ${isMyMsg ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender Name & Time */}
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-extrabold text-warmgray-800">
                      {msg.nickname}
                    </span>
                    {isMyMsg && (
                      <span className="text-[9px] bg-nature-100 text-nature-800 font-bold px-1.5 py-0.2 rounded-md">
                        Vous
                      </span>
                    )}
                    <span className="text-[9px] text-warmgray-400 font-medium ml-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Reply Reference Bubble */}
                  {repliedTarget && (
                    <div className="bg-cream-100 border-l-2 border-nature-500 text-[10px] text-warmgray-700 p-1.5 rounded-r-lg mb-1 max-w-full truncate italic">
                      <span className="font-bold">{repliedTarget.nickname}:</span> {repliedTarget.content}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div 
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm font-medium ${
                      msg.is_deleted
                        ? 'bg-warmgray-100 text-warmgray-400 italic border border-cream-200'
                        : isMyMsg
                        ? 'bg-nature-700 text-white rounded-tr-none'
                        : 'bg-cream-50 text-warmgray-900 border border-cream-200 rounded-tl-none'
                    }`}
                  >
                    {msg.is_deleted ? (
                      <span className="flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Message supprimé</span>
                      </span>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>

                  {/* Action Bar (Reply, Delete, Report) */}
                  {!msg.is_deleted && (
                    <div className="flex items-center gap-3 mt-1 px-1 text-[10px] text-warmgray-400">
                      <button
                        onClick={() => setReplyToMsg(msg)}
                        className="hover:text-nature-700 flex items-center gap-0.5 font-semibold transition-colors"
                      >
                        <Reply className="w-3 h-3" />
                        <span>Répondre</span>
                      </button>

                      {isMyMsg ? (
                        <button
                          onClick={() => handleSoftDelete(msg.id)}
                          className="hover:text-rose-600 flex items-center gap-0.5 font-semibold transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Supprimer</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setReportTargetMsg(msg)}
                          className="hover:text-amber-600 flex items-center gap-0.5 font-semibold transition-colors"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Signaler</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Reply Preview Bar */}
      {replyToMsg && (
        <div className="bg-nature-50 border-t border-b border-nature-200 p-2.5 rounded-xl mb-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <Reply className="w-4 h-4 text-nature-600 shrink-0" />
            <span className="text-nature-900 truncate">
              Réponse à <strong className="font-extrabold">{replyToMsg.nickname}</strong>: "{replyToMsg.content}"
            </span>
          </div>
          <button 
            onClick={() => setReplyToMsg(null)}
            className="p-1 hover:bg-nature-200 rounded-full text-warmgray-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Composer Input */}
      <div className="relative flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            type="text"
            maxLength={500}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              cooldownSeconds > 0
                ? `Veuillez patienter ${cooldownSeconds}s...`
                : "Partagez un message avec la communauté (500 car. max)..."
            }
            disabled={cooldownSeconds > 0 || isSending}
            className="flex-1 p-3.5 pl-5 pr-14 rounded-full border border-cream-300 bg-white text-xs font-semibold text-warmgray-900 focus:ring-2 focus:ring-nature-500 focus:outline-none shadow-sm disabled:bg-cream-100"
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || cooldownSeconds > 0 || isSending}
            className="w-11 h-11 rounded-full bg-nature-600 text-white flex items-center justify-center shadow-md disabled:opacity-40 hover:bg-nature-700 transition-all shrink-0"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>

        {/* Char Counter & Cooldown Badge */}
        <div className="flex justify-between items-center px-3 text-[10px] text-warmgray-400">
          <span>
            {cooldownSeconds > 0 && (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Anti-spam activé ({cooldownSeconds}s)
              </span>
            )}
          </span>
          <span className={inputText.length > 450 ? 'text-amber-600 font-bold' : ''}>
            {inputText.length} / 500
          </span>
        </div>
      </div>

      {/* MODAL 1: NICKNAME SETUP */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <Card className="max-w-sm w-full p-6 bg-white rounded-3xl shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-nature-100 rounded-full flex items-center justify-center mx-auto mb-3 text-nature-700">
                <UserCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-nature-950">
                Bienvenue sur le Chat Public ! 🐾
              </h3>
              <p className="text-xs text-warmgray-600 mt-1">
                Choisissez un pseudonyme pour échanger anonymement avec la communauté Sans Pattes.
              </p>
            </div>

            <form onSubmit={handleSaveNickname} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1.5">
                  Votre Pseudo (ex: Sophie_1003, Helper_Lausanne)
                </label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ex: Sophie_Lausanne"
                  className="w-full p-3 rounded-xl border border-cream-300 text-sm font-bold text-warmgray-900 focus:ring-2 focus:ring-nature-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1.5">
                  Couleur d'avatar
                </label>
                <div className="flex justify-center gap-3">
                  {AVATAR_COLORS.map((col) => (
                    <button
                      type="button"
                      key={col.id}
                      onClick={() => setAvatarColor(col.id)}
                      className={`w-9 h-9 rounded-full ${col.bg} transition-all flex items-center justify-center ${
                        avatarColor === col.id ? 'ring-4 ring-nature-400 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {avatarColor === col.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="primary" size="lg" fullWidth type="submit" className="mt-4">
                Rejoindre le chat public
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 2: COMMUNITY GUIDELINES */}
      {showGuidelinesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <Card className="max-w-md w-full p-6 bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-nature-600" />
                <h3 className="text-lg font-black text-nature-950">Charte de la Communauté</h3>
              </div>
              <button 
                onClick={() => setShowGuidelinesModal(false)}
                className="p-1.5 hover:bg-cream-200 rounded-full text-warmgray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-warmgray-700 leading-relaxed">
              <div className="p-3 bg-nature-50 rounded-2xl border border-nature-200">
                <h4 className="font-extrabold text-nature-900 text-sm mb-1">1. Respect absolu des phobies 💜</h4>
                <p>
                  Chaque personne réagit différemment face aux arachnides et insectes. Aucun jugement, moquerie ou propos rabaissant n'est toléré sur les peurs d'autrui.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <h4 className="font-extrabold text-emerald-900 text-sm mb-1">2. Entraide & Capture Douce 🌿</h4>
                <p>
                  Sans Pattes promeut la relâche respectueuse des petites bêtes dans la nature (méthode du verre & bocal). Ne conseillez jamais d'écraser ou tuer un animal non dangereux.
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <h4 className="font-extrabold text-amber-900 text-sm mb-1">3. Courtoisie & Sécurité 🤝</h4>
                <p>
                  Restez poli, respectueux et constructif. Les fausses alertes, spams, propos haineux ou démarchages commerciaux entraînent le bannissement immédiat.
                </p>
              </div>
            </div>

            <Button 
              variant="primary" 
              size="lg" 
              fullWidth 
              onClick={() => setShowGuidelinesModal(false)}
              className="mt-6"
            >
              J'ai compris et j'accepte
            </Button>
          </Card>
        </div>
      )}

      {/* MODAL 3: REPORT MESSAGE */}
      {reportTargetMsg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <Card className="max-w-sm w-full p-6 bg-white rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-black text-warmgray-900">Signaler un message</h3>
              </div>
              <button 
                onClick={() => setReportTargetMsg(null)}
                className="p-1.5 hover:bg-cream-200 rounded-full text-warmgray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-cream-100 p-3 rounded-2xl text-xs italic text-warmgray-700 mb-4 border-l-4 border-amber-500">
              "{reportTargetMsg.content}"
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider">
                Raison du signalement :
              </label>
              {[
                'Contenu inapproprié',
                'Spam ou publicité',
                'Insulte ou manque de respect',
                'Fausse alerte / Canular',
                'Autre'
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    reportReason === reason
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                      : 'bg-white text-warmgray-800 border-cream-200 hover:border-amber-300'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                fullWidth 
                onClick={() => setReportTargetMsg(null)}
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleSubmitReport}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Envoyer le signalement
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
