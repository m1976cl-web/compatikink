import { useState, useCallback, useMemo, useEffect } from 'react';
import { ActivityResponse, Rating, RolePreference, ActivityCategory, Activity, DifficultyLevel } from '@/types';
import { getAllActivities } from '@/data/activities';

const defaultResponse = (activityId: string): ActivityResponse => ({
  activityId,
  rating: 'not_interested',
  role: 'flexible',
  intensity: 2,
});

export function useQuestionnaire(
  initial?: ActivityResponse[],
  enabledCategories?: ActivityCategory[],
  customs?: Activity[],
  difficultyFilter?: DifficultyLevel | 'all',
  searchQuery?: string,
  /** When set, only these activity IDs are asked (express / curated sets). */
  activityIdFilter?: string[] | null
) {
  const allActs = useMemo(() => getAllActivities(customs), [customs]);

  const filteredActivities = useMemo(() => {
    let result = allActs;
    if (activityIdFilter && activityIdFilter.length > 0) {
      const allow = new Set(activityIdFilter);
      result = result.filter((a) => allow.has(a.id));
    } else if (enabledCategories && enabledCategories.length > 0) {
      result = result.filter((a) => enabledCategories.includes(a.category));
    }
    if (difficultyFilter && difficultyFilter !== 'all') {
      result = result.filter((a) => !a.difficultyLevel || a.difficultyLevel === difficultyFilter);
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [enabledCategories, allActs, difficultyFilter, searchQuery, activityIdFilter]);

  const [responses, setResponses] = useState<Record<string, ActivityResponse>>(() => {
    const map: Record<string, ActivityResponse> = {};
    for (const activity of allActs) {
      const existing = initial?.find((r) => r.activityId === activity.id);
      if (
        !activityIdFilter?.length &&
        enabledCategories &&
        enabledCategories.length > 0 &&
        !enabledCategories.includes(activity.category)
      ) {
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
  }, [enabledCategories, filteredActivities.length, activityIdFilter]);

  // Hydrate from initial when draft loads after mount
  useEffect(() => {
    if (!initial?.length) return;
    setResponses((prev) => {
      const next = { ...prev };
      for (const r of initial) {
        next[r.activityId] = r;
      }
      return next;
    });
  }, [initial]);

  const currentActivity = filteredActivities[currentIndex] || allActs[0];
  const currentResponse = responses[currentActivity?.id];

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
    setCurrentIndex,
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
