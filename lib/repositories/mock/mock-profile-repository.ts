import { UserProfile, HelperSettings } from '@/types';
import { IProfileRepository } from '../types';
import { DEMO_PROFILES, DEFAULT_HELPER_SETTINGS } from '@/lib/mock/initial-data';

export class MockProfileRepository implements IProfileRepository {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const profile = Object.values(DEMO_PROFILES).find(p => p.id === userId);
    return profile || null;
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const profileKey = Object.keys(DEMO_PROFILES).find(k => DEMO_PROFILES[k].id === userId) || userId;
    DEMO_PROFILES[profileKey] = { ...DEMO_PROFILES[profileKey], ...data };
    return DEMO_PROFILES[profileKey];
  }

  async getHelperSettings(userId: string): Promise<HelperSettings | null> {
    return DEFAULT_HELPER_SETTINGS[userId] || null;
  }

  async updateHelperSettings(userId: string, settings: Partial<HelperSettings>): Promise<HelperSettings> {
    if (!DEFAULT_HELPER_SETTINGS[userId]) {
      DEFAULT_HELPER_SETTINGS[userId] = {
        user_id: userId,
        available_now: true,
        max_distance_km: 5,
        accept_spiders: true,
        accept_insects: true,
        accept_wasps: true,
        accept_other: true,
        humane_commitment_accepted: true,
        weekly_schedule: {
          monday: { enabled: true, start: '18:00', end: '23:00' },
          tuesday: { enabled: false, start: '18:00', end: '23:00' },
          wednesday: { enabled: true, start: '17:00', end: '22:30' },
          thursday: { enabled: true, start: '18:00', end: '23:00' },
          friday: { enabled: true, start: '18:00', end: '00:00' },
          saturday: { enabled: true, start: '08:00', end: '23:59' },
          sunday: { enabled: true, start: '08:00', end: '23:59' },
        }
      };
    }
    DEFAULT_HELPER_SETTINGS[userId] = { ...DEFAULT_HELPER_SETTINGS[userId], ...settings };
    return DEFAULT_HELPER_SETTINGS[userId];
  }
}
