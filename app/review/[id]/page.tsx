import React from 'react';
import { RatingReviewClient } from './RatingReviewClient';

export function generateStaticParams() {
  return [
    { id: 'a1111111-1111-1111-1111-111111111111' },
    { id: 'a2222222-2222-2222-2222-222222222222' }
  ];
}

export default function Page({ params }: { params: { id: string } }) {
  return <RatingReviewClient alertId={params.id} />;
}
