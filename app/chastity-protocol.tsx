import React from 'react';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { ChastityQuizFlow } from '@/components/chastity/ChastityQuizFlow';

export default function ChastityProtocolScreen() {
  return (
    <RouteFeatureGuard route="/chastity-protocol" title="Castidad · Protocolo">
      <ChastityQuizFlow flow="protocol" />
    </RouteFeatureGuard>
  );
}
