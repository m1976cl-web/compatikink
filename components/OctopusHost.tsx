/**
 * OctopusHost — Nox the host.
 * Thin wrapper around NoxHost so existing imports keep working.
 * Prefer `<NoxHost scene="…" />` on new screens.
 */
import { NoxHost } from '@/components/nox/NoxHost';
import type { NoxSceneId } from '@/components/nox/scenes';

export function OctopusHost({ scene = 'home' }: { scene?: NoxSceneId }) {
  return <NoxHost scene={scene} variant="compact" />;
}
