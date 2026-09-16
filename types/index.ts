export type UserRole = 'requester' | 'helper' | 'both';

export type CategoryType = 
  | 'Araignée' 
  | 'Insecte' 
  | 'Guêpe / abeille' 
  | 'Papillon / mite' 
  | 'Coléoptère' 
  | 'Autre petite bête' 
  | 'Je ne sais pas';

export type RoomType = 
  | 'Chambre' 
  | 'Salle de bain' 
  | 'Cuisine' 
  | 'Salon' 
  | 'Balcon' 
  | 'Cave' 
  | 'Garage' 
  | 'Autre';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export type AlertStatus = 
  | 'draft' 
  | 'searching' 
  | 'accepted' 
  | 'helper_on_way' 
  | 'helper_arrived' 
  | 'completed' 
  | 'cancelled' 
  | 'expired';

export type OutcomeType = 
  | 'released_outside' 
  | 'already_gone' 
  | 'not_found' 
  | 'pro_needed' 
  | 'other';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  city: string;
  date_of_birth?: string;
  is_helper: boolean;
  rating: number;
  total_interventions: number;
  animals_saved: number;
  created_at: string;
  role_preference?: UserRole;
}

export interface WeeklyScheduleDay {
  enabled: boolean;
  start: string;
  end: string;
}

export interface WeeklySchedule {
  monday: WeeklyScheduleDay;
  tuesday: WeeklyScheduleDay;
  wednesday: WeeklyScheduleDay;
  thursday: WeeklyScheduleDay;
  friday: WeeklyScheduleDay;
  saturday: WeeklyScheduleDay;
  sunday: WeeklyScheduleDay;
}

export interface HelperSettings {
  user_id: string;
  available_now: boolean;
  max_distance_km: number;
  accept_spiders: boolean;
  accept_insects: boolean;
  accept_wasps: boolean;
  accept_other: boolean;
  humane_commitment_accepted: boolean;
  weekly_schedule: WeeklySchedule;
}

export interface Alert {
  id: string;
  requester_id: string;
  helper_id?: string | null;
  category: CategoryType;
  description: string;
  room: RoomType;
  photo_url?: string | null;
  urgency: UrgencyLevel;
  reward_amount: number;
  currency: string;
  status: AlertStatus;
  approximate_location: string;
  exact_address: string;
  latitude: number;
  longitude: number;
  outcome?: OutcomeType | null;
  outcome_note?: string | null;
  created_at: string;
  accepted_at?: string | null;
  completed_at?: string | null;
  // Dynamic joined fields
  requester?: UserProfile;
  helper?: UserProfile;
}

export interface Message {
  id: string;
  alert_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

export interface Review {
  id: string;
  alert_id: string;
  requester_id: string;
  helper_id: string;
  rating: number;
  criteria: string[];
  comment?: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  alert_id?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface GlobalChatMessage {
  id: string;
  anonymous_user_id: string;
  nickname: string;
  avatar_color?: string;
  content: string;
  reply_to_id?: string | null;
  reply_to?: GlobalChatMessage | null;
  is_deleted: boolean;
  created_at: string;
}

export interface GlobalChatReport {
  id: string;
  message_id: string;
  reporter_nickname: string;
  reason: string;
  created_at: string;
}

