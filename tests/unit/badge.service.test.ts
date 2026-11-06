import { BadgeService } from "../../src/services/badge.service.js";
import {
  BadgeRepository,
  BadgeRuleRow,
} from "../../src/repositories/badge.repository.js";

describe("BadgeService", () => {
  let repository: jest.Mocked<BadgeRepository>;
  let service: BadgeService;

  const mockRules: BadgeRuleRow[] = [
    {
      id_badge: 1,
      code: "first_mission",
      name: "Langkah Pertama",
      description: "Selesaikan 1 misi",
      icon: "🌱",
      category: "mission",
      threshold: 1,
    },
    {
      id_badge: 2,
      code: "mission_master",
      name: "Pejuang Misi",
      description: "Selesaikan 10 misi",
      icon: "🎯",
      category: "mission",
      threshold: 10,
    },
    {
      id_badge: 3,
      code: "eco_starter",
      name: "Eco Starter",
      description: "100 poin",
      icon: "🍃",
      category: "points",
      threshold: 100,
    },
  ];

  beforeEach(() => {
    repository = {
      findAll: jest.fn().mockResolvedValue(mockRules),
      ensureCatalog: jest.fn().mockResolvedValue(undefined),
      findUserBadges: jest.fn().mockResolvedValue([]),
      award: jest.fn().mockResolvedValue(undefined),
      getUserStats: jest.fn().mockResolvedValue({
        total_points: 150,
        missions_completed: 1,
        quiz_answers: 0,
        activity_dates: [new Date()],
      }),
    } as unknown as jest.Mocked<BadgeRepository>;

    service = new BadgeService(repository);
  });

  describe("getCatalog", () => {
    it("ensures catalog before returning rules", async () => {
      const result = await service.getCatalog();
      expect(repository.ensureCatalog).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRules);
    });
  });

  describe("getUserBadges", () => {
    it("returns stats, earned badges, progress list, and next closest badges", async () => {
      repository.findUserBadges.mockResolvedValueOnce([
        {
          id_user_badge: 10,
          id_user: 42,
          id_badge: 1,
          earned_at: new Date("2026-11-01T00:00:00Z"),
          badge: mockRules[0],
        },
      ] as any);

      const summary = await service.getUserBadges(42);

      expect(summary.stats.total_points).toBe(150);
      expect(summary.stats.missions_completed).toBe(1);
      expect(summary.earned).toHaveLength(1);
      expect(summary.earned[0].code).toBe("first_mission");

      // eco_starter (150/100 -> 100%) and mission_master (1/10 -> 10%)
      expect(summary.progress).toHaveLength(3);
      expect(summary.next).toHaveLength(2);
      expect(summary.next[0].code).toBe("eco_starter");
    });
  });

  describe("evaluateAndAward", () => {
    it("awards only eligible badges that the user does not already own", async () => {
      // User has 150 points (eligible for eco_starter) and 1 mission (eligible for first_mission)
      // But already owns first_mission (id_badge = 1)
      repository.findUserBadges.mockResolvedValueOnce([
        {
          id_user_badge: 1,
          id_user: 42,
          id_badge: 1,
          earned_at: new Date(),
          badge: mockRules[0],
        },
      ] as any);

      const newlyAwarded = await service.evaluateAndAward(42);

      // Only eco_starter (id_badge = 3) should be awarded
      expect(repository.award).toHaveBeenCalledWith(42, [3]);
      expect(newlyAwarded).toEqual(["eco_starter"]);
    });

    it("does not award anything if user is already up to date", async () => {
      repository.findUserBadges.mockResolvedValueOnce([
        {
          id_user_badge: 1,
          id_user: 42,
          id_badge: 1,
          earned_at: new Date(),
          badge: mockRules[0],
        },
        {
          id_user_badge: 2,
          id_user: 42,
          id_badge: 3,
          earned_at: new Date(),
          badge: mockRules[2],
        },
      ] as any);

      const newlyAwarded = await service.evaluateAndAward(42);

      expect(repository.award).toHaveBeenCalledWith(42, []);
      expect(newlyAwarded).toEqual([]);
    });
  });
});
