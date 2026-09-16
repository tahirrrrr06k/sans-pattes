import { Alert, AlertStatus, OutcomeType } from '@/types';
import { IAlertRepository, CreateAlertInput } from '../types';
import { INITIAL_ALERTS, DEMO_PROFILES } from '@/lib/mock/initial-data';

export class MockAlertRepository implements IAlertRepository {
  private alerts: Alert[] = INITIAL_ALERTS;

  async getAlerts(): Promise<Alert[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sp_alerts');
      if (saved) {
        try { this.alerts = JSON.parse(saved); } catch (e) {}
      }
    }
    return this.alerts;
  }

  async getAlertById(id: string): Promise<Alert | null> {
    const alerts = await this.getAlerts();
    return alerts.find(a => a.id === id) || null;
  }

  async createAlert(input: CreateAlertInput, requesterId: string): Promise<Alert> {
    const alerts = await this.getAlerts();
    const requester = Object.values(DEMO_PROFILES).find(p => p.id === requesterId) || DEMO_PROFILES['emma'];
    
    const newAlert: Alert = {
      id: 'alert_' + Date.now(),
      requester_id: requesterId,
      requester,
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

    this.alerts = [newAlert, ...alerts];
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_alerts', JSON.stringify(this.alerts));
    }
    return newAlert;
  }

  async acceptAlert(alertId: string, helperId: string): Promise<{ success: boolean; message?: string }> {
    const alerts = await this.getAlerts();
    const target = alerts.find(a => a.id === alertId);

    if (!target || target.status !== 'searching') {
      return { success: false, message: 'Cette alerte n\'est plus disponible.' };
    }

    const helper = Object.values(DEMO_PROFILES).find(p => p.id === helperId) || DEMO_PROFILES['lucas'];

    this.alerts = alerts.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'accepted',
          helper_id: helperId,
          helper,
          accepted_at: new Date().toISOString(),
        };
      }
      return a;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_alerts', JSON.stringify(this.alerts));
    }

    return { success: true, message: 'Intervention acceptée !' };
  }

  async updateAlertStatus(alertId: string, status: AlertStatus): Promise<void> {
    const alerts = await this.getAlerts();
    this.alerts = alerts.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status,
          ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
        };
      }
      return a;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_alerts', JSON.stringify(this.alerts));
    }
  }

  async completeIntervention(alertId: string, outcome: OutcomeType, outcomeNote?: string): Promise<void> {
    const alerts = await this.getAlerts();
    this.alerts = alerts.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'completed',
          outcome,
          outcome_note: outcomeNote || null,
          completed_at: new Date().toISOString(),
        };
      }
      return a;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_alerts', JSON.stringify(this.alerts));
    }
  }

  async cancelAlert(alertId: string): Promise<void> {
    const alerts = await this.getAlerts();
    this.alerts = alerts.map(a => {
      if (a.id === alertId) {
        return { ...a, status: 'cancelled' };
      }
      return a;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_alerts', JSON.stringify(this.alerts));
    }
  }
}
