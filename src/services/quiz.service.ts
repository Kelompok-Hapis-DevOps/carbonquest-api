import {
  CreateQuizDTO,
  UpdateQuizWithQuestionsDTO,
  SubmitQuizAnswerDTO,
  QuizSubmissionResultDTO,
} from "../types/index.js";
import { QuizRepository } from "../repositories/quiz.repository.js";
import { SessionRepository } from "../repositories/session.repository.js";
import { BadgeService } from "./badge.service.js";
import { AppError } from "../middleware/error.middleware.js";
import {
  getJakartaDayRange,
  getJakartaMonthRange,
  getJakartaWeekRange,
} from "../utils/timezone.js";

interface AttemptWindow {
  start: Date;
  end: Date;
  label: string;
}

function getAttemptWindow(category: string | undefined, now: Date): AttemptWindow | null {
  const normalized = category?.trim().toLowerCase();

  if (normalized === "harian") {
    return { ...getJakartaDayRange(now), label: "hari" };
  }
  if (normalized === "mingguan") {
    return { ...getJakartaWeekRange(now), label: "minggu" };
  }
  if (normalized === "bulanan") {
    return { ...getJakartaMonthRange(now), label: "bulan" };
  }
  return null;
}

export class QuizService {
  private repository: QuizRepository;
  private sessionRepository: SessionRepository;
  private badgeService: BadgeService;

  constructor(
    repository: QuizRepository = new QuizRepository(),
    sessionRepository: SessionRepository = new SessionRepository(),
    badgeService: BadgeService = new BadgeService()
  ) {
    this.repository = repository;
    this.sessionRepository = sessionRepository;
    this.badgeService = badgeService;
  }

  async getAllQuizzes() {
    const quizzes = await this.repository.findAll();
    return await Promise.all(
      quizzes.map(async (quiz: { id_quiz: number }) => ({
        ...quiz,
        question_count: await this.repository.getQuestionCount(quiz.id_quiz),
      }))
    );
  }

  async getQuizById(id: number) {
    const quiz = await this.repository.findById(id);
    if (!quiz) {
      throw new AppError("Quiz not found", 404);
    }
    return quiz;
  }

  async createQuiz(data: CreateQuizDTO, creatorId: number) {
    const hasQuestions = data.questions && data.questions.length > 0;

    if (hasQuestions) {
      return await this.repository.createWithQuestions({ ...data, id_creator: creatorId });
    }

    return await this.repository.create({ ...data, id_creator: creatorId });
  }

  async updateQuiz(id: number, data: UpdateQuizWithQuestionsDTO) {
    await this.getQuizById(id);
    const hasQuestions = data.questions && data.questions.length > 0;

    if (hasQuestions) {
      return await this.repository.updateWithQuestions(id, data);
    }

    return await this.repository.update(id, data);
  }

  async deleteQuiz(id: number) {
    await this.getQuizById(id);
    await this.repository.delete(id);
  }

  async submitAnswer(data: SubmitQuizAnswerDTO, userId: number): Promise<QuizSubmissionResultDTO> {
    if (
      !Number.isInteger(data.id_question) ||
      data.id_question <= 0 ||
      !Number.isInteger(data.id_answer) ||
      data.id_answer <= 0
    ) {
      throw new AppError("id_question and id_answer must be positive integers", 400);
    }

    const answer = await this.repository.findAnswerById(data.id_answer);

    if (!answer) {
      throw new AppError("Answer not found", 404);
    }

    if (answer.id_question !== data.id_question) {
      throw new AppError("Answer does not belong to this question", 400);
    }

    const window = getAttemptWindow(
      answer.question.quiz?.category ?? undefined,
      new Date()
    );

    // ponytail: check-then-insert race; add a unique (user, question, period) index only if concurrent submits matter.
    if (window) {
      const alreadyAnswered =
        await this.sessionRepository.hasAnsweredQuizQuestionInRange(
          userId,
          data.id_question,
          window.start,
          window.end
        );

      if (alreadyAnswered) {
        throw new AppError(
          `Pertanyaan ini hanya bisa dijawab 1x per ${window.label}`,
          400
        );
      }
    }

    const pointsEarned = Math.max(0, Math.trunc(answer.points ?? 0));
    const session = await this.createQuizSession(
      userId,
      data.id_answer,
      answer.question.id_quiz,
      pointsEarned
    );

    await this.badgeService.evaluateAndAward(userId);

    return {
      points_earned: pointsEarned,
      session_id: session.id_session,
    };
  }

  private async createQuizSession(
    userId: number,
    answerId: number,
    quizId: number,
    points: number
  ) {
    return await this.sessionRepository.create({
      id_user: userId,
      id_answer: answerId,
      id_quiz: quizId,
      session_type: "quiz",
      total_points: points,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
    });
  }
}
