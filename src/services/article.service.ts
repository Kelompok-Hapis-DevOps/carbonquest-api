import { CreateArticleDTO } from "../types/index.js";
import { ArticleRepository } from "../repositories/article.repository.js";
import { AppError } from "../middleware/error.middleware.js";

export class ArticleService {
  private repository: ArticleRepository;

  constructor(repository: ArticleRepository = new ArticleRepository()) {
    this.repository = repository;
  }

  async getAllArticles() {
    return await this.repository.findAll();
  }

  async createArticle(data: CreateArticleDTO, authorId: number) {
    return await this.repository.create({ ...data, id_author: authorId });
  }

  async getArticleById(id: number) {
    const article = await this.repository.findById(id);
    if (!article) {
      throw new AppError("Article not found", 404);
    }
    return article;
  }

  async updateArticle(id: number, data: Partial<CreateArticleDTO>) {
    await this.getArticleById(id);
    return await this.repository.update(id, data);
  }

  async deleteArticle(id: number) {
    await this.getArticleById(id);
    await this.repository.delete(id);
  }
}
