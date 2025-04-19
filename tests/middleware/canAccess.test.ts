import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

// Simulated version of your AuthRequest type
interface AuthRequest extends Request {
  auth?: {
    role?: string;
  };
}

// The middleware under test
const canAccess = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as AuthRequest;
    const roleFromToken = _req.auth?.role;
    if (!roles.includes(roleFromToken ?? "")) {
      const error = createHttpError(
        403,
        "You are not authorized to access this resource",
      );
      next(error);
      return;
    }
    next();
  };
};

describe("canAccess middleware", () => {
  let next: jest.Mock;
  let res: Response;

  beforeEach(() => {
    next = jest.fn();
    res = {} as Response;
  });

  it("should call next() with no error if role is allowed", () => {
    const req = {
      auth: { role: "admin" },
    } as AuthRequest;

    const middleware = canAccess(["admin", "editor"]);
    middleware(req as Request, res, next);

    expect(next).toHaveBeenCalledWith(); // no error
  });

  it("should call next() with 403 error if role is not allowed", () => {
    const req = {
      auth: { role: "viewer" },
    } as AuthRequest;

    const middleware = canAccess(["admin", "editor"]);
    middleware(req as Request, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: "You are not authorized to access this resource",
      }),
    );
  });

  it("should return 403 if auth is missing", () => {
    const req = {} as AuthRequest;

    const middleware = canAccess(["admin"]);
    middleware(req as Request, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: "You are not authorized to access this resource",
      }),
    );
  });

  it("should return 403 if role is missing", () => {
    const req = {
      auth: {},
    } as AuthRequest;

    const middleware = canAccess(["admin"]);
    middleware(req as Request, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: "You are not authorized to access this resource",
      }),
    );
  });
});
