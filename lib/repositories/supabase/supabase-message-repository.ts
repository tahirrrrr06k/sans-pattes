import { supabase } from '@/lib/supabase/client';
import { Message } from '@/types';
import { IMessageRepository } from '../types';

export class SupabaseMessageRepository implements IMessageRepository {
  async getMessagesForAlert(alertId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('alert_id', alertId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data as Message[];
  }

  async sendMessage(alertId: string, senderId: string, recipientId: string, content: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        alert_id: alertId,
        sender_id: senderId,
        recipient_id: recipientId,
        content,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to send message: ${error?.message}`);
    }

    return data as Message;
  }
}
