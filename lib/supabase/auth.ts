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

export async function registerRealUser(input: SignUpInput): Promise<UserProfile> {
  // 1. Try Cloudflare persistent API
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user) return data.user;
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData.error) throw new Error(errData.error);
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
  }

  // 2. Fallback to Supabase if configured
  if (isSupabaseConfigured()) {
    const userEmail = input.email || `${input.first_name.toLowerCase()}.${input.last_name.toLowerCase()}@sanspattes.app`;
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
      if (authError.message.includes('already registered')) {
        return loginRealUser(input.first_name, input.last_name, input.password);
      }
      throw new Error(`Erreur d'inscription : ${authError.message}`);
    }

    const userId = authData.user?.id || 'usr_' + Date.now();
    const newProfile: UserProfile = {
      id: userId,
      email: userEmail,
      first_name: input.first_name,
      last_name: input.last_name,
      avatar_url: input.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(input.first_name)}`,
      city: input.city || 'Lausanne',
      is_helper: !!input.is_helper,
      rating: 5.0,
      total_interventions: 0,
      animals_saved: 0,
      created_at: new Date().toISOString(),
      role_preference: input.is_helper ? 'helper' : 'requester',
    };

    return newProfile;
  }

  // 3. Fallback to LocalStorage
  const userId = 'usr_' + Date.now();
  const newProfile: UserProfile = {
    id: userId,
    email: `${input.first_name.toLowerCase()}.${input.last_name.toLowerCase()}@sanspattes.app`,
    first_name: input.first_name,
    last_name: input.last_name,
    avatar_url: input.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(input.first_name)}`,
    city: input.city || 'Lausanne',
    is_helper: !!input.is_helper,
    rating: 5.0,
    total_interventions: 0,
    animals_saved: 0,
    created_at: new Date().toISOString(),
    role_preference: input.is_helper ? 'helper' : 'requester',
  };

  if (typeof window !== 'undefined') {
    const storedUsers = JSON.parse(localStorage.getItem('sp_local_users') || '{}');
    const key = `${input.first_name.toLowerCase()}_${input.last_name.toLowerCase()}`;
    storedUsers[key] = { profile: newProfile, password: input.password };
    localStorage.setItem('sp_local_users', JSON.stringify(storedUsers));
  }

  return newProfile;
}

export async function loginRealUser(firstName: string, lastName: string, password: string): Promise<UserProfile> {
  // 1. Try Cloudflare persistent API
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user) return data.user;
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData.error) throw new Error(errData.error);
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
  }

  // 2. Fallback to Supabase
  if (isSupabaseConfigured()) {
    const userEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@sanspattes.app`;
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });

    if (authError || !authData.user) {
      throw new Error(`Erreur de connexion : Identifiants ou mot de passe incorrects.`);
    }

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

  // 3. Fallback to LocalStorage
  if (typeof window !== 'undefined') {
    const storedUsers = JSON.parse(localStorage.getItem('sp_local_users') || '{}');
    const key = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    const record = storedUsers[key];
    if (!record || record.password !== password) {
      throw new Error('Prénom, Nom ou mot de passe incorrect');
    }
    return record.profile;
  }

  throw new Error('Connexion impossible');
}

export async function logoutRealUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
}
