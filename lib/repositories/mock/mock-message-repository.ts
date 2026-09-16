import { Message } from '@/types';
import { IMessageRepository } from '../types';
import { INITIAL_MESSAGES } from '@/lib/mock/initial-data';

export class MockMessageRepository implements IMessageRepository {
  private messages: Message[] = INITIAL_MESSAGES;

  async getMessagesForAlert(alertId: string): Promise<Message[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sp_messages');
      if (saved) {
        try { this.messages = JSON.parse(saved); } catch (e) {}
      }
    }
    return this.messages.filter(m => m.alert_id === alertId);
  }

  async sendMessage(alertId: string, senderId: string, recipientId: string, content: string): Promise<Message> {
    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      alert_id: alertId,
      sender_id: senderId,
      recipient_id: recipientId,
      content,
      created_at: new Date().toISOString(),
    };

    this.messages = [...this.messages, newMsg];
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_messages', JSON.stringify(this.messages));
    }
    return newMsg;
  }
}
