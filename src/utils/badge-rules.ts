const JAKARTA_TIMEZONE = "Asia/Jakarta";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface BadgeStats {
  total_points: number;
  missions_completed: number;
  quiz_answers: number;
  streak_days: number;
}

export interface BadgeRuleLike {
  code: string;
  category: string;
  threshold: number;
  name?: string;
  description?: string | null;
  icon?: string | null;
}

export interface BadgeProgress {
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  threshold: number;
  current: number;
  percentage: number;
  earned: boolean;
}

export function getStatValue(stats: BadgeStats, category: string): number {
  switch (category) {
    case "points":
      return stats.total_points;
    case "mission":
      return stats.missions_completed;
    case "quiz":
      return stats.quiz_answers;
    case "streak":
      return stats.streak_days;
    default:
      return 0;
  }
}

export function evaluateEligibleBadges(
  stats: BadgeStats,
  rules: BadgeRuleLike[]
): string[] {
  return rules
    .filter((rule) => rule.threshold > 0)
    .filter((rule) => getStatValue(stats, rule.category) >= rule.threshold)
    .map((rule) => rule.code);
}

export function buildBadgeProgress(
  stats: BadgeStats,
  rules: BadgeRuleLike[],
  earnedCodes: string[] = []
): BadgeProgress[] {
  const earned = new Set(earnedCodes);

  return rules.map((rule) => {
    const current = getStatValue(stats, rule.category);
    return {
      code: rule.code,
      name: rule.name ?? rule.code,
      description: rule.description ?? null,
      icon: rule.icon ?? null,
      category: rule.category,
      threshold: rule.threshold,
      current,
      percentage:
        rule.threshold > 0
          ? Math.min(100, Math.round((current / rule.threshold) * 100))
          : 0,
      earned: earned.has(rule.code),
    };
  });
}

export function calculateStreak(
  activityDates: Array<Date | string | null | undefined>,
  now: Date = new Date()
): number {
  const days = new Set(
    activityDates
      .filter((d): d is Date | string => Boolean(d))
      .map((d) => toJakartaDayKey(new Date(d)))
  );

  if (days.size === 0) return 0;

  let cursor = new Date(now);
  if (!days.has(toJakartaDayKey(cursor))) {
    cursor = new Date(cursor.getTime() - DAY_IN_MS);
    if (!days.has(toJakartaDayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(toJakartaDayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_IN_MS);
  }

  return streak;
}

export function toJakartaDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
