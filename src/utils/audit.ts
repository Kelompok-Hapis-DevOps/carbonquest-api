import { Request } from "express";
import { AuthenticatedRequest } from "../types/index.js";
import { AuditService } from "../services/audit.service.js";

const auditService = new AuditService();

export async function recordAudit(
  req: Request,
  action: string,
  entity?: string,
  entityId?: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  const user = (req as AuthenticatedRequest).user;

  await auditService.record({
    actor_type: user ? user.role : "anonymous",
    actor_id: user?.sub ?? null,
    action,
    entity: entity ?? null,
    entity_id: entityId ?? null,
    ip_address: req.ip ?? req.socket.remoteAddress ?? null,
    user_agent: req.get("user-agent") ?? null,
    metadata: metadata ?? null,
  });
}
