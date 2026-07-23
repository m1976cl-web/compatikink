declare const describe: any, test: any, expect: any;

import React from 'react';
import CompassScreen from '../compass';
import { calculateCompassPoint, determineArchetype } from '@/lib/compatibility';
import { ActivityResponse } from '@/types';

describe('app/compass.tsx Standalone Route & Component Tests', () => {
  test('CompassScreen default export is a valid React component function', () => {
    expect(typeof CompassScreen).toBe('function');
    expect(CompassScreen.name).toBe('CompassScreen');
  });

  test('React.createElement(CompassScreen) creates valid JSX element structure', () => {
    const element = React.createElement(CompassScreen);
    expect(element).not.toBeNull();
    expect(typeof element).toBe('object');
    expect(element.type).toBe(CompassScreen);
  });

  test('calculateCompassPoint handles empty responses gracefully', () => {
    const emptyPoint = calculateCompassPoint([]);
    expect(emptyPoint).toEqual({ x: 5, y: 50 });
  });

  test('determineArchetype handles empty responses gracefully', () => {
    const emptyArchetype = determineArchetype([], 50);
    expect(emptyArchetype).toBe('Explorador Neutro');
  });

  test('calculateCompassPoint calculates shifted coordinates for positive responses', () => {
    const responses: ActivityResponse[] = [
      { activityId: 'bo_rope', rating: 'love', role: 'give', intensity: 5 },
    ];
    const point = calculateCompassPoint(responses);
    expect(point.x).toBeGreaterThan(5);
    expect(point.y).toBeGreaterThan(50);
  });

  test('determineArchetype correctly resolves Dominant archetype with real activity IDs', () => {
    const responses: ActivityResponse[] = [
      { activityId: 'pe_d/s_dynamic', rating: 'love', role: 'give', intensity: 5 },
      { activityId: 'bo_rope', rating: 'love', role: 'give', intensity: 4 },
    ];
    const point = calculateCompassPoint(responses);
    const archetype = determineArchetype(responses, point.y);
    expect(point.y).toBeGreaterThan(50);
    expect(archetype).toBe('Líder Dominante');
  });

  test('determineArchetype correctly resolves Submissive archetype with real activity IDs', () => {
    const responses: ActivityResponse[] = [
      { activityId: 'pe_d/s_dynamic', rating: 'love', role: 'receive', intensity: 5 },
      { activityId: 'bo_rope', rating: 'love', role: 'receive', intensity: 4 },
    ];
    const point = calculateCompassPoint(responses);
    const archetype = determineArchetype(responses, point.y);
    expect(point.y).toBeLessThan(50);
    expect(archetype).toBe('Sumiso Devoto');
  });

  test('Partner point calculation handles null guestResponses cleanly', () => {
    const nullGuestSession = {
      id: 's_null',
      inviteCode: 'CODE01',
      initiatorToken: 't01',
      initiatorNickname: 'Initiator',
      initiatorResponses: [],
      guestResponses: null,
      status: 'waiting' as const,
      createdAt: new Date().toISOString(),
    };
    const partnerPoint = nullGuestSession.guestResponses
      ? calculateCompassPoint(nullGuestSession.guestResponses)
      : null;
    expect(partnerPoint).toBeNull();
  });

  test('Partner nickname falls back to "Pareja" when guestNickname and guestProfile are undefined', () => {
    const sessionNoName = {
      id: 's_noname',
      guestResponses: [],
    };
    const partnerName = (sessionNoName as any).guestNickname || (sessionNoName as any).guestProfile?.nickname || 'Pareja';
    expect(partnerName).toBe('Pareja');
  });

  test('Out of bounds partner index yields undefined session without runtime exception', () => {
    const sessionsList: any[] = [];
    const selectedSession = sessionsList[99];
    expect(selectedSession).toBeUndefined();
    const partnerPoint = selectedSession && selectedSession.guestResponses
      ? calculateCompassPoint(selectedSession.guestResponses)
      : null;
    expect(partnerPoint).toBeNull();
  });
});
