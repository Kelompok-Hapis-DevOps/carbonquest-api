import { CreateMissionDTO } from "../types/index.js";
import { MissionRepository } from "../repositories/mission.repository.js";
import { AppError } from "../middleware/error.middleware.js";

export class MissionService {
  private repository: MissionRepository;

  constructor(repository: MissionRepository = new MissionRepository()) {
    this.repository = repository;
  }

  async getAllMissions() {
    return await this.repository.findAll();
  }

  async createMission(data: CreateMissionDTO, creatorId: number) {
    return await this.repository.create({ ...data, id_creator: creatorId });
  }

  async getMissionById(id: number) {
    const mission = await this.repository.findById(id);
    if (!mission) {
      throw new AppError("Mission not found", 404);
    }
    return mission;
  }

  async updateMission(id: number, data: Partial<CreateMissionDTO>) {
    await this.getMissionById(id);
    return await this.repository.update(id, data);
  }

  async deleteMission(id: number) {
    await this.getMissionById(id);
    await this.repository.delete(id);
  }
}
