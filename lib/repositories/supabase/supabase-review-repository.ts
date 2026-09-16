import { supabase } from '@/lib/supabase/client';
import { Review } from '@/types';
import { IReviewRepository } from '../types';

export class SupabaseReviewRepository implements IReviewRepository {
  async getReviews(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as Review[];
  }

  async submitReview(
    alertId: string, 
    requesterId: string, 
    helperId: string, 
    rating: number, 
    criteria: string[], 
    comment?: string
  ): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        alert_id: alertId,
        requester_id: requesterId,
        helper_id: helperId,
        rating,
        criteria,
        comment: comment || null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to submit review: ${error?.message}`);
    }

    return data as Review;
  }
}
