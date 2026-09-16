import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { GlobalChatMessage } from '@/types';
import { INITIAL_GLOBAL_CHAT } from '@/lib/mock/initial-global-chat';

export class SupabaseGlobalChatRepository {
  async getMessages(): Promise<GlobalChatMessage[]> {
    if (!isSupabaseConfigured()) {
      return this.getMockMessages();
    }

    const { data, error } = await supabase
      .from('global_chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error || !data) {
      console.warn('Failed to fetch global chat messages from Supabase, falling back to mock:', error?.message);
      return this.getMockMessages();
    }

    return data as GlobalChatMessage[];
  }

  async sendMessage(input: {
    anonymous_user_id: string;
    nickname: string;
    avatar_color?: string;
    content: string;
    reply_to_id?: string | null;
  }): Promise<GlobalChatMessage> {
    if (!isSupabaseConfigured()) {
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

    if (error || !data) {
      console.warn('Supabase global chat insert error:', error?.message);
      // Fallback local save if offline or RLS fails
      const fallbackMsg: GlobalChatMessage = {
        id: 'gmsg_' + Date.now(),
        anonymous_user_id: input.anonymous_user_id,
        nickname: input.nickname,
        avatar_color: input.avatar_color || 'emerald',
        content: input.content,
        reply_to_id: input.reply_to_id || null,
        is_deleted: false,
        created_at: new Date().toISOString(),
      };
      this.addMockMessage(fallbackMsg);
      return fallbackMsg;
    }

    return data as GlobalChatMessage;
  }

  async softDeleteMessage(messageId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      this.deleteMockMessage(messageId);
      return true;
    }

    const { error } = await supabase
      .from('global_chat_messages')
      .update({ is_deleted: true, content: 'Message supprimé' })
      .eq('id', messageId);

    if (error) {
      this.deleteMockMessage(messageId);
    }

    return !error;
  }

  async reportMessage(messageId: string, reporterNickname: string, reason: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return true;
    }

    const { error } = await supabase
      .from('global_chat_reports')
      .insert({
        message_id: messageId,
        reporter_nickname: reporterNickname,
        reason: reason,
      });

    return !error;
  }

  subscribeToMessages(
    onNewMessage: (msg: GlobalChatMessage) => void,
    onDeleteMessage?: (msgId: string) => void
  ): () => void {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

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
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'global_chat_messages' },
        (payload) => {
          if (payload.new && payload.new.is_deleted && onDeleteMessage) {
            onDeleteMessage(payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
