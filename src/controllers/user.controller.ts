import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/index.js";
import { ResponseUtil } from "../utils/response.js";
import { UserService } from "../services/user.service.js";
import { parseId, buildFilePath } from "../utils/helpers.js";
import { AppError } from "../middleware/error.middleware.js";
import { recordAudit } from "../utils/audit.js";

export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  public getAllUsers = async (
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const users = await this.service.getAllUsers();
      ResponseUtil.success(res, "Users retrieved successfully", users);
    } catch (err) {
      next(err);
    }
  };

  public getLeaderboard = async (
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const leaderboard = await this.service.getLeaderboard();
      ResponseUtil.success(res, "Leaderboard retrieved successfully", leaderboard);
    } catch (err) {
      next(err);
    }
  };

  public getUserById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      const user = await this.service.getUserById(id);
      ResponseUtil.success(res, "User retrieved successfully", user);
    } catch (err) {
      next(err);
    }
  };

  public updatePassword = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { oldPassword, newPassword } = req.body;
      await this.service.updatePassword(req.user.sub, oldPassword, newPassword);
      ResponseUtil.success(res, "Password updated successfully", null);
    } catch (err) {
      next(err);
    }
  };

  public updateUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      this.validateOwnership(req.user.sub, id, "update your own profile");

      const user = await this.service.updateUser(id, req.body);
      ResponseUtil.success(res, "User updated successfully", user);
    } catch (err) {
      next(err);
    }
  };

  public deleteUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);

      if (req.user.role === "user") {
        this.validateOwnership(req.user.sub, id, "delete your own account");
      }

      await this.service.deleteUser(id);
      await recordAudit(req, "user.delete", "user", id);
      ResponseUtil.success(res, "User deleted successfully", null);
    } catch (err) {
      next(err);
    }
  };

  public uploadProfileImage = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      this.validateOwnership(req.user.sub, id, "update your own profile image");

      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      const profileImage = buildFilePath(req.file.filename);
      const user = await this.service.updateProfileImage(id, profileImage);
      ResponseUtil.success(res, "Profile image uploaded successfully", user);
    } catch (err) {
      next(err);
    }
  };

  private validateOwnership(userId: number, targetId: number, action: string): void {
    if (userId !== targetId) {
      throw new AppError(`You can only ${action}`, 403);
    }
  }
}
