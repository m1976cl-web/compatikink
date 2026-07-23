import { useState, useCallback, useMemo, useEffect } from 'react';
import { ActivityResponse, Rating, RolePreference, ActivityCategory, Activity } from '@/types';
import { ACTIVITIES, getAllActivities } from '@/data/activities';

const defaultResponse = (activityId: string): ActivityResponse => ({
  activityId,
  rating: 'not_interested',
  role: 'flexible',
  intensity: 2,
});

export function useQuestionnaire(
  initial?: ActivityResponse[],
  enabledCategories?: ActivityCategory[],
  customs?: Activity[]
) {
  const allActs = useMemo(() => getAllActivities(customs), [customs]);

  const filteredActivities = useMemo(() => {
    if (!enabledCategories || enabledCategories.length === 0) return allActs;
    return allActs.filter((a) => enabledCategories.includes(a.category));
  }, [enabledCategories, allActs]);

  const [responses, setResponses] = useState<Record<string, ActivityResponse>>(() => {
    const map: Record<string, ActivityResponse> = {};
    for (const activity of allActs) {
      const existing = initial?.find((r) => r.activityId === activity.id);
      // If category is disabled, force it to not_interested
      if (enabledCategories && enabledCategories.length > 0 && !enabledCategories.includes(activity.category)) {
        map[activity.id] = {
          activityId: activity.id,
          rating: 'not_interested',
          role: 'flexible',
          intensity: 2,
        };
      } else {
        map[activity.id] = existing ?? defaultResponse(activity.id);
      }
    }
    return map;
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, Math.max(0, filteredActivities.length - 1)));
  }, [enabledCategories, filteredActivities.length]);
  const currentActivity = filteredActivities[currentIndex] || allActs[0];
  const currentResponse = responses[currentActivity.id];

  const updateCurrent = useCallback(
    (patch: Partial<ActivityResponse>) => {
      if (!currentActivity) return;
      setResponses((prev) => ({
        ...prev,
        [currentActivity.id]: { ...prev[currentActivity.id], ...patch },
      }));
    },
    [currentActivity]
  );

  const setResponseForActivity = useCallback(
    (activityId: string, patch: Partial<ActivityResponse>) => {
      setResponses((prev) => ({
        ...prev,
        [activityId]: {
          ...(prev[activityId] || defaultResponse(activityId)),
          ...patch,
        },
      }));
    },
    []
  );

  const setRating = (rating: Rating) => updateCurrent({ rating });
  const setRole = (role: RolePreference) => updateCurrent({ role });
  const setIntensity = (intensity: 1 | 2 | 3 | 4 | 5) => updateCurrent({ intensity });

  const goNext = () => {
    if (currentIndex < filteredActivities.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const goTo = (index: number) => {
    if (index >= 0 && index < filteredActivities.length) {
      setCurrentIndex(index);
    }
  };

  const getAllResponses = (): ActivityResponse[] => Object.values(responses);

  const progress = filteredActivities.length > 0 ? (currentIndex + 1) / filteredActivities.length : 1;

  return {
    activities: filteredActivities,
    responses,
    finalResponses: Object.values(responses),
    currentActivity,
    currentResponse,
    currentIndex,
    total: filteredActivities.length,
    progress,
    setRating,
    setRole,
    setIntensity,
    setResponseForActivity,
    goNext,
    goPrev,
    goTo,
    getAllResponses,
    isLast: currentIndex === filteredActivities.length - 1 || filteredActivities.length === 0,
    isFirst: currentIndex === 0,
  };
}
