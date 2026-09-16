import { supabase, isSupabaseConfigured } from './client';
import { UserProfile } from '@/types';

export interface SignUpInput {
  first_name: string;
  last_name: string;
  password: string;
  city?: string;
  is_helper?: boolean;
  avatar_url?: string | null;
  email?: string;
}

function generateInternalEmail(firstName: string, lastName: string): string {
  const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanFirst}.${cleanLast || 'user'}@sanspattes.app`;
}

export async function registerRealUser(input: SignUpInput): Promise<UserProfile> {
  const city = input.city || 'Lausanne';
  const isHelper = input.is_helper || false;
  const userEmail = input.email || generateInternalEmail(input.first_name, input.last_name);

  if (isSupabaseConfigured()) {
    // 1. Supabase Auth Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userEmail,
      password: input.password,
      options: {
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
        },
      },
    });

    if (authError) {
      // If user already exists, attempt login instead
      if (authError.message.includes('already registered')) {
        return loginRealUser(input.first_name, input.last_name, input.password);
      }
      throw new Error(`Erreur d'inscription : ${authError.message}`);
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error('Impossible de créer le compte utilisateur.');
    }

    // 2. Create Profile in public.profiles table
    const newProfile: UserProfile = {
      id: userId,
      email: userEmail,
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
        email: userEmail,
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
      email: userEmail,
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
      const accountKey = `${input.first_name.toLowerCase()}_${input.last_name.toLowerCase()}`;
      storedUsers[accountKey] = { profile: newProfile, password: input.password };
      localStorage.setItem('sp_local_users', JSON.stringify(storedUsers));
    }

    return newProfile;
  }
}

export async function loginRealUser(firstName: string, lastName: string, password: string): Promise<UserProfile> {
  const userEmail = generateInternalEmail(firstName, lastName);

  if (isSupabaseConfigured()) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });

    if (authError || !authData.user) {
      throw new Error(`Erreur de connexion : Identifiants ou mot de passe incorrects.`);
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return {
        id: authData.user.id,
        email: userEmail,
        first_name: firstName,
        last_name: lastName,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firstName)}`,
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
      const accountKey = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
      const userRecord = storedUsers[accountKey];
      if (!userRecord || userRecord.password !== password) {
        throw new Error('Prénom, Nom ou mot de passe incorrect');
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
