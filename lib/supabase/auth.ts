import { supabase, isSupabaseConfigured } from './client';
import { UserProfile } from '@/types';

export interface SignUpInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  city?: string;
  is_helper?: boolean;
  avatar_url?: string | null;
}

export async function registerRealUser(input: SignUpInput): Promise<UserProfile> {
  const city = input.city || 'Lausanne';
  const isHelper = input.is_helper || false;

  if (isSupabaseConfigured()) {
    // 1. Supabase Auth Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
        },
      },
    });

    if (authError) {
      throw new Error(`Erreur d'inscription : ${authError.message}`);
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error('Impossible de créer le compte utilisateur.');
    }

    // 2. Create Profile in public.profiles table
    const newProfile: UserProfile = {
      id: userId,
      email: input.email,
      first_name: input.first_name,
      last_name: input.last_name,
      avatar_url: input.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(input.first_name)}`,
      city: city,
      is_helper: isHelper,
      rating: 5.0,
      total_interventions: 0,
      animals_saved: 0,
      created_at: new Date().toISOString(),
      role_preference: isHelper ? 'helper' : 'requester',
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: input.email,
        first_name: input.first_name,
        last_name: input.last_name,
        avatar_url: newProfile.avatar_url,
        city: city,
        is_helper: isHelper,
      });

    if (profileError) {
      console.warn('Profile upsert warning:', profileError.message);
    }

    // Also initialize helper settings if user is helper
    if (isHelper) {
      await supabase.from('helper_settings').upsert({
        user_id: userId,
        available_now: true,
        max_distance_km: 5,
      });
    }

    return newProfile;
  } else {
    // Offline / Fallback Local Auth
    const userId = 'usr_' + Date.now();
    const newProfile: UserProfile = {
      id: userId,
      email: input.email,
      first_name: input.first_name,
      last_name: input.last_name,
      avatar_url: input.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(input.first_name)}`,
      city: city,
      is_helper: isHelper,
      rating: 5.0,
      total_interventions: 0,
      animals_saved: 0,
      created_at: new Date().toISOString(),
      role_preference: isHelper ? 'helper' : 'requester',
    };

    if (typeof window !== 'undefined') {
      const storedUsers = JSON.parse(localStorage.getItem('sp_local_users') || '{}');
      storedUsers[input.email] = { profile: newProfile, password: input.password };
      localStorage.setItem('sp_local_users', JSON.stringify(storedUsers));
    }

    return newProfile;
  }
}

export async function loginRealUser(email: string, password: string): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new Error(`Erreur de connexion : ${authError?.message || 'Identifiants incorrects'}`);
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      // Fallback profile from auth metadata
      const meta = authData.user.user_metadata || {};
      return {
        id: authData.user.id,
        email: authData.user.email || email,
        first_name: meta.first_name || 'Utilisateur',
        last_name: meta.last_name || '',
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        city: 'Lausanne',
        is_helper: false,
        rating: 5.0,
        total_interventions: 0,
        animals_saved: 0,
        created_at: new Date().toISOString(),
      };
    }

    return profile as UserProfile;
  } else {
    if (typeof window !== 'undefined') {
      const storedUsers = JSON.parse(localStorage.getItem('sp_local_users') || '{}');
      const userRecord = storedUsers[email];
      if (!userRecord || userRecord.password !== password) {
        throw new Error('Email ou mot de passe incorrect');
      }
      return userRecord.profile;
    }
    throw new Error('Connexion impossible');
  }
}

export async function logoutRealUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
}
