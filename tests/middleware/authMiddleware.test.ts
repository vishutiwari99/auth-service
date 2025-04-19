import request from "supertest";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

// Mocked config
jest.mock("../../src/config/index", () => ({
  Config: {
    JWKS_URI: "https://mocked-jwks-uri.com",
  },
}));

// Mocked jwksClient to bypass real network calls
jest.mock("jwks-rsa", () => ({
  expressJwtSecret:
    () => (req: Request, header: any, payload: any, cb: any) => {
      cb(null, "mocked-public-key");
    },
}));

describe("JWT Middleware", () => {
  const app = express();
  app.use(cookieParser());
  app.get("/protected", (req: Request, res: Response) => {
    res.status(200).json({ message: "Authorized" });
  });

  const validToken = jwt.sign({ user: "test" }, "mocked-public-key", {
    algorithm: "HS256", // Use RS256 to match the middleware config in prod
    expiresIn: "1h",
  });

  it("should authorize using Authorization header", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${validToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Authorized");
  });

  it("should authorize using accessToken cookie", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Cookie", [`accessToken=${validToken}`]);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Authorized");
  });
});
