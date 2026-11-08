import { recordAudit } from "../../src/utils/audit.js";
import { AuditService } from "../../src/services/audit.service.js";

describe("audit context util", () => {
  it("recordAudit captures actor, ip, and user agent from request", async () => {
    const recordSpy = jest
      .spyOn(AuditService.prototype, "record")
      .mockResolvedValue(undefined);

    const req: any = {
      user: { sub: 5, role: "user" },
      ip: "192.168.1.1",
      socket: { remoteAddress: "192.168.1.1" },
      get: jest.fn().mockReturnValue("Mozilla/5.0"),
    };

    await recordAudit(req, "auth.login", "user", 5, { meta: true });

    expect(recordSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_type: "user",
        actor_id: 5,
        action: "auth.login",
        entity: "user",
        entity_id: 5,
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        metadata: { meta: true },
      })
    );

    recordSpy.mockRestore();
  });
});
