import { QuizService } from "../../src/services/quiz.service.js";
import { QuizRepository } from "../../src/repositories/quiz.repository.js";
import { SessionRepository } from "../../src/repositories/session.repository.js";
import { BadgeService } from "../../src/services/badge.service.js";
import { AppError } from "../../src/middleware/error.middleware.js";

describe("QuizService - submitAnswer hardening", () => {
  let quizRepo: jest.Mocked<QuizRepository>;
  let sessionRepo: jest.Mocked<SessionRepository>;
  let badgeService: jest.Mocked<BadgeService>;
  let service: QuizService;

  beforeEach(() => {
    quizRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findAnswerById: jest.fn(),
      getQuestionCount: jest.fn(),
      create: jest.fn(),
      createWithQuestions: jest.fn(),
      update: jest.fn(),
      updateWithQuestions: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<QuizRepository>;

    sessionRepo = {
      create: jest.fn().mockResolvedValue({ id_session: 99 } as any),
      hasAnsweredQuizQuestionInRange: jest.fn().mockResolvedValue(false),
      findByUserId: jest.fn(),
      getWeeklyPoints: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<SessionRepository>;

    badgeService = {
      evaluateAndAward: jest.fn().mockResolvedValue([]),
      getCatalog: jest.fn(),
      getUserBadges: jest.fn(),
    } as unknown as jest.Mocked<BadgeService>;

    service = new QuizService(quizRepo, sessionRepo, badgeService);
  });

  it("rejects non-integer or negative question/answer IDs with 400", async () => {
    await expect(
      service.submitAnswer({ id_question: -1, id_answer: 2 }, 1)
    ).rejects.toThrow(AppError);

    await expect(
      service.submitAnswer({ id_question: 1, id_answer: 0 }, 1)
    ).rejects.toThrow(AppError);

    await expect(
      service.submitAnswer(
        { id_question: 1.5, id_answer: 2 } as any,
        1
      )
    ).rejects.toThrow(AppError);
  });

  it("throws 404 when answer is not found", async () => {
    quizRepo.findAnswerById.mockResolvedValueOnce(null);

    await expect(
      service.submitAnswer({ id_question: 5, id_answer: 10 }, 1)
    ).rejects.toThrow("Answer not found");
  });

  it("throws 400 when answer belongs to another question", async () => {
    quizRepo.findAnswerById.mockResolvedValueOnce({
      id_answer: 10,
      id_question: 999, // Mismatched
      points: 10,
      content: "A",
      question: { id_question: 999, id_quiz: 1, content: "Q", order: 1, quiz: null },
    } as any);

    await expect(
      service.submitAnswer({ id_question: 5, id_answer: 10 }, 1)
    ).rejects.toThrow("Answer does not belong to this question");
  });

  it("blocks duplicate submission within daily quiz window", async () => {
    quizRepo.findAnswerById.mockResolvedValueOnce({
      id_answer: 10,
      id_question: 5,
      points: 10,
      content: "A",
      question: {
        id_question: 5,
        id_quiz: 1,
        content: "Q",
        order: 1,
        quiz: { category: "Harian" },
      },
    } as any);

    sessionRepo.hasAnsweredQuizQuestionInRange.mockResolvedValueOnce(true);

    await expect(
      service.submitAnswer({ id_question: 5, id_answer: 10 }, 42)
    ).rejects.toThrow("Pertanyaan ini hanya bisa dijawab 1x per hari");

    expect(sessionRepo.hasAnsweredQuizQuestionInRange).toHaveBeenCalled();
    expect(sessionRepo.create).not.toHaveBeenCalled();
  });

  it("clamps negative answer points to 0 and invokes badge evaluation", async () => {
    quizRepo.findAnswerById.mockResolvedValueOnce({
      id_answer: 10,
      id_question: 5,
      points: -50, // Negative points from legacy data
      content: "A",
      question: {
        id_question: 5,
        id_quiz: 1,
        content: "Q",
        order: 1,
        quiz: { category: "Umum" },
      },
    } as any);

    const result = await service.submitAnswer(
      { id_question: 5, id_answer: 10 },
      42
    );

    expect(result.points_earned).toBe(0);
    expect(result.session_id).toBe(99);
    expect(sessionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_user: 42,
        id_answer: 10,
        id_quiz: 1,
        total_points: 0,
      })
    );
    expect(badgeService.evaluateAndAward).toHaveBeenCalledWith(42);
  });
});
