import { ArticleService } from "../../src/services/article.service.js";
import { ArticleRepository } from "../../src/repositories/article.repository.js";
import { AppError } from "../../src/middleware/error.middleware.js";

describe("ArticleService", () => {
  let repository: jest.Mocked<ArticleRepository>;
  let service: ArticleService;

  beforeEach(() => {
    repository = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id_article: 1 } as any),
      update: jest.fn().mockResolvedValue({ id_article: 1 } as any),
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ArticleRepository>;

    service = new ArticleService(repository);
  });

  it("getAllArticles returns list from repository", async () => {
    const list = [{ id_article: 1, title: "Art 1" }] as any;
    repository.findAll.mockResolvedValueOnce(list);

    const result = await service.getAllArticles();
    expect(result).toBe(list);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it("createArticle adds authorId to payload and saves", async () => {
    const payload = { title: "Climate" };
    await service.createArticle(payload as any, 10);

    expect(repository.create).toHaveBeenCalledWith({
      title: "Climate",
      id_author: 10,
    });
  });

  it("getArticleById throws 404 when not found", async () => {
    repository.findById.mockResolvedValueOnce(null);
    await expect(service.getArticleById(99)).rejects.toThrow(AppError);
  });

  it("getArticleById returns article when found", async () => {
    const article = { id_article: 5, title: "Found" } as any;
    repository.findById.mockResolvedValueOnce(article);

    const result = await service.getArticleById(5);
    expect(result).toBe(article);
  });

  it("updateArticle checks existence before updating", async () => {
    repository.findById.mockResolvedValueOnce({ id_article: 5 } as any);
    await service.updateArticle(5, { title: "Updated" });

    expect(repository.findById).toHaveBeenCalledWith(5);
    expect(repository.update).toHaveBeenCalledWith(5, { title: "Updated" });
  });

  it("deleteArticle checks existence before deleting", async () => {
    repository.findById.mockResolvedValueOnce({ id_article: 5 } as any);
    await service.deleteArticle(5);

    expect(repository.findById).toHaveBeenCalledWith(5);
    expect(repository.delete).toHaveBeenCalledWith(5);
  });
});
