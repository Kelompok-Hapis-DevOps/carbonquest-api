import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env.js";
import { AuthenticatedRequest, JwtPayload } from "../types/index.js";
import { ResponseUtil } from "../utils/response.js";

export const authMiddleware = (
  requiredRole?: "user" | "org"
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      ResponseUtil.unauthorized(res, "Unauthorized");
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, getJwtSecret()) as unknown as JwtPayload;
      (req as AuthenticatedRequest).user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        ResponseUtil.forbidden(res, "Forbidden");
        return;
      }

      next();
    } catch (err) {
      ResponseUtil.unauthorized(res, "Invalid token");
      return;
    }
  };
};

export const generateToken = (
  payload: Omit<JwtPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
};
