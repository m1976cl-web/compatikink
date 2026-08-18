import React from 'react';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { ChastitySizeFlow } from '@/components/chastity/ChastitySizeFlow';

export default function ChastityFitScreen() {
  return (
    <RouteFeatureGuard route="/chastity-fit" title="Castidad · Estilo y talla">
      <ChastitySizeFlow mode="style" />
    </RouteFeatureGuard>
  );
}
