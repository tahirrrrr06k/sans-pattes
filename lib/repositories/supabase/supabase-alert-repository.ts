import { supabase } from '@/lib/supabase/client';
import { Alert, AlertStatus, OutcomeType } from '@/types';
import { IAlertRepository, CreateAlertInput } from '../types';

export class SupabaseAlertRepository implements IAlertRepository {
  async getAlerts(): Promise<Alert[]> {
    const { data: alertsData, error } = await supabase
      .from('alerts')
      .select(`
        *,
        requester:profiles!alerts_requester_id_fkey(*),
        helper:profiles!alerts_helper_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error || !alertsData) return [];
    return alertsData as Alert[];
  }

  async getAlertById(id: string): Promise<Alert | null> {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        requester:profiles!alerts_requester_id_fkey(*),
        helper:profiles!alerts_helper_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as Alert;
  }

  async createAlert(input: CreateAlertInput, requesterId: string): Promise<Alert> {
    // 1. Insert alert in public/protected alerts table
    const { data: alertData, error: alertError } = await supabase
      .from('alerts')
      .insert({
        requester_id: requesterId,
        category: input.category,
        description: input.description,
        room: input.room,
        photo_url: input.photo_url || null,
        urgency: input.urgency,
        reward_amount: input.reward_amount,
        currency: 'CHF',
        status: 'searching',
        approximate_location: input.approximate_location,
        exact_address: input.exact_address,
        latitude: input.latitude,
        longitude: input.longitude,
      })
      .select()
      .single();

    if (alertError || !alertData) {
      throw new Error(`Failed to create alert: ${alertError?.message}`);
    }

    // 2. Also insert in alert_private_locations table for RLS protection
    await supabase
      .from('alert_private_locations')
      .insert({
        alert_id: alertData.id,
        exact_address: input.exact_address,
        latitude: input.latitude,
        longitude: input.longitude,
      });

    return alertData as Alert;
  }

  async acceptAlert(alertId: string, helperId: string): Promise<{ success: boolean; message?: string }> {
    // Atomic RPC call accept_alert to prevent race conditions
    const { data, error } = await supabase.rpc('accept_alert', {
      p_alert_id: alertId,
      p_helper_id: helperId,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: data?.success ?? true, message: data?.message };
  }

  async updateAlertStatus(alertId: string, status: AlertStatus): Promise<void> {
    await supabase
      .from('alerts')
      .update({
        status,
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq('id', alertId);
  }

  async completeIntervention(alertId: string, outcome: OutcomeType, outcomeNote?: string): Promise<void> {
    await supabase
      .from('alerts')
      .update({
        status: 'completed',
        outcome,
        outcome_note: outcomeNote || null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', alertId);
  }

  async cancelAlert(alertId: string): Promise<void> {
    await supabase
      .from('alerts')
      .update({ status: 'cancelled' })
      .eq('id', alertId);
  }

  subscribeToAlerts(onAlertChange: (alert: Alert) => void): () => void {
    const channel = supabase
      .channel('alerts_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        (payload) => {
          if (payload.new) {
            onAlertChange(payload.new as Alert);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
