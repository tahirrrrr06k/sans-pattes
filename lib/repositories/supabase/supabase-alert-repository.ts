import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Alert, AlertStatus, OutcomeType } from '@/types';
import { IAlertRepository, CreateAlertInput } from '../types';

export class SupabaseAlertRepository implements IAlertRepository {
  async getAlerts(): Promise<Alert[]> {
    // 1. Try Cloudflare persistent API
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        if (data.alerts && Array.isArray(data.alerts)) {
          return data.alerts;
        }
      }
    } catch (e) {}

    // 2. Try Supabase
    if (isSupabaseConfigured()) {
      const { data: alertsData, error } = await supabase
        .from('alerts')
        .select(`
          *,
          requester:profiles!alerts_requester_id_fkey(*),
          helper:profiles!alerts_helper_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && alertsData) return alertsData as Alert[];
    }

    return [];
  }

  async getAlertById(id: string): Promise<Alert | null> {
    const alerts = await this.getAlerts();
    const found = alerts.find(a => a.id === id);
    if (found) return found;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          requester:profiles!alerts_requester_id_fkey(*),
          helper:profiles!alerts_helper_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (!error && data) return data as Alert;
    }

    return null;
  }

  async createAlert(input: CreateAlertInput, requesterId: string): Promise<Alert> {
    // 1. Try Cloudflare persistent API
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, requester_id: requesterId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.alert) return data.alert;
      }
    } catch (e) {}

    // 2. Try Supabase
    if (isSupabaseConfigured()) {
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

      if (!alertError && alertData) {
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
    }

    // 3. Fallback
    const fallback: Alert = {
      id: 'alert_' + Date.now(),
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
      created_at: new Date().toISOString(),
    };
    return fallback;
  }

  async acceptAlert(alertId: string, helperId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/alerts/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId, helper_id: helperId }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: data.success ?? true, message: data.message };
      }
    } catch (e) {}

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.rpc('accept_alert', {
        p_alert_id: alertId,
        p_helper_id: helperId,
      });

      if (!error) {
        return { success: data?.success ?? true, message: data?.message };
      }
    }

    return { success: true };
  }

  async updateAlertStatus(alertId: string, status: AlertStatus): Promise<void> {
    try {
      await fetch('/api/alerts/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId, status }),
      });
    } catch (e) {}

    if (isSupabaseConfigured()) {
      await supabase
        .from('alerts')
        .update({
          status,
          ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
        })
        .eq('id', alertId);
    }
  }

  async completeIntervention(alertId: string, outcome: OutcomeType, outcomeNote?: string): Promise<void> {
    try {
      await fetch('/api/alerts/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId, status: 'completed', outcome, outcome_note: outcomeNote }),
      });
    } catch (e) {}

    if (isSupabaseConfigured()) {
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
  }

  async cancelAlert(alertId: string): Promise<void> {
    try {
      await fetch('/api/alerts/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId, status: 'cancelled' }),
      });
    } catch (e) {}

    if (isSupabaseConfigured()) {
      await supabase
        .from('alerts')
        .update({ status: 'cancelled' })
        .eq('id', alertId);
    }
  }

  subscribeToAlerts(onAlertChange: (alert: Alert) => void): () => void {
    let active = true;
    let knownAlerts = new Map<string, string>(); // alertId -> status

    const poll = async () => {
      if (!active) return;
      try {
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const data = await res.json();
          if (data.alerts && Array.isArray(data.alerts)) {
            for (const a of data.alerts) {
              const knownStatus = knownAlerts.get(a.id);
              if (!knownStatus || knownStatus !== a.status) {
                knownAlerts.set(a.id, a.status);
                onAlertChange(a);
              }
            }
          }
        }
      } catch (e) {}
    };

    poll();
    const interval = setInterval(poll, 3000);

    let unsubSupabase: (() => void) | undefined;
    if (isSupabaseConfigured()) {
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
      unsubSupabase = () => supabase.removeChannel(channel);
    }

    return () => {
      active = false;
      clearInterval(interval);
      if (unsubSupabase) unsubSupabase();
    };
  }
}
