import request from "supertest";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { createJWKSMock } from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";
describe("POST /auth/self", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all required fields are provided", () => {
    it("should return status code 200 ", async () => {
      const accessToken = jwks.token({ sub: "1", role: Roles.CUSTOMER });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();
      expect(response.statusCode).toBe(200);
    });
    it("should return the user data  ", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      //   generate token
      const accessToken = jwks.token({ sub: String(data.id), role: data.role });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      expect((response.body as Record<string, string>).id).toBe(data.id);
    });
    it("should not return the password  ", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      //   generate token
      const accessToken = jwks.token({ sub: String(data.id), role: data.role });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      expect(response.body as Record<string, string>).not.toHaveProperty(
        "password",
      );
    });
    it("should  return 401 if token doesn't exist   ", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      //   generate token

      const response = await request(app).get("/auth/self").send();

      expect(response.statusCode).toBe(401);
    });
  });
  describe("Missing Fields", () => {
    it("should return status code 400 and error message", async () => {
      const loginData = {
        email: "johndoe@example.com",
      };

      const response = await request(app).post("/auth/login").send(loginData);
      expect(response.statusCode).toBe(400);
      expect(
        (response.body as { errors: { msg: string }[] }).errors[0].msg,
      ).toBe("Password is required");
    });

    it("should return status code 400 and error message", async () => {
      const loginData = {
        password: "password123",
      };

      const response = await request(app).post("/auth/login").send(loginData);
      expect(response.statusCode).toBe(400);
      expect(
        (response.body as { errors: { msg: string }[] }).errors[0].msg,
      ).toBe("Email is required");
    });
  });
});
