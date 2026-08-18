import React from 'react';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { ChastitySizeFlow } from '@/components/chastity/ChastitySizeFlow';

export default function ChastityCageScreen() {
  return (
    <RouteFeatureGuard route="/chastity-cage" title="Castidad · Jaula">
      <ChastitySizeFlow mode="cage" />
    </RouteFeatureGuard>
  );
}
