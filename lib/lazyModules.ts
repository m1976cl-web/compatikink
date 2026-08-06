import React, { lazy, Suspense, ComponentType } from 'react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

/**
 * Encapsulador HOC de Lazy Loading para Code-Splitting por categoría.
 * Permite dividir el bundle principal cargando dinámicamente pantallas complejas bajo demanda.
 */
export function createLazyCategoryModule<P extends object>(
  importFactory: () => Promise<{ default: ComponentType<P> }>,
  fallbackLabel: string = 'Cargando módulo de categoría...'
): ComponentType<P> {
  const LazyComponent = lazy(importFactory);

  return function LazyCategoryWrapper(props: P) {
    return React.createElement(
      Suspense,
      { fallback: React.createElement(LoadingSkeleton, { label: fallbackLabel, height: 240 }) },
      React.createElement(LazyComponent, props)
    );
  };
}
