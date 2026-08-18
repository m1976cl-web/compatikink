import React from 'react';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { ChastityQuizFlow } from '@/components/chastity/ChastityQuizFlow';

export default function ChastityKeyholderScreen() {
  return (
    <RouteFeatureGuard route="/chastity-keyholder" title="Castidad · Keyholder">
      <ChastityQuizFlow flow="keyholder" />
    </RouteFeatureGuard>
  );
}
