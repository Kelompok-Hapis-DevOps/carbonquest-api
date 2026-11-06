import { AuditService } from "../../src/services/audit.service.js";
import {
  AuditRepository,
  CreateAuditLogDTO,
} from "../../src/repositories/audit.repository.js";

describe("AuditService", () => {
  let repository: jest.Mocked<AuditRepository>;
  let service: AuditService;

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue({
        rows: [],
        total: 0,
        limit: 50,
        offset: 0,
      }),
    } as unknown as jest.Mocked<AuditRepository>;

    service = new AuditService(repository);
  });

  describe("record", () => {
    it("delegates to repository with provided entry", async () => {
      const entry: CreateAuditLogDTO = {
        actor_type: "user",
        actor_id: 1,
        action: "auth.user.login.success",
        entity: "user",
        entity_id: 1,
        ip_address: "127.0.0.1",
        user_agent: "Jest-Agent",
      };

      await service.record(entry);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(entry);
    });

    it("does not throw when repository.create fails", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      repository.create.mockRejectedValueOnce(new Error("DB is down"));

      await expect(
        service.record({
          actor_type: "anonymous",
          action: "auth.failed",
        })
      ).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("list", () => {
    it("passes filter through to repository.findAll", async () => {
      const mockResult = {
        rows: [
          {
            id_log: 1,
            actor_type: "user",
            actor_id: 2,
            action: "user.delete",
            entity: "user",
            entity_id: 5,
            ip_address: "127.0.0.1",
            user_agent: null,
            metadata: null,
            created_at: new Date(),
          },
        ],
        total: 1,
        limit: 10,
        offset: 0,
      };

      repository.findAll.mockResolvedValueOnce(mockResult);

      const result = await service.list({ limit: 10, offset: 0 });

      expect(repository.findAll).toHaveBeenCalledWith({ limit: 10, offset: 0 });
      expect(result).toEqual(mockResult);
    });
  });
});
