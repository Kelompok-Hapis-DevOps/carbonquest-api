import { ResponseUtil } from "../../src/utils/response.js";

describe("ResponseUtil", () => {
  let res: any;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("success returns 200 with data", () => {
    ResponseUtil.success(res, "OK", { val: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "OK",
      data: { val: 1 },
    });
  });

  it("created returns 201", () => {
    ResponseUtil.created(res, "Created", { id: 10 });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("badRequest returns 400", () => {
    ResponseUtil.badRequest(res, "Bad", "Details");
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("unauthorized returns 401", () => {
    ResponseUtil.unauthorized(res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("forbidden returns 403", () => {
    ResponseUtil.forbidden(res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("notFound returns 404", () => {
    ResponseUtil.notFound(res, "Not Found", "Missing id");
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("error returns custom status code", () => {
    ResponseUtil.error(res, "Boom", "Stack", 503);
    expect(res.status).toHaveBeenCalledWith(503);
  });
});
