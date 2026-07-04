import { useState, useCallback } from 'react';
import { ActivityResponse, Rating, RolePreference } from '@/types';
import { ACTIVITIES } from '@/data/activities';

const defaultResponse = (activityId: string): ActivityResponse => ({
  activityId,
  rating: 'not_interested',
  role: 'flexible',
  intensity: 2,
});

export function useQuestionnaire(initial?: ActivityResponse[]) {
  const [responses, setResponses] = useState<Record<string, ActivityResponse>>(() => {
    const map: Record<string, ActivityResponse> = {};
    for (const activity of ACTIVITIES) {
      const existing = initial?.find((r) => r.activityId === activity.id);
      map[activity.id] = existing ?? defaultResponse(activity.id);
    }
    return map;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentActivity = ACTIVITIES[currentIndex];
  const currentResponse = responses[currentActivity.id];

  const updateCurrent = useCallback(
    (patch: Partial<ActivityResponse>) => {
      setResponses((prev) => ({
        ...prev,
        [currentActivity.id]: { ...prev[currentActivity.id], ...patch },
      }));
    },
    [currentActivity.id]
  );

  const setRating = (rating: Rating) => updateCurrent({ rating });
  const setRole = (role: RolePreference) => updateCurrent({ role });
  const setIntensity = (intensity: 1 | 2 | 3 | 4 | 5) => updateCurrent({ intensity });

  const goNext = () => {
    if (currentIndex < ACTIVITIES.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const goTo = (index: number) => {
    if (index >= 0 && index < ACTIVITIES.length) {
      setCurrentIndex(index);
    }
  };

  const getAllResponses = (): ActivityResponse[] => Object.values(responses);

  const progress = (currentIndex + 1) / ACTIVITIES.length;

  return {
    currentActivity,
    currentResponse,
    currentIndex,
    total: ACTIVITIES.length,
    progress,
    setRating,
    setRole,
    setIntensity,
    goNext,
    goPrev,
    goTo,
    getAllResponses,
    isLast: currentIndex === ACTIVITIES.length - 1,
    isFirst: currentIndex === 0,
  };
}
