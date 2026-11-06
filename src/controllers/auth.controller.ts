import { NextFunction, Request, Response } from "express";
import {
  CreateOrganizationDTO,
  CreateUserDTO,
  LoginDTO,
} from "../types/index.js";
import { ResponseUtil } from "../utils/response.js";
import { AuthService } from "../services/auth.service.js";
import { recordAudit } from "../utils/audit.js";

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  public registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CreateUserDTO = req.body;
      const result = await this.service.registerUser(data);
      await recordAudit(req, "auth.user.register", "user", result.user.id_user);
      ResponseUtil.created(res, "User registered successfully", result);
    } catch (err) {
      next(err);
    }
  };

  public loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: LoginDTO = req.body;
      const result = await this.service.loginUser(data);
      await recordAudit(req, "auth.user.login.success", "user", result.user.id_user);
      ResponseUtil.success(res, "User logged in successfully", result);
    } catch (err) {
      await recordAudit(req, "auth.user.login.failed", "user", undefined, {
        email: typeof req.body?.email === "string" ? req.body.email : undefined,
      });
      next(err);
    }
  };

  public registerOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CreateOrganizationDTO = req.body;
      const result = await this.service.registerOrganization(data);
      await recordAudit(
        req,
        "auth.org.register",
        "org",
        result.org.id_organisasi
      );
      ResponseUtil.created(res, "Organization registered successfully", result);
    } catch (err) {
      next(err);
    }
  };

  public loginOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: LoginDTO = req.body;
      const result = await this.service.loginOrganization(data);
      await recordAudit(
        req,
        "auth.org.login.success",
        "org",
        result.org.id_organisasi
      );
      ResponseUtil.success(res, "Organization logged in successfully", result);
    } catch (err) {
      await recordAudit(req, "auth.org.login.failed", "org", undefined, {
        email: typeof req.body?.email === "string" ? req.body.email : undefined,
      });
      next(err);
    }
  };
}
