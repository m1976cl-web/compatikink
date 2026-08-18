import { Activity, ActivityResponse, Rating, RolePreference } from '@/types';

export function generateDemoResponses(activities: Activity[]): ActivityResponse[] {
  return activities.map((activity) => {
    // Weighted randomness for rating: 40% like, 25% curious, 15% love, 10% not_interested, 10% hard_limit
    const r = Math.random();
    let rating: Rating = 'like';
    if (r < 0.1) {
      rating = 'hard_limit';
    } else if (r < 0.2) {
      rating = 'not_interested';
    } else if (r < 0.35) {
      rating = 'love';
    } else if (r < 0.6) {
      rating = 'curious';
    } else {
      rating = 'like';
    }

    const isPositive = rating === 'like' || rating === 'love' || rating === 'curious';

    let role: RolePreference = 'flexible';
    let intensity: 1 | 2 | 3 | 4 | 5 = 3;

    if (isPositive) {
      const roleRand = Math.random();
      if (roleRand < 0.25) role = 'give';
      else if (roleRand < 0.5) role = 'receive';
      else if (roleRand < 0.75) role = 'both';
      else role = 'flexible';

      intensity = (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5;
    }

    return {
      activityId: activity.id,
      rating,
      role,
      intensity,
    };
  });
}
