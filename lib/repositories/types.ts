import { 
  UserProfile, 
  HelperSettings, 
  Alert, 
  Message, 
  Review, 
  AlertStatus, 
  OutcomeType,
  CategoryType,
  RoomType,
  UrgencyLevel
} from '@/types';

export interface CreateAlertInput {
  category: CategoryType;
  description: string;
  room: RoomType;
  photo_url?: string | null;
  urgency: UrgencyLevel;
  reward_amount: number;
  exact_address: string;
  approximate_location: string;
  latitude: number;
  longitude: number;
}

export interface IAlertRepository {
  getAlerts(): Promise<Alert[]>;
  getAlertById(id: string): Promise<Alert | null>;
  createAlert(input: CreateAlertInput, requesterId: string): Promise<Alert>;
  acceptAlert(alertId: string, helperId: string): Promise<{ success: boolean; message?: string }>;
  updateAlertStatus(alertId: string, status: AlertStatus): Promise<void>;
  completeIntervention(alertId: string, outcome: OutcomeType, outcomeNote?: string): Promise<void>;
  cancelAlert(alertId: string): Promise<void>;
}

export interface IMessageRepository {
  getMessagesForAlert(alertId: string): Promise<Message[]>;
  sendMessage(alertId: string, senderId: string, recipientId: string, content: string): Promise<Message>;
}

export interface IReviewRepository {
  getReviews(): Promise<Review[]>;
  submitReview(alertId: string, requesterId: string, helperId: string, rating: number, criteria: string[], comment?: string): Promise<Review>;
}

export interface IProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  getHelperSettings(userId: string): Promise<HelperSettings | null>;
  updateHelperSettings(userId: string, settings: Partial<HelperSettings>): Promise<HelperSettings>;
}
