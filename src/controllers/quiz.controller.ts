import { NextFunction, Response } from "express";
import {
  AuthenticatedRequest,
  CreateQuizDTO,
  SubmitQuizAnswerDTO,
} from "../types/index.js";
import { ResponseUtil } from "../utils/response.js";
import { QuizService } from "../services/quiz.service.js";
import { parseId } from "../utils/helpers.js";
import { recordAudit } from "../utils/audit.js";

export class QuizController {
  private service: QuizService;

  constructor() {
    this.service = new QuizService();
  }

  public createQuiz = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CreateQuizDTO = req.body;
      const quiz = await this.service.createQuiz(data, req.user.sub);
      ResponseUtil.created(res, "Quiz created successfully", quiz);
    } catch (err) {
      next(err);
    }
  };

  public getAllQuizzes = async (
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const quizzes = await this.service.getAllQuizzes();
      ResponseUtil.success(res, "Quizzes retrieved successfully", quizzes);
    } catch (err) {
      next(err);
    }
  };

  public getQuizById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      const quiz = await this.service.getQuizById(id);
      ResponseUtil.success(res, "Quiz retrieved successfully", quiz);
    } catch (err) {
      next(err);
    }
  };

  public updateQuiz = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      const quiz = await this.service.updateQuiz(id, req.body);
      ResponseUtil.success(res, "Quiz updated successfully", quiz);
    } catch (err) {
      next(err);
    }
  };

  public deleteQuiz = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      await this.service.deleteQuiz(id);
      await recordAudit(req, "quiz.delete", "quiz", id);
      ResponseUtil.success(res, "Quiz deleted successfully", null);
    } catch (err) {
      next(err);
    }
  };

  public submitAnswer = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: SubmitQuizAnswerDTO = req.body;
      const result = await this.service.submitAnswer(data, req.user.sub);
      ResponseUtil.success(res, "Answer submitted successfully", result);
    } catch (err) {
      next(err);
    }
  };
}
