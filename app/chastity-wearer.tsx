import React from 'react';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { ChastityQuizFlow } from '@/components/chastity/ChastityQuizFlow';

export default function ChastityWearerScreen() {
  return (
    <RouteFeatureGuard route="/chastity-wearer" title="Castidad · Portador">
      <ChastityQuizFlow flow="wearer" />
    </RouteFeatureGuard>
  );
}
