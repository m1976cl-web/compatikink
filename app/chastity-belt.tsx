import React from 'react';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { ChastitySizeFlow } from '@/components/chastity/ChastitySizeFlow';

export default function ChastityBeltScreen() {
  return (
    <RouteFeatureGuard route="/chastity-belt" title="Castidad · Cinturón">
      <ChastitySizeFlow mode="belt" />
    </RouteFeatureGuard>
  );
}
