import { UserProfile, HelperSettings, Alert, Message, Review } from '@/types';

export const DEMO_PROFILES: Record<string, UserProfile> = {
  'emma': {
    id: '11111111-1111-4111-a111-111111111111',
    email: 'emma@lausanne.ch',
    first_name: 'Emma',
    last_name: 'D.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    city: 'Lausanne',
    date_of_birth: '1998-05-14',
    is_helper: false,
    rating: 5.0,
    total_interventions: 2,
    animals_saved: 2,
    created_at: '2026-01-10T10:00:00Z',
    role_preference: 'requester'
  },
  'lucas': {
    id: '22222222-2222-4222-a222-222222222222',
    email: 'lucas@lausanne.ch',
    first_name: 'Lucas',
    last_name: 'M.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    city: 'Lausanne',
    date_of_birth: '1995-11-20',
    is_helper: true,
    rating: 4.9,
    total_interventions: 32,
    animals_saved: 35,
    created_at: '2025-08-15T14:30:00Z',
    role_preference: 'helper'
  },
  'sofia': {
    id: '33333333-3333-4333-a333-333333333333',
    email: 'sofia@pully.ch',
    first_name: 'Sofia',
    last_name: 'B.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    city: 'Pully',
    date_of_birth: '1999-03-08',
    is_helper: true,
    rating: 5.0,
    total_interventions: 18,
    animals_saved: 20,
    created_at: '2025-09-01T09:00:00Z',
    role_preference: 'both'
  },
  'nicolas': {
    id: '44444444-4444-4444-a444-444444444444',
    email: 'nicolas@renens.ch',
    first_name: 'Nicolas',
    last_name: 'V.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    city: 'Renens',
    date_of_birth: '1992-07-25',
    is_helper: true,
    rating: 4.7,
    total_interventions: 51,
    animals_saved: 58,
    created_at: '2025-06-12T11:20:00Z',
    role_preference: 'helper'
  }
};

export const DEFAULT_HELPER_SETTINGS: Record<string, HelperSettings> = {
  '22222222-2222-4222-a222-222222222222': {
    user_id: '22222222-2222-4222-a222-222222222222',
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
  }
};

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    requester_id: DEMO_PROFILES['emma'].id,
    requester: DEMO_PROFILES['emma'],
    category: 'Araignée',
    description: 'Elle est au plafond au-dessus de mon lit dans la chambre. Assez grosse et noire, je n\'ose plus rentrer dans la pièce !',
    room: 'Chambre',
    photo_url: 'https://images.unsplash.com/photo-1577741314755-048d8525d31e?w=600',
    urgency: 'medium',
    reward_amount: 10,
    currency: 'CHF',
    status: 'searching',
    approximate_location: 'Lausanne Centre – ~1.2 km',
    exact_address: 'Rue de Bourg 14, 1003 Lausanne',
    latitude: 46.5197,
    longitude: 6.6323,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    requester_id: DEMO_PROFILES['emma'].id,
    requester: DEMO_PROFILES['emma'],
    category: 'Insecte',
    description: 'Un gros scarabée est coincé derrière les rideaux de la cuisine.',
    room: 'Cuisine',
    photo_url: null,
    urgency: 'low',
    reward_amount: 0,
    currency: 'CHF',
    status: 'searching',
    approximate_location: 'Pully – ~2.5 km',
    exact_address: 'Avenue de la Gare 8, 1009 Pully',
    latitude: 46.5090,
    longitude: 6.6620,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_MESSAGES: Message[] = [];
export const INITIAL_REVIEWS: Review[] = [];
