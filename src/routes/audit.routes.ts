import { RequestHandler, Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { AuditController } from "../controllers/audit.controller.js";

const router = Router();
const controller = new AuditController();

/**
 * @openapi
 * /audit-logs:
 *   get:
 *     tags:
 *       - Audit
 *     summary: List audit logs
 *     description: Organization-only endpoint returning recent security-relevant events
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 200
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by exact action name, e.g. auth.login.failed
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - organization role required
 */
router.get(
  "/",
  authMiddleware("org"),
  controller.listLogs as unknown as RequestHandler
);

export default router;
