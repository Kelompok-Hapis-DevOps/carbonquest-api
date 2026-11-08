import { CreateSessionDTO, UpdateSessionDTO, WeeklyPointsDTO } from "../types/index.js";
import { SessionRepository } from "../repositories/session.repository.js";

export class SessionService {
  private repository: SessionRepository;

  constructor(repository: SessionRepository = new SessionRepository()) {
    this.repository = repository;
  }

  async createSession(data: CreateSessionDTO, userId: number) {
    return await this.repository.create({ ...data, id_user: userId });
  }

  async updateSession(id: number, data: UpdateSessionDTO) {
    return await this.repository.update(id, {
      total_points: data.total_points,
      end_time: data.end_time ? new Date(data.end_time) : new Date(),
    });
  }

  async getUserSessions(userId: number) {
    return await this.repository.findByUserId(userId);
  }

  async getWeeklyPointsHistory(userId: number, days: number = 7): Promise<WeeklyPointsDTO[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const { quizSessions, missionCompletions } = await this.repository.getWeeklyPoints(
      userId,
      Math.ceil(days / 7)
    );

    const dailyData = this.initializeDailyData(startDate, days);
    this.processQuizSessions(quizSessions, dailyData);
    this.processMissionCompletions(missionCompletions, dailyData);

    return Array.from(dailyData.values()).sort((a, b) => a.week.localeCompare(b.week));
  }

  private initializeDailyData(startDate: Date, days: number): Map<string, WeeklyPointsDTO> {
    const dailyData = new Map<string, WeeklyPointsDTO>();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayKey = this.getDayKey(date);
      dailyData.set(dayKey, {
        week: dayKey,
        mission_points: 0,
        quiz_points: 0,
        total_points: 0,
        missions_completed: 0,
        quizzes_completed: 0,
      });
    }

    return dailyData;
  }

  private processQuizSessions(
    sessions: Array<{ total_points: number | null; end_time: Date | null }>,
    dailyData: Map<string, WeeklyPointsDTO>
  ): void {
    sessions.forEach((session) => {
      if (!session.end_time) return;

      const dayKey = this.getDayKey(session.end_time);
      const dayData = dailyData.get(dayKey);
      if (!dayData) return;

      dayData.quiz_points += session.total_points || 0;
      dayData.quizzes_completed += 1;
      dayData.total_points = dayData.mission_points + dayData.quiz_points;
    });
  }

  private processMissionCompletions(
    missions: Array<{ points: number | null; completed_time: Date | null }>,
    dailyData: Map<string, WeeklyPointsDTO>
  ): void {
    missions.forEach((mission) => {
      if (!mission.completed_time) return;

      const dayKey = this.getDayKey(mission.completed_time);
      const dayData = dailyData.get(dayKey);
      if (!dayData) return;

      dayData.mission_points += mission.points || 0;
      dayData.missions_completed += 1;
      dayData.total_points = dayData.mission_points + dayData.quiz_points;
    });
  }

  private getDayKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  }
}
