import { OrganizationService } from "../../src/services/organization.service.js";
import { OrganizationRepository } from "../../src/repositories/organization.repository.js";
import { AppError } from "../../src/middleware/error.middleware.js";
import bcrypt from "bcryptjs";

describe("OrganizationService", () => {
  let repository: jest.Mocked<OrganizationRepository>;
  let service: OrganizationService;

  beforeEach(() => {
    repository = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({} as any),
      update: jest.fn().mockResolvedValue({} as any),
      updatePassword: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<OrganizationRepository>;

    service = new OrganizationService(repository);
  });

  it("getAllOrganizations excludes password from returned list", async () => {
    repository.findAll.mockResolvedValueOnce([
      { id_organisasi: 1, name: "Green", email: "g@g.com", password: "secret" },
    ]);

    const result = await service.getAllOrganizations();
    expect(result).toEqual([
      { id_organisasi: 1, name: "Green", email: "g@g.com" },
    ]);
  });

  it("updatePassword throws 404 when org does not exist", async () => {
    repository.findById.mockResolvedValueOnce(null);
    await expect(
      service.updatePassword(1, "old", "newPassword123")
    ).rejects.toThrow(AppError);
  });

  it("updatePassword throws 500 when org has no password in DB", async () => {
    repository.findById.mockResolvedValueOnce({
      id_organisasi: 1,
      password: null,
    } as any);
    await expect(
      service.updatePassword(1, "old", "newPassword123")
    ).rejects.toThrow("Invalid organization data");
  });

  it("updatePassword throws 400 when old password does not match", async () => {
    const hashed = await bcrypt.hash("correct-pass", 10);
    repository.findById.mockResolvedValueOnce({
      id_organisasi: 1,
      password: hashed,
    } as any);

    await expect(
      service.updatePassword(1, "wrong-pass", "newPassword123")
    ).rejects.toThrow("Invalid old password");
  });

  it("updatePassword hashes new password and updates DB when old password matches", async () => {
    const hashed = await bcrypt.hash("correct-pass", 10);
    repository.findById.mockResolvedValueOnce({
      id_organisasi: 1,
      password: hashed,
    } as any);

    await service.updatePassword(1, "correct-pass", "newSecretPass123");

    expect(repository.updatePassword).toHaveBeenCalledTimes(1);
    expect(repository.updatePassword).toHaveBeenCalledWith(
      1,
      expect.any(String)
    );
  });
});
