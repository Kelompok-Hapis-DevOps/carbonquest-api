import { ArticleController } from "../../src/controllers/article.controller.js";
import { AuthController } from "../../src/controllers/auth.controller.js";
import { BadgeController } from "../../src/controllers/badge.controller.js";
import { AuditController } from "../../src/controllers/audit.controller.js";
import { MissionController } from "../../src/controllers/mission.controller.js";
import { OrganizationController } from "../../src/controllers/organization.controller.js";
import { QuizController } from "../../src/controllers/quiz.controller.js";
import { UserController } from "../../src/controllers/user.controller.js";
import { SessionController } from "../../src/controllers/session.controller.js";
import { UserMissionController } from "../../src/controllers/user-mission.controller.js";

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Controllers Suite", () => {
  describe("ArticleController", () => {
    let controller: ArticleController;
    let mockService: any;

    beforeEach(() => {
      controller = new ArticleController();
      mockService = {
        createArticle: jest.fn().mockResolvedValue({ id_article: 1 }),
        getAllArticles: jest.fn().mockResolvedValue([]),
        getArticleById: jest.fn().mockResolvedValue({ id_article: 1 }),
        updateArticle: jest.fn().mockResolvedValue({ id_article: 1 }),
        deleteArticle: jest.fn().mockResolvedValue(undefined),
      };
      (controller as any).service = mockService;
    });

    it("createArticle calls service and responds 201", async () => {
      const req: any = { body: { title: "A" }, user: { sub: 1 } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.createArticle(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("getAllArticles responds with 200", async () => {
      const req: any = {};
      const res = createMockRes();
      const next = jest.fn();

      await controller.getAllArticles(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("getArticleById responds with 200", async () => {
      const req: any = { params: { id: "1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getArticleById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("updateArticle responds with 200", async () => {
      const req: any = { params: { id: "1" }, body: { title: "Up" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updateArticle(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("deleteArticle responds with 200", async () => {
      const req: any = { params: { id: "1" }, user: { sub: 1, role: "org" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteArticle(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("forwards error to next", async () => {
      mockService.getAllArticles.mockRejectedValueOnce(new Error("Boom"));
      const req: any = {};
      const res = createMockRes();
      const next = jest.fn();

      await controller.getAllArticles(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("AuthController", () => {
    let controller: AuthController;
    let mockService: any;

    beforeEach(() => {
      controller = new AuthController();
      mockService = {
        registerUser: jest.fn().mockResolvedValue({ user: { id_user: 1 } }),
        loginUser: jest.fn().mockResolvedValue({ user: { id_user: 1 } }),
        registerOrganization: jest.fn().mockResolvedValue({ org: { id_organisasi: 2 } }),
        loginOrganization: jest.fn().mockResolvedValue({ org: { id_organisasi: 2 } }),
      };
      (controller as any).service = mockService;
    });

    it("registerUser returns 201", async () => {
      const req: any = { body: { email: "u@u.com" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.registerUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("loginUser returns 200", async () => {
      const req: any = { body: { email: "u@u.com" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.loginUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("registerOrganization returns 201", async () => {
      const req: any = { body: { email: "o@o.com" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.registerOrganization(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("loginOrganization returns 200", async () => {
      const req: any = { body: { email: "o@o.com" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.loginOrganization(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("loginUser forwards error to next on failure", async () => {
      mockService.loginUser.mockRejectedValueOnce(new Error("Invalid"));
      const req: any = { body: { email: "u@u.com" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.loginUser(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("loginOrganization forwards error to next on failure", async () => {
      mockService.loginOrganization.mockRejectedValueOnce(new Error("Invalid"));
      const req: any = { body: { email: "o@o.com" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.loginOrganization(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("BadgeController", () => {
    let controller: BadgeController;
    let mockService: any;

    beforeEach(() => {
      controller = new BadgeController();
      mockService = {
        getCatalog: jest.fn().mockResolvedValue([]),
        getUserBadges: jest.fn().mockResolvedValue({}),
      };
      (controller as any).service = mockService;
    });

    it("getCatalog responds with 200", async () => {
      const req: any = {};
      const res = createMockRes();
      const next = jest.fn();

      await controller.getCatalog(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("getUserBadges responds with 200", async () => {
      const req: any = { user: { sub: 5 } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getUserBadges(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("AuditController", () => {
    let controller: AuditController;
    let mockService: any;

    beforeEach(() => {
      controller = new AuditController();
      mockService = {
        list: jest.fn().mockResolvedValue({ rows: [] }),
      };
      (controller as any).service = mockService;
    });

    it("listLogs parses filter and responds with 200", async () => {
      const req: any = { query: { limit: "10", offset: "0", action: "auth.login" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.listLogs(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockService.list).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        action: "auth.login",
      });
    });
  });

  describe("MissionController", () => {
    let controller: MissionController;
    let mockService: any;

    beforeEach(() => {
      controller = new MissionController();
      mockService = {
        createMission: jest.fn().mockResolvedValue({ id_mission: 1 }),
        getAllMissions: jest.fn().mockResolvedValue([]),
        getMissionById: jest.fn().mockResolvedValue({ id_mission: 1 }),
        updateMission: jest.fn().mockResolvedValue({ id_mission: 1 }),
        deleteMission: jest.fn().mockResolvedValue(undefined),
      };
      (controller as any).service = mockService;
    });

    it("createMission responds with 201", async () => {
      const req: any = { body: { title: "M" }, user: { sub: 1 } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.createMission(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("getAllMissions responds with 200", async () => {
      const req: any = {};
      const res = createMockRes();
      const next = jest.fn();

      await controller.getAllMissions(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("getMissionById responds with 200", async () => {
      const req: any = { params: { id: "1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getMissionById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("updateMission responds with 200", async () => {
      const req: any = { params: { id: "1" }, body: { title: "New" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updateMission(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("deleteMission responds with 200", async () => {
      const req: any = { params: { id: "1" }, user: { sub: 1, role: "org" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteMission(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("OrganizationController", () => {
    let controller: OrganizationController;
    let mockService: any;

    beforeEach(() => {
      controller = new OrganizationController();
      mockService = {
        getAllOrganizations: jest.fn().mockResolvedValue([]),
        updatePassword: jest.fn().mockResolvedValue(undefined),
      };
      (controller as any).service = mockService;
    });

    it("getAllOrganizations responds with 200", async () => {
      const req: any = {};
      const res = createMockRes();
      const next = jest.fn();

      await controller.getAllOrganizations(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("updatePassword validates ownership and responds with 200", async () => {
      const req: any = {
        params: { id: "2" },
        user: { sub: 2, role: "org" },
        body: { oldPassword: "old", newPassword: "new" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updatePassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("QuizController", () => {
    let controller: QuizController;
    let mockService: any;

    beforeEach(() => {
      controller = new QuizController();
      mockService = {
        createQuiz: jest.fn().mockResolvedValue({ id_quiz: 1 }),
        getAllQuizzes: jest.fn().mockResolvedValue([]),
        getQuizById: jest.fn().mockResolvedValue({ id_quiz: 1 }),
        updateQuiz: jest.fn().mockResolvedValue({ id_quiz: 1 }),
        deleteQuiz: jest.fn().mockResolvedValue(undefined),
        submitAnswer: jest.fn().mockResolvedValue({ points_earned: 10 }),
      };
      (controller as any).service = mockService;
    });

    it("createQuiz responds with 201", async () => {
      const req: any = { body: { title: "Q" }, user: { sub: 1 } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.createQuiz(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("getAllQuizzes responds with 200", async () => {
      const req: any = {};
      const res = createMockRes();
      const next = jest.fn();

      await controller.getAllQuizzes(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("getQuizById responds with 200", async () => {
      const req: any = { params: { id: "1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getQuizById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("updateQuiz responds with 200", async () => {
      const req: any = { params: { id: "1" }, body: { title: "Updated" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updateQuiz(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("deleteQuiz responds with 200", async () => {
      const req: any = { params: { id: "1" }, user: { sub: 1, role: "org" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteQuiz(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("submitAnswer responds with 200", async () => {
      const req: any = { body: { id_question: 1, id_answer: 2 }, user: { sub: 5 } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.submitAnswer(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("UserController", () => {
    let controller: UserController;
    let mockService: any;

    beforeEach(() => {
      controller = new UserController();
      mockService = {
        getAllUsers: jest.fn().mockResolvedValue([]),
        getUserById: jest.fn().mockResolvedValue({ id_user: 1 }),
        getLeaderboard: jest.fn().mockResolvedValue([]),
        updatePassword: jest.fn().mockResolvedValue(undefined),
        updateUser: jest.fn().mockResolvedValue({ id_user: 1 }),
        deleteUser: jest.fn().mockResolvedValue(undefined),
        updateProfileImage: jest.fn().mockResolvedValue({ id_user: 1 }),
      };
      (controller as any).service = mockService;
    });

    it("getAllUsers responds with 200", async () => {
      const req: any = {};
      const res = createMockRes();
      const next = jest.fn();

      await controller.getAllUsers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("getUserById responds with 200", async () => {
      const req: any = { params: { id: "1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("getLeaderboard responds with 200", async () => {
      const req: any = {};
      const res = createMockRes();
      const next = jest.fn();

      await controller.getLeaderboard(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("updatePassword validates ownership and responds with 200", async () => {
      const req: any = {
        params: { id: "5" },
        user: { sub: 5, role: "user" },
        body: { oldPassword: "old", newPassword: "new" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updatePassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("updateUser validates ownership and responds with 200", async () => {
      const req: any = {
        params: { id: "5" },
        user: { sub: 5, role: "user" },
        body: { name: "Alice" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("deleteUser validates ownership and responds with 200", async () => {
      const req: any = {
        params: { id: "5" },
        user: { sub: 5, role: "user" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("SessionController", () => {
    let controller: SessionController;
    let mockService: any;

    beforeEach(() => {
      controller = new SessionController();
      mockService = {
        getUserSessions: jest.fn().mockResolvedValue([]),
        getWeeklyPointsHistory: jest.fn().mockResolvedValue([]),
      };
      (controller as any).service = mockService;
    });

    it("getUserSessions responds with 200", async () => {
      const req: any = { user: { sub: 10 } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getUserSessions(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("getDailyPoints responds with 200", async () => {
      const req: any = { user: { sub: 10 }, query: { days: "7" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getDailyPoints(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("UserMissionController", () => {
    let controller: UserMissionController;
    let mockService: any;

    beforeEach(() => {
      controller = new UserMissionController();
      mockService = {
        startMission: jest.fn().mockResolvedValue({ id_working: 1 }),
        updateMission: jest.fn().mockResolvedValue({ id_working: 1 }),
        getUserMissions: jest.fn().mockResolvedValue([]),
      };
      (controller as any).service = mockService;
    });

    it("startMission responds with 201", async () => {
      const req: any = { body: { id_mission: 1 }, user: { sub: 5 } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.startMission(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("updateMission responds with 200", async () => {
      const req: any = { params: { id: "1" }, body: { status: "completed" }, user: { sub: 5 } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updateMission(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("getUserMissions responds with 200", async () => {
      const req: any = { user: { sub: 5 } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getUserMissions(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
