import {
  BadgeRuleLike,
  BadgeStats,
  buildBadgeProgress,
  calculateStreak,
  evaluateEligibleBadges,
  getStatValue,
  toJakartaDayKey,
} from "../../src/utils/badge-rules.js";

describe("badge-rules", () => {
  const sampleStats: BadgeStats = {
    total_points: 350,
    missions_completed: 5,
    quiz_answers: 20,
    streak_days: 4,
  };

  const sampleRules: BadgeRuleLike[] = [
    { code: "first_mission", category: "mission", threshold: 1, name: "Misi 1" },
    { code: "mission_master", category: "mission", threshold: 10, name: "Misi 10" },
    { code: "eco_starter", category: "points", threshold: 100, name: "Eco 100" },
    { code: "green_champion", category: "points", threshold: 500, name: "Eco 500" },
    { code: "first_quiz", category: "quiz", threshold: 1, name: "Kuis 1" },
    { code: "streak_3", category: "streak", threshold: 3, name: "Streak 3" },
    { code: "streak_7", category: "streak", threshold: 7, name: "Streak 7" },
    { code: "zero_badge", category: "points", threshold: 0, name: "Invalid" },
  ];

  describe("getStatValue", () => {
    it("returns correct stat for each known category", () => {
      expect(getStatValue(sampleStats, "points")).toBe(350);
      expect(getStatValue(sampleStats, "mission")).toBe(5);
      expect(getStatValue(sampleStats, "quiz")).toBe(20);
      expect(getStatValue(sampleStats, "streak")).toBe(4);
    });

    it("returns 0 for unknown category", () => {
      expect(getStatValue(sampleStats, "unknown")).toBe(0);
    });
  });

  describe("evaluateEligibleBadges", () => {
    it("returns codes where current stat meets or exceeds threshold", () => {
      const eligible = evaluateEligibleBadges(sampleStats, sampleRules);

      expect(eligible).toContain("first_mission");
      expect(eligible).toContain("eco_starter");
      expect(eligible).toContain("first_quiz");
      expect(eligible).toContain("streak_3");
      expect(eligible).not.toContain("mission_master");
      expect(eligible).not.toContain("green_champion");
      expect(eligible).not.toContain("streak_7");
      expect(eligible).not.toContain("zero_badge");
    });

    it("returns empty array when stats are all zero", () => {
      const zeroStats: BadgeStats = {
        total_points: 0,
        missions_completed: 0,
        quiz_answers: 0,
        streak_days: 0,
      };
      expect(evaluateEligibleBadges(zeroStats, sampleRules)).toEqual([]);
    });
  });

  describe("buildBadgeProgress", () => {
    it("builds progress list with percentage capped at 100 and earned flag", () => {
      const progress = buildBadgeProgress(
        sampleStats,
        sampleRules,
        ["first_mission"]
      );

      const firstMission = progress.find((p) => p.code === "first_mission");
      expect(firstMission).toBeDefined();
      expect(firstMission?.earned).toBe(true);
      expect(firstMission?.current).toBe(5);
      expect(firstMission?.percentage).toBe(100);

      const missionMaster = progress.find((p) => p.code === "mission_master");
      expect(missionMaster?.earned).toBe(false);
      expect(missionMaster?.current).toBe(5);
      expect(missionMaster?.percentage).toBe(50);
    });
  });

  describe("calculateStreak", () => {
    const fixedNow = new Date("2026-11-06T10:00:00+07:00");

    it("returns 0 when activity is empty", () => {
      expect(calculateStreak([], fixedNow)).toBe(0);
    });

    it("returns 0 when activity has only null/undefined values", () => {
      expect(calculateStreak([null, undefined], fixedNow)).toBe(0);
    });

    it("returns 1 when active only today", () => {
      const dates = [new Date("2026-11-06T08:00:00+07:00")];
      expect(calculateStreak(dates, fixedNow)).toBe(1);
    });

    it("returns 1 when active only yesterday", () => {
      const dates = [new Date("2026-11-05T20:00:00+07:00")];
      expect(calculateStreak(dates, fixedNow)).toBe(1);
    });

    it("returns 0 when last activity was 2 days ago", () => {
      const dates = [new Date("2026-11-04T12:00:00+07:00")];
      expect(calculateStreak(dates, fixedNow)).toBe(0);
    });

    it("counts consecutive days ending today", () => {
      const dates = [
        new Date("2026-11-04T09:00:00+07:00"),
        new Date("2026-11-05T14:00:00+07:00"),
        new Date("2026-11-06T07:30:00+07:00"),
      ];
      expect(calculateStreak(dates, fixedNow)).toBe(3);
    });

    it("deduplicates multiple events on the same day", () => {
      const dates = [
        new Date("2026-11-05T09:00:00+07:00"),
        new Date("2026-11-05T18:00:00+07:00"),
        new Date("2026-11-06T07:30:00+07:00"),
      ];
      expect(calculateStreak(dates, fixedNow)).toBe(2);
    });

    it("breaks streak on a missed day", () => {
      const dates = [
        new Date("2026-11-01T09:00:00+07:00"),
        new Date("2026-11-02T09:00:00+07:00"),
        // Nov 3 missed
        new Date("2026-11-04T09:00:00+07:00"),
        new Date("2026-11-05T09:00:00+07:00"),
        new Date("2026-11-06T09:00:00+07:00"),
      ];
      expect(calculateStreak(dates, fixedNow)).toBe(3);
    });
  });

  describe("toJakartaDayKey", () => {
    it("formats Date into YYYY-MM-DD in Asia/Jakarta timezone", () => {
      // 2026-11-06 01:00 UTC = 2026-11-06 08:00 Jakarta
      const date = new Date("2026-11-06T01:00:00Z");
      expect(toJakartaDayKey(date)).toBe("2026-11-06");
    });
  });
});
