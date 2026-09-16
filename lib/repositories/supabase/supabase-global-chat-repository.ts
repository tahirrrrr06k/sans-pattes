import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { GlobalChatMessage } from '@/types';
import { INITIAL_GLOBAL_CHAT } from '@/lib/mock/initial-global-chat';

export class SupabaseGlobalChatRepository {
  async getMessages(): Promise<GlobalChatMessage[]> {
    // 1. Try Cloudflare persistent API
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          return data.messages;
        }
      }
    } catch (e) {}

    // 2. Try Supabase
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('global_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        return data as GlobalChatMessage[];
      }
    }

    return this.getMockMessages();
  }

  async sendMessage(input: {
    anonymous_user_id: string;
    nickname: string;
    avatar_color?: string;
    content: string;
    reply_to_id?: string | null;
  }): Promise<GlobalChatMessage> {
    // 1. Try Cloudflare persistent API
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) return data.message;
      }
    } catch (e) {}

    // 2. Try Supabase
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('global_chat_messages')
        .insert({
          anonymous_user_id: input.anonymous_user_id,
          nickname: input.nickname,
          avatar_color: input.avatar_color || 'emerald',
          content: input.content,
          reply_to_id: input.reply_to_id || null,
        })
        .select()
        .single();

      if (!error && data) {
        return data as GlobalChatMessage;
      }
    }

    // 3. Fallback mock
    const mockMsg: GlobalChatMessage = {
      id: 'gmsg_' + Date.now(),
      anonymous_user_id: input.anonymous_user_id,
      nickname: input.nickname,
      avatar_color: input.avatar_color || 'emerald',
      content: input.content,
      reply_to_id: input.reply_to_id || null,
      is_deleted: false,
      created_at: new Date().toISOString(),
    };
    this.addMockMessage(mockMsg);
    return mockMsg;
  }

  async softDeleteMessage(messageId: string): Promise<boolean> {
    try {
      await fetch('/api/chat/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId }),
      });
    } catch (e) {}

    if (isSupabaseConfigured()) {
      await supabase
        .from('global_chat_messages')
        .update({ is_deleted: true, content: 'Message supprimé' })
        .eq('id', messageId);
    }

    this.deleteMockMessage(messageId);
    return true;
  }

  async reportMessage(messageId: string, reporterNickname: string, reason: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      await supabase
        .from('global_chat_reports')
        .insert({
          message_id: messageId,
          reporter_nickname: reporterNickname,
          reason: reason,
        });
    }
    return true;
  }

  subscribeToMessages(
    onNewMessage: (msg: GlobalChatMessage) => void,
    onDeleteMessage?: (msgId: string) => void
  ): () => void {
    // 1. Polling Cloudflare API every 2.5 seconds for instant cross-device updates
    let active = true;
    let knownIds = new Set<string>();

    const poll = async () => {
      if (!active) return;
      try {
        const res = await fetch('/api/chat');
        if (res.ok) {
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages)) {
            for (const msg of data.messages) {
              if (!knownIds.has(msg.id)) {
                knownIds.add(msg.id);
                onNewMessage(msg);
              } else if (msg.is_deleted && onDeleteMessage) {
                onDeleteMessage(msg.id);
              }
            }
          }
        }
      } catch (e) {}
    };

    poll();
    const interval = setInterval(poll, 2500);

    // 2. Supabase Realtime channel if configured
    let unsubSupabase: (() => void) | undefined;
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('global_chat_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'global_chat_messages' },
          (payload) => {
            if (payload.new) {
              onNewMessage(payload.new as GlobalChatMessage);
            }
          }
        )
        .subscribe();
      unsubSupabase = () => supabase.removeChannel(channel);
    }

    return () => {
      active = false;
      clearInterval(interval);
      if (unsubSupabase) unsubSupabase();
    };
  }

  private getMockMessages(): GlobalChatMessage[] {
    if (typeof window === 'undefined') return INITIAL_GLOBAL_CHAT;
    const stored = localStorage.getItem('sp_global_chat');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return INITIAL_GLOBAL_CHAT;
  }

  private addMockMessage(msg: GlobalChatMessage) {
    if (typeof window === 'undefined') return;
    const current = this.getMockMessages();
    const updated = [...current, msg];
    localStorage.setItem('sp_global_chat', JSON.stringify(updated));
  }

  private deleteMockMessage(messageId: string) {
    if (typeof window === 'undefined') return;
    const current = this.getMockMessages();
    const updated = current.map(m => m.id === messageId ? { ...m, is_deleted: true, content: 'Message supprimé' } : m);
    localStorage.setItem('sp_global_chat', JSON.stringify(updated));
  }
}
