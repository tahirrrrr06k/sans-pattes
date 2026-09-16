import { isSupabaseConfigured } from '@/lib/supabase/client';
import { IAlertRepository, IMessageRepository, IReviewRepository, IProfileRepository } from './types';

import { SupabaseAlertRepository } from './supabase/supabase-alert-repository';
import { SupabaseMessageRepository } from './supabase/supabase-message-repository';
import { SupabaseReviewRepository } from './supabase/supabase-review-repository';
import { SupabaseProfileRepository } from './supabase/supabase-profile-repository';

import { MockAlertRepository } from './mock/mock-alert-repository';
import { MockMessageRepository } from './mock/mock-message-repository';
import { MockReviewRepository } from './mock/mock-review-repository';
import { MockProfileRepository } from './mock/mock-profile-repository';

export const isProductionBackend = isSupabaseConfigured();

export const alertRepository: IAlertRepository = isProductionBackend 
  ? new SupabaseAlertRepository() 
  : new MockAlertRepository();

export const messageRepository: IMessageRepository = isProductionBackend 
  ? new SupabaseMessageRepository() 
  : new MockMessageRepository();

export const reviewRepository: IReviewRepository = isProductionBackend 
  ? new SupabaseReviewRepository() 
  : new MockReviewRepository();

export const profileRepository: IProfileRepository = isProductionBackend 
  ? new SupabaseProfileRepository() 
  : new MockProfileRepository();
