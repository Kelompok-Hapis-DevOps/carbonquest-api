import { UserMissionService } from "../../src/services/user-mission.service.js";
import { UserMissionRepository } from "../../src/repositories/user-mission.repository.js";
import { BadgeService } from "../../src/services/badge.service.js";

describe("UserMissionService", () => {
  let repository: jest.Mocked<UserMissionRepository>;
  let badgeService: jest.Mocked<BadgeService>;
  let service: UserMissionService;

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue({ id_working: 1, id_user: 5 } as any),
      update: jest.fn().mockResolvedValue({
        id_working: 1,
        id_user: 5,
        status: "completed",
        completed_time: new Date(),
      } as any),
      findByUserId: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<UserMissionRepository>;

    badgeService = {
      evaluateAndAward: jest.fn().mockResolvedValue([]),
      getCatalog: jest.fn(),
      getUserBadges: jest.fn(),
    } as unknown as jest.Mocked<BadgeService>;

    service = new UserMissionService(repository, badgeService);
  });

  it("startMission creates user mission record", async () => {
    await service.startMission({ id_mission: 10 }, 5);
    expect(repository.create).toHaveBeenCalledWith({ id_mission: 10, id_user: 5 });
  });

  it("updateMission evaluates and awards badges on completion", async () => {
    await service.updateMission(1, { status: "completed" });
    expect(repository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ status: "completed" })
    );
    expect(badgeService.evaluateAndAward).toHaveBeenCalledWith(5);
  });

  it("getUserMissions queries missions by user id", async () => {
    await service.getUserMissions(5);
    expect(repository.findByUserId).toHaveBeenCalledWith(5);
  });
});
