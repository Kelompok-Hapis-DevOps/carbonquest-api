import prisma from "../prisma/client.js";
import { BadgeDefinition } from "../config/badges.js";

export interface BadgeRuleRow {
  id_badge: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  threshold: number;
}

export interface UserStatsRow {
  total_points: number;
  missions_completed: number;
  quiz_answers: number;
  activity_dates: Date[];
}

export class BadgeRepository {
  async findAll(): Promise<BadgeRuleRow[]> {
    return await prisma.badges.findMany({ orderBy: { threshold: "asc" } });
  }

  async ensureCatalog(definitions: BadgeDefinition[]): Promise<void> {
    await prisma.$transaction(
      definitions.map((badge) =>
        prisma.badges.upsert({
          where: { code: badge.code },
          create: badge,
          update: {
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            category: badge.category,
            threshold: badge.threshold,
          },
        })
      )
    );
  }

  async findUserBadges(userId: number) {
    return await prisma.user_Badges.findMany({
      where: { id_user: userId },
      include: { badge: true },
      orderBy: { earned_at: "desc" },
    });
  }

  async award(userId: number, badgeIds: number[]): Promise<void> {
    if (badgeIds.length === 0) return;

    await prisma.user_Badges.createMany({
      data: badgeIds.map((id_badge) => ({ id_user: userId, id_badge })),
      skipDuplicates: true,
    });
  }

  async getUserStats(userId: number): Promise<UserStatsRow> {
    const [sessionAgg, missionAgg, quizAnswers, sessions, missions] =
      await Promise.all([
        prisma.sessions.aggregate({
          where: { id_user: userId },
          _sum: { total_points: true },
        }),
        prisma.user_Missions.aggregate({
          where: { id_user: userId },
          _sum: { points: true },
        }),
        prisma.sessions.count({
          where: { id_user: userId, session_type: "quiz" },
        }),
        prisma.sessions.findMany({
          where: { id_user: userId, end_time: { not: null } },
          select: { end_time: true },
        }),
        prisma.user_Missions.findMany({
          where: { id_user: userId, completed_time: { not: null } },
          select: { completed_time: true },
        }),
      ]);

    const activityDates = [
      ...sessions.map((s) => s.end_time),
      ...missions.map((m) => m.completed_time),
    ].filter((d): d is Date => d !== null);

    return {
      total_points:
        (sessionAgg._sum.total_points ?? 0) + (missionAgg._sum.points ?? 0),
      missions_completed: missions.length,
      quiz_answers: quizAnswers,
      activity_dates: activityDates,
    };
  }
}
