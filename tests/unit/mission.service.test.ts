import { MissionService } from "../../src/services/mission.service.js";
import { MissionRepository } from "../../src/repositories/mission.repository.js";
describe("MissionService", () => {
  let repository: jest.Mocked<MissionRepository>;
  let service: MissionService;

  beforeEach(() => {
    repository = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id_mission: 1 } as any),
      update: jest.fn().mockResolvedValue({ id_mission: 1 } as any),
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<MissionRepository>;

    service = new MissionService(repository);
  });

  it("getAllMissions returns all missions", async () => {
    const list = [{ id_mission: 1, title: "Plant Trees" }] as any;
    repository.findAll.mockResolvedValueOnce(list);

    const result = await service.getAllMissions();
    expect(result).toBe(list);
  });

  it("createMission attaches creatorId", async () => {
    await service.createMission({ title: "Clean Beach" } as any, 7);
    expect(repository.create).toHaveBeenCalledWith({
      title: "Clean Beach",
      id_creator: 7,
    });
  });

  it("getMissionById throws 404 when missing", async () => {
    repository.findById.mockResolvedValueOnce(null);
    await expect(service.getMissionById(99)).rejects.toThrow("Mission not found");
  });

  it("getMissionById returns mission when present", async () => {
    const mission = { id_mission: 12, title: "Present" } as any;
    repository.findById.mockResolvedValueOnce(mission);

    const result = await service.getMissionById(12);
    expect(result).toBe(mission);
  });

  it("updateMission validates existence and delegates", async () => {
    repository.findById.mockResolvedValueOnce({ id_mission: 3 } as any);
    await service.updateMission(3, { title: "New" });

    expect(repository.findById).toHaveBeenCalledWith(3);
    expect(repository.update).toHaveBeenCalledWith(3, { title: "New" });
  });

  it("deleteMission validates existence and delegates", async () => {
    repository.findById.mockResolvedValueOnce({ id_mission: 3 } as any);
    await service.deleteMission(3);

    expect(repository.findById).toHaveBeenCalledWith(3);
    expect(repository.delete).toHaveBeenCalledWith(3);
  });
});
