import { NextFunction, Response } from "express";
import { AuthenticatedRequest, CreateMissionDTO } from "../types/index.js";
import { ResponseUtil } from "../utils/response.js";
import { MissionService } from "../services/mission.service.js";
import {
  removeUndefinedFields,
  parseId,
  buildFilePath,
} from "../utils/helpers.js";
import { recordAudit } from "../utils/audit.js";

export class MissionController {
  private service: MissionService;

  constructor() {
    this.service = new MissionService();
  }

  public createMission = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CreateMissionDTO = {
        title: req.body.title,
        tags: req.body.tags,
        desc: req.body.desc || req.body.description,
        photo_caption: req.body.photoCaption,
        author_name: req.body.authorName,
        author_role: req.body.authorRole,
        points: req.body.points ? parseInt(req.body.points) : undefined,
        highlights: req.body.highlights,
        cover_image: req.file ? buildFilePath(req.file.filename) : undefined,
      };

      const mission = await this.service.createMission(data, req.user.sub);
      ResponseUtil.created(res, "Mission created successfully", mission);
    } catch (err) {
      next(err);
    }
  };

  public getAllMissions = async (
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const missions = await this.service.getAllMissions();
      ResponseUtil.success(res, "Missions retrieved successfully", missions);
    } catch (err) {
      next(err);
    }
  };

  public getMissionById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      const mission = await this.service.getMissionById(id);
      ResponseUtil.success(res, "Mission retrieved successfully", mission);
    } catch (err) {
      next(err);
    }
  };

  public updateMission = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      const data = removeUndefinedFields<Partial<CreateMissionDTO>>({
        title: req.body.title,
        tags: req.body.tags,
        desc: req.body.desc || req.body.description,
        photo_caption: req.body.photoCaption,
        author_name: req.body.authorName,
        author_role: req.body.authorRole,
        points: req.body.points ? parseInt(req.body.points) : undefined,
        highlights: req.body.highlights,
        cover_image: req.file ? buildFilePath(req.file.filename) : undefined,
      });

      const mission = await this.service.updateMission(id, data);
      ResponseUtil.success(res, "Mission updated successfully", mission);
    } catch (err) {
      next(err);
    }
  };

  public deleteMission = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      await this.service.deleteMission(id);
      await recordAudit(req, "mission.delete", "mission", id);
      ResponseUtil.success(res, "Mission deleted successfully", null);
    } catch (err) {
      next(err);
    }
  };
}
