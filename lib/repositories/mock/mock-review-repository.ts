import { Review } from '@/types';
import { IReviewRepository } from '../types';
import { INITIAL_REVIEWS } from '@/lib/mock/initial-data';

export class MockReviewRepository implements IReviewRepository {
  private reviews: Review[] = INITIAL_REVIEWS;

  async getReviews(): Promise<Review[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sp_reviews');
      if (saved) {
        try { this.reviews = JSON.parse(saved); } catch (e) {}
      }
    }
    return this.reviews;
  }

  async submitReview(
    alertId: string, 
    requesterId: string, 
    helperId: string, 
    rating: number, 
    criteria: string[], 
    comment?: string
  ): Promise<Review> {
    const newRev: Review = {
      id: 'rev_' + Date.now(),
      alert_id: alertId,
      requester_id: requesterId,
      helper_id: helperId,
      rating,
      criteria,
      comment,
      created_at: new Date().toISOString(),
    };

    this.reviews = [newRev, ...this.reviews];
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_reviews', JSON.stringify(this.reviews));
    }
    return newRev;
  }
}
