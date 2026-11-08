import { NextFunction, Response } from "express";
import { AuthenticatedRequest, CreateArticleDTO } from "../types/index.js";
import { ResponseUtil } from "../utils/response.js";
import { ArticleService } from "../services/article.service.js";
import {
  removeUndefinedFields,
  parseId,
  buildFilePath,
} from "../utils/helpers.js";
import { recordAudit } from "../utils/audit.js";

export class ArticleController {
  private service: ArticleService;

  constructor() {
    this.service = new ArticleService();
  }

  public createArticle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CreateArticleDTO = {
        title: req.body.title,
        topic: req.body.topic,
        description: req.body.description,
        content: req.body.content,
        photo_caption: req.body.photoCaption,
        photo_credit: req.body.photoCredit,
        author_name: req.body.authorName,
        author_role: req.body.authorRole,
        place: req.body.place,
        highlights: req.body.highlights,
        cover_image: req.file ? buildFilePath(req.file.filename) : undefined,
      };

      const article = await this.service.createArticle(data, req.user.sub);
      ResponseUtil.created(res, "Article created successfully", article);
    } catch (err) {
      next(err);
    }
  };

  public getAllArticles = async (
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const articles = await this.service.getAllArticles();
      ResponseUtil.success(res, "Articles retrieved successfully", articles);
    } catch (err) {
      next(err);
    }
  };

  public getArticleById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      const article = await this.service.getArticleById(id);
      ResponseUtil.success(res, "Article retrieved successfully", article);
    } catch (err) {
      next(err);
    }
  };

  public updateArticle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      const data = removeUndefinedFields<Partial<CreateArticleDTO>>({
        title: req.body.title,
        topic: req.body.topic,
        description: req.body.description,
        content: req.body.content,
        photo_caption: req.body.photoCaption,
        photo_credit: req.body.photoCredit,
        author_name: req.body.authorName,
        author_role: req.body.authorRole,
        place: req.body.place,
        highlights: req.body.highlights,
        cover_image: req.file ? buildFilePath(req.file.filename) : undefined,
      });

      const article = await this.service.updateArticle(id, data);
      ResponseUtil.success(res, "Article updated successfully", article);
    } catch (err) {
      next(err);
    }
  };

  public deleteArticle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      await this.service.deleteArticle(id);
      await recordAudit(req, "article.delete", "article", id);
      ResponseUtil.success(res, "Article deleted successfully", null);
    } catch (err) {
      next(err);
    }
  };
}
