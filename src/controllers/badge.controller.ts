import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/index.js";
import { ResponseUtil } from "../utils/response.js";
import { BadgeService } from "../services/badge.service.js";

export class BadgeController {
  private service: BadgeService;

  constructor() {
    this.service = new BadgeService();
  }

  public getCatalog = async (
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const badges = await this.service.getCatalog();
      ResponseUtil.success(res, "Badges retrieved successfully", badges);
    } catch (err) {
      next(err);
    }
  };

  public getUserBadges = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const badges = await this.service.getUserBadges(req.user.sub);
      ResponseUtil.success(res, "User badges retrieved successfully", badges);
    } catch (err) {
      next(err);
    }
  };
}
