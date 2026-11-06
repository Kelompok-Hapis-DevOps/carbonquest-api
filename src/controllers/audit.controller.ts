import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../types/index.js";
import { ResponseUtil } from "../utils/response.js";
import { AuditService } from "../services/audit.service.js";

export class AuditController {
  private service: AuditService;

  constructor() {
    this.service = new AuditService();
  }

  public listLogs = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { limit, offset, action } = this.parseFilter(req);
      const result = await this.service.list({ limit, offset, action });
      ResponseUtil.success(res, "Audit logs retrieved successfully", result);
    } catch (err) {
      next(err);
    }
  };

  private parseFilter(req: Request) {
    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);
    const action =
      typeof req.query.action === "string" ? req.query.action : undefined;

    return {
      limit: Number.isFinite(limit) ? limit : undefined,
      offset: Number.isFinite(offset) ? offset : undefined,
      action,
    };
  }
}
