import { CreateUserMissionDTO, UpdateUserMissionDTO } from "../types/index.js";
import { UserMissionRepository } from "../repositories/user-mission.repository.js";
import { BadgeService } from "./badge.service.js";

interface MissionUpdateData {
  status?: string;
  points?: number;
  completed_time?: Date;
}

export class UserMissionService {
  private repository: UserMissionRepository;
  private badgeService: BadgeService;

  constructor(
    repository: UserMissionRepository = new UserMissionRepository(),
    badgeService: BadgeService = new BadgeService()
  ) {
    this.repository = repository;
    this.badgeService = badgeService;
  }

  async startMission(data: CreateUserMissionDTO, userId: number) {
    return await this.repository.create({ ...data, id_user: userId });
  }

  async updateMission(id: number, data: UpdateUserMissionDTO) {
    const updateData: MissionUpdateData = {
      status: data.status,
      points: data.points,
      completed_time: data.completed_time ? new Date(data.completed_time) : undefined,
    };

    const updated = await this.repository.update(id, updateData);

    if (updated.status === "completed" || updated.completed_time) {
      await this.badgeService.evaluateAndAward(updated.id_user);
    }

    return updated;
  }

  async getUserMissions(userId: number) {
    return await this.repository.findByUserId(userId);
  }
}
