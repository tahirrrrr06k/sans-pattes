import { supabase } from '@/lib/supabase/client';
import { UserProfile, HelperSettings } from '@/types';
import { IProfileRepository } from '../types';

export class SupabaseProfileRepository implements IProfileRepository {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data as UserProfile;
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update profile: ${error?.message}`);
    }

    return updated as UserProfile;
  }

  async getHelperSettings(userId: string): Promise<HelperSettings | null> {
    const { data, error } = await supabase
      .from('helper_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data as HelperSettings;
  }

  async updateHelperSettings(userId: string, settings: Partial<HelperSettings>): Promise<HelperSettings> {
    const { data: updated, error } = await supabase
      .from('helper_settings')
      .upsert({ user_id: userId, ...settings })
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update helper settings: ${error?.message}`);
    }

    return updated as HelperSettings;
  }
}
