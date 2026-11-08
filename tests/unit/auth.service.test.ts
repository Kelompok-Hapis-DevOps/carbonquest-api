import { AuthService } from "../../src/services/auth.service.js";
import { UserRepository } from "../../src/repositories/user.repository.js";
import { OrganizationRepository } from "../../src/repositories/organization.repository.js";
import bcrypt from "bcryptjs";

describe("AuthService", () => {
  let userRepo: jest.Mocked<UserRepository>;
  let orgRepo: jest.Mocked<OrganizationRepository>;
  let service: AuthService;

  beforeEach(() => {
    userRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id_user: 1, name: "U", email: "u@u.com" } as any),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
      delete: jest.fn(),
      getLeaderboard: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    orgRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id_organisasi: 2, name: "O", email: "o@o.com" } as any),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
    } as unknown as jest.Mocked<OrganizationRepository>;

    service = new AuthService(userRepo, orgRepo);
  });

  describe("registerUser", () => {
    it("validates required fields", async () => {
      await expect(
        service.registerUser({ name: "", email: "a@b.com", password: "123" })
      ).rejects.toThrow("Name, email, and password are required");
    });

    it("throws 400 when user email already exists", async () => {
      userRepo.findByEmail.mockResolvedValueOnce({ id_user: 1 } as any);
      await expect(
        service.registerUser({ name: "Bob", email: "dup@b.com", password: "123" })
      ).rejects.toThrow("Email already exists");
    });

    it("hashes password, creates user, and returns JWT token", async () => {
      userRepo.create.mockResolvedValueOnce({
        id_user: 99,
        name: "Bob",
        email: "bob@b.com",
        password: "hashed",
      } as any);

      const result = await service.registerUser({
        name: "Bob",
        email: "bob@b.com",
        password: "secretPassword123!",
      });

      expect(result.user).toEqual({ id_user: 99, name: "Bob", email: "bob@b.com" });
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");
    });
  });

  describe("loginUser", () => {
    it("throws 400 on empty credentials", async () => {
      await expect(
        service.loginUser({ email: "", password: "123" })
      ).rejects.toThrow("Email and password are required");
    });

    it("throws 401 when user is not found", async () => {
      userRepo.findByEmail.mockResolvedValueOnce(null);
      await expect(
        service.loginUser({ email: "missing@b.com", password: "123" })
      ).rejects.toThrow("Invalid email or password");
    });

    it("throws 401 on incorrect password", async () => {
      const hashed = await bcrypt.hash("correct", 10);
      userRepo.findByEmail.mockResolvedValueOnce({
        id_user: 1,
        email: "u@u.com",
        password: hashed,
      } as any);

      await expect(
        service.loginUser({ email: "u@u.com", password: "wrong" })
      ).rejects.toThrow("Invalid email or password");
    });

    it("returns user and token on successful password match", async () => {
      const hashed = await bcrypt.hash("correct", 10);
      userRepo.findByEmail.mockResolvedValueOnce({
        id_user: 1,
        name: "User",
        email: "u@u.com",
        password: hashed,
      } as any);

      const result = await service.loginUser({ email: "u@u.com", password: "correct" });
      expect(result.user.email).toBe("u@u.com");
      expect(result.token).toBeTruthy();
    });
  });

  describe("registerOrganization", () => {
    it("throws 400 on existing organization email", async () => {
      orgRepo.findByEmail.mockResolvedValueOnce({ id_organisasi: 1 } as any);
      await expect(
        service.registerOrganization({ name: "Org", email: "org@o.com", password: "123" })
      ).rejects.toThrow("Email already exists");
    });

    it("creates org and issues org-scoped JWT token", async () => {
      orgRepo.create.mockResolvedValueOnce({
        id_organisasi: 50,
        name: "Green Org",
        email: "green@o.com",
        password: "hashed",
      } as any);

      const result = await service.registerOrganization({
        name: "Green Org",
        email: "green@o.com",
        password: "secretPassword123!",
      });

      expect(result.org).toEqual({ id_organisasi: 50, name: "Green Org", email: "green@o.com" });
      expect(result.token).toBeDefined();
    });
  });

  describe("loginOrganization", () => {
    it("rejects invalid org password with 401", async () => {
      const hashed = await bcrypt.hash("orgSecret", 10);
      orgRepo.findByEmail.mockResolvedValueOnce({
        id_organisasi: 2,
        email: "o@o.com",
        password: hashed,
      } as any);

      await expect(
        service.loginOrganization({ email: "o@o.com", password: "bad" })
      ).rejects.toThrow("Invalid email or password");
    });

    it("authenticates organization on valid password", async () => {
      const hashed = await bcrypt.hash("orgSecret", 10);
      orgRepo.findByEmail.mockResolvedValueOnce({
        id_organisasi: 2,
        name: "Clean Org",
        email: "o@o.com",
        password: hashed,
      } as any);

      const result = await service.loginOrganization({ email: "o@o.com", password: "orgSecret" });
      expect(result.org.email).toBe("o@o.com");
      expect(result.token).toBeTruthy();
    });
  });
});
