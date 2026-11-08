import { UserService } from "../../src/services/user.service.js";
import { UserRepository } from "../../src/repositories/user.repository.js";
import bcrypt from "bcryptjs";

describe("UserService", () => {
  let repository: jest.Mocked<UserRepository>;
  let service: UserService;

  beforeEach(() => {
    repository = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({} as any),
      update: jest.fn().mockResolvedValue({} as any),
      updatePassword: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      getLeaderboard: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<UserRepository>;

    service = new UserService(repository);
  });

  it("getAllUsers returns all users", async () => {
    const list = [{ id_user: 1, name: "Alice" }] as any;
    repository.findAll.mockResolvedValueOnce(list);

    const result = await service.getAllUsers();
    expect(result).toBe(list);
  });

  it("getUserById throws 404 if missing", async () => {
    repository.findById.mockResolvedValueOnce(null);
    await expect(service.getUserById(42)).rejects.toThrow("User not found");
  });

  it("getUserById strips password if present", async () => {
    repository.findById.mockResolvedValueOnce({
      id_user: 42,
      name: "Alice",
      password: "secret",
    } as any);

    const result = await service.getUserById(42);
    expect(result).toEqual({ id_user: 42, name: "Alice" });
  });

  it("getLeaderboard delegates to repository", async () => {
    const lb = [{ id_user: 1, total_points: 100 }] as any;
    repository.getLeaderboard.mockResolvedValueOnce(lb);

    expect(await service.getLeaderboard()).toBe(lb);
  });

  it("updatePassword validates old password and hashes new password", async () => {
    const hashed = await bcrypt.hash("current", 10);
    repository.findById.mockResolvedValueOnce({
      id_user: 1,
      password: hashed,
    } as any);

    await service.updatePassword(1, "current", "nextSecret123");
    expect(repository.updatePassword).toHaveBeenCalledWith(1, expect.any(String));
  });

  it("updatePassword rejects incorrect old password", async () => {
    const hashed = await bcrypt.hash("current", 10);
    repository.findById.mockResolvedValueOnce({
      id_user: 1,
      password: hashed,
    } as any);

    await expect(
      service.updatePassword(1, "wrong", "nextSecret123")
    ).rejects.toThrow("Invalid old password");
  });

  it("updateUser validates existence and excludes password", async () => {
    repository.findById.mockResolvedValueOnce({ id_user: 1 } as any);
    repository.update.mockResolvedValueOnce({
      id_user: 1,
      name: "New Name",
      password: "hashed",
    } as any);

    const result = await service.updateUser(1, { name: "New Name" });
    expect(result).toEqual({ id_user: 1, name: "New Name" });
  });

  it("deleteUser validates existence before deleting", async () => {
    repository.findById.mockResolvedValueOnce({ id_user: 1 } as any);
    await service.deleteUser(1);
    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it("updateProfileImage updates avatar and excludes password", async () => {
    repository.findById.mockResolvedValueOnce({ id_user: 1 } as any);
    repository.update.mockResolvedValueOnce({
      id_user: 1,
      profile_image: "/files/avatar.png",
      password: "pass",
    } as any);

    const result = await service.updateProfileImage(1, "/files/avatar.png");
    expect(result).toEqual({ id_user: 1, profile_image: "/files/avatar.png" });
  });
});
