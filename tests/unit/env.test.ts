import {
  assertRequiredEnv,
  getJwtSecret,
  getPort,
  isProduction,
} from "../../src/config/env.js";

describe("env config", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getJwtSecret", () => {
    it("returns secret when valid and length >= 32", () => {
      process.env.JWT_SECRET = "12345678901234567890123456789012";
      expect(getJwtSecret()).toBe("12345678901234567890123456789012");
    });

    it("throws when JWT_SECRET is missing", () => {
      delete process.env.JWT_SECRET;
      expect(() => getJwtSecret()).toThrow("JWT_SECRET environment variable is required");
    });

    it("throws when JWT_SECRET is empty string", () => {
      process.env.JWT_SECRET = "   ";
      expect(() => getJwtSecret()).toThrow("JWT_SECRET environment variable is required");
    });

    it("throws when JWT_SECRET is shorter than 32 characters", () => {
      process.env.JWT_SECRET = "too-short-secret";
      expect(() => getJwtSecret()).toThrow("must be at least 32 characters");
    });
  });

  describe("getPort", () => {
    it("parses valid port number", () => {
      process.env.PORT = "8080";
      expect(getPort()).toBe(8080);
    });

    it("falls back to 4000 when PORT is missing", () => {
      delete process.env.PORT;
      expect(getPort()).toBe(4000);
    });

    it("falls back to 4000 when PORT is not a valid positive integer", () => {
      process.env.PORT = "not-a-number";
      expect(getPort()).toBe(4000);

      process.env.PORT = "-1";
      expect(getPort()).toBe(4000);
    });
  });

  describe("isProduction", () => {
    it("returns true when NODE_ENV is production", () => {
      process.env.NODE_ENV = "production";
      expect(isProduction()).toBe(true);
    });

    it("returns false for non-production environments", () => {
      process.env.NODE_ENV = "development";
      expect(isProduction()).toBe(false);

      process.env.NODE_ENV = "test";
      expect(isProduction()).toBe(false);
    });
  });

  describe("assertRequiredEnv", () => {
    it("succeeds when requirements are satisfied", () => {
      process.env.JWT_SECRET = "valid-secret-key-that-exceeds-32-chars-long";
      expect(() => assertRequiredEnv()).not.toThrow();
    });
  });
});
