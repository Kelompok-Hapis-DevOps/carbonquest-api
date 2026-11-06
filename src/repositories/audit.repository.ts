import prisma from "../prisma/client.js";
import { Prisma } from "@prisma/client";

export interface CreateAuditLogDTO {
  actor_type: "user" | "org" | "anonymous";
  actor_id?: number | null;
  action: string;
  entity?: string | null;
  entity_id?: number | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AuditLogFilter {
  limit?: number;
  offset?: number;
  action?: string;
}

export class AuditRepository {
  async create(data: CreateAuditLogDTO): Promise<void> {
    await prisma.audit_Logs.create({
      data: {
        actor_type: data.actor_type,
        actor_id: data.actor_id ?? null,
        action: data.action,
        entity: data.entity ?? null,
        entity_id: data.entity_id ?? null,
        ip_address: data.ip_address ?? null,
        user_agent: data.user_agent?.slice(0, 255) ?? null,
        metadata: (data.metadata ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
  }

  async findAll(filter: AuditLogFilter = {}) {
    const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
    const offset = Math.max(filter.offset ?? 0, 0);
    const where = filter.action ? { action: filter.action } : {};

    const [rows, total] = await Promise.all([
      prisma.audit_Logs.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.audit_Logs.count({ where }),
    ]);

    return { rows, total, limit, offset };
  }
}
