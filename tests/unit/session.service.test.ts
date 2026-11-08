import { SessionService } from "../../src/services/session.service.js";
import { SessionRepository } from "../../src/repositories/session.repository.js";

describe("SessionService", () => {
  let repository: jest.Mocked<SessionRepository>;
  let service: SessionService;

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue({ id_session: 1 } as any),
      update: jest.fn().mockResolvedValue({ id_session: 1 } as any),
      findByUserId: jest.fn().mockResolvedValue([]),
      getWeeklyPoints: jest.fn().mockResolvedValue({
        quizSessions: [],
        missionCompletions: [],
      }),
      hasAnsweredQuizQuestionInRange: jest.fn().mockResolvedValue(false),
    } as unknown as jest.Mocked<SessionRepository>;

    service = new SessionService(repository);
  });

  it("createSession attaches userId and delegates", async () => {
    await service.createSession({ id_answer: 10 } as any, 5);
    expect(repository.create).toHaveBeenCalledWith({ id_answer: 10, id_user: 5 });
  });

  it("updateSession delegates to repository", async () => {
    await service.updateSession(1, { total_points: 50 });
    expect(repository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ total_points: 50 })
    );
  });

  it("getUserSessions queries by userId", async () => {
    await service.getUserSessions(10);
    expect(repository.findByUserId).toHaveBeenCalledWith(10);
  });

  it("getWeeklyPointsHistory maps quiz and mission data into daily entries", async () => {
    const today = new Date();
    repository.getWeeklyPoints.mockResolvedValueOnce({
      quizSessions: [{ total_points: 20, end_time: today }],
      missionCompletions: [{ points: 50, completed_time: today }],
    });

    const result = await service.getWeeklyPointsHistory(1, 3);
    expect(result).toHaveLength(3);

    const todayEntry = result[result.length - 1];
    expect(todayEntry.quiz_points).toBe(20);
    expect(todayEntry.mission_points).toBe(50);
    expect(todayEntry.total_points).toBe(70);
  });
});
