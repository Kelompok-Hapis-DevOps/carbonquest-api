import {
  AuditLogFilter,
  AuditRepository,
  CreateAuditLogDTO,
} from "../repositories/audit.repository.js";

export class AuditService {
  private repository: AuditRepository;

  constructor(repository: AuditRepository = new AuditRepository()) {
    this.repository = repository;
  }

  async record(entry: CreateAuditLogDTO): Promise<void> {
    try {
      await this.repository.create(entry);
    } catch (err) {
      // Auditing must never break the request it is recording.
      console.error("Failed to write audit log:", err);
    }
  }

  async list(filter: AuditLogFilter = {}) {
    return await this.repository.findAll(filter);
  }
}
