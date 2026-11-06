import { BADGE_CATALOG } from "../config/badges.js";
import { BadgeRepository } from "../repositories/badge.repository.js";
import {
  BadgeProgress,
  BadgeStats,
  buildBadgeProgress,
  calculateStreak,
  evaluateEligibleBadges,
} from "../utils/badge-rules.js";

export interface EarnedBadgeDTO {
  id_badge: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  threshold: number;
  earned_at: Date;
}

export interface UserBadgeSummary {
  stats: BadgeStats;
  earned: EarnedBadgeDTO[];
  progress: BadgeProgress[];
  next: BadgeProgress[];
}

export class BadgeService {
  private repository: BadgeRepository;

  constructor(repository: BadgeRepository = new BadgeRepository()) {
    this.repository = repository;
  }

  async getCatalog() {
    await this.repository.ensureCatalog(BADGE_CATALOG);
    return await this.repository.findAll();
  }

  async getUserBadges(userId: number): Promise<UserBadgeSummary> {
    await this.repository.ensureCatalog(BADGE_CATALOG);

    const [rules, stats, owned] = await Promise.all([
      this.repository.findAll(),
      this.repository.getUserStats(userId),
      this.repository.findUserBadges(userId),
    ]);

    const badgeStats: BadgeStats = {
      total_points: stats.total_points,
      missions_completed: stats.missions_completed,
      quiz_answers: stats.quiz_answers,
      streak_days: calculateStreak(stats.activity_dates),
    };

    const earnedCodes = owned.map((row) => row.badge.code);
    const progress = buildBadgeProgress(badgeStats, rules, earnedCodes);

    return {
      stats: badgeStats,
      earned: owned.map((row) => ({
        id_badge: row.badge.id_badge,
        code: row.badge.code,
        name: row.badge.name,
        description: row.badge.description,
        icon: row.badge.icon,
        category: row.badge.category,
        threshold: row.badge.threshold,
        earned_at: row.earned_at,
      })),
      progress,
      next: progress
        .filter((badge) => !badge.earned)
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3),
    };
  }

  async evaluateAndAward(userId: number): Promise<string[]> {
    await this.repository.ensureCatalog(BADGE_CATALOG);

    const [rules, stats, owned] = await Promise.all([
      this.repository.findAll(),
      this.repository.getUserStats(userId),
      this.repository.findUserBadges(userId),
    ]);

    const badgeStats: BadgeStats = {
      total_points: stats.total_points,
      missions_completed: stats.missions_completed,
      quiz_answers: stats.quiz_answers,
      streak_days: calculateStreak(stats.activity_dates),
    };

    const eligibleCodes = new Set(evaluateEligibleBadges(badgeStats, rules));
    const ownedIds = new Set(owned.map((row) => row.id_badge));

    const missing = rules.filter(
      (rule) => eligibleCodes.has(rule.code) && !ownedIds.has(rule.id_badge)
    );

    await this.repository.award(
      userId,
      missing.map((rule) => rule.id_badge)
    );

    return missing.map((rule) => rule.code);
  }
}
