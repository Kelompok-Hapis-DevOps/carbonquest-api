import {
  AppError,
  errorHandler,
} from "../../src/middleware/error.middleware.js";

describe("error.middleware", () => {
  it("AppError sets message, statusCode, and operational flag", () => {
    const error = new AppError("Not Found", 404);
    expect(error.message).toBe("Not Found");
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
  });

  it("errorHandler formats AppError into json with custom status code", () => {
    const err = new AppError("Invalid input", 400);
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid input",
        error: "Invalid input",
      })
    );
  });

  it("errorHandler handles unhandled generic error with status 500", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const err = new Error("Unexpected crash");
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Internal server error",
      })
    );

    consoleErrorSpy.mockRestore();
  });
});
