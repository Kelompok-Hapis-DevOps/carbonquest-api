import {
  authMiddleware,
  generateToken,
} from "../../src/middleware/auth.middleware.js";

describe("auth.middleware", () => {
  it("generateToken creates a verifiable JWT token string", () => {
    const token = generateToken({ sub: 1, role: "user" });
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("authMiddleware rejects missing authorization header with 401", () => {
    const req: any = { headers: {} };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const middleware = authMiddleware();
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("authMiddleware rejects invalid token format with 401", () => {
    const req: any = { headers: { authorization: "Bearer invalid.token.value" } };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authMiddleware()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("authMiddleware populates req.user and calls next on valid token", () => {
    const token = generateToken({ sub: 42, role: "user" });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authMiddleware()(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.sub).toBe(42);
    expect(req.user.role).toBe("user");
  });

  it("authMiddleware enforces requiredRole and returns 403 on role mismatch", () => {
    const userToken = generateToken({ sub: 10, role: "user" });
    const req: any = { headers: { authorization: `Bearer ${userToken}` } };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authMiddleware("org")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
