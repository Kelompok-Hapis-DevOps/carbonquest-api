import prisma from "../prisma/client.js";
import { CreateSessionDTO } from "../types/index.js";

export class SessionRepository {
  async create(data: CreateSessionDTO & { id_user: number }) {
    return await prisma.sessions.create({
      data: {
        id_user: data.id_user,
        id_answer: data.id_answer,
        id_quiz: data.id_quiz,
        session_type: data.session_type,
        total_points: data.total_points ?? 0,
        start_time: data.start_time ? new Date(data.start_time) : new Date(),
        end_time: data.end_time ? new Date(data.end_time) : null,
      },
    });
  }

  async update(id: number, data: { total_points?: number; end_time?: Date }) {
    return await prisma.sessions.update({
      where: { id_session: id },
      data,
    });
  }

  async findByUserId(userId: number) {
    return await prisma.sessions.findMany({
      where: { id_user: userId },
      include: {
        answer: { include: { question: true } },
        quiz: true,
      },
      orderBy: { start_time: "desc" },
    });
  }

  async hasAnsweredQuizQuestionInRange(
    userId: number,
    questionId: number,
    start: Date,
    end: Date
  ): Promise<boolean> {
    const existing = await prisma.sessions.findFirst({
      where: {
        id_user: userId,
        session_type: "quiz",
        start_time: { gte: start, lt: end },
        answer: {
          id_question: questionId,
        },
      },
      select: { id_session: true },
    });

    return Boolean(existing);
  }

  async getWeeklyPoints(userId: number, weeks: number = 4) {
    const { startDate, endDate } = this.getDateRange(weeks);

    const [quizSessions, missionCompletions] = await Promise.all([
      this.findQuizSessions(userId, startDate, endDate),
      this.findMissionCompletions(userId, startDate, endDate),
    ]);

    return { quizSessions, missionCompletions };
  }

  private getDateRange(weeks: number): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);
    return { startDate, endDate };
  }

  private async findQuizSessions(userId: number, startDate: Date, endDate: Date) {
    return await prisma.sessions.findMany({
      where: {
        id_user: userId,
        session_type: "quiz",
        end_time: { gte: startDate, lte: endDate },
      },
      select: { total_points: true, end_time: true },
    });
  }

  private async findMissionCompletions(userId: number, startDate: Date, endDate: Date) {
    return await prisma.user_Missions.findMany({
      where: {
        id_user: userId,
        completed_time: { gte: startDate, lte: endDate },
      },
      select: { points: true, completed_time: true },
    });
  }
}
