import { RequestHandler, Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { BadgeController } from "../controllers/badge.controller.js";

const controller = new BadgeController();

/**
 * @openapi
 * /badges:
 *   get:
 *     tags:
 *       - Badges
 *     summary: Get badge catalog
 *     description: Retrieve every badge that can be earned in the gamification system
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Badge catalog retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const badgeRoutes = Router().get(
  "/",
  authMiddleware(),
  controller.getCatalog as unknown as RequestHandler
);

/**
 * @openapi
 * /me/badges:
 *   get:
 *     tags:
 *       - Badges
 *     summary: Get current user badges and progress
 *     description: Returns earned badges, progress toward every badge, and the three closest badges
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User badges retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user role required
 */
export const userBadgeRoutes = Router().get(
  "/badges",
  authMiddleware("user"),
  controller.getUserBadges as unknown as RequestHandler
);
