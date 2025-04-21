import request from "supertest";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Roles } from "../../src/contants";
import { User } from "../../src/entity/User";
import bcrypt from "bcryptjs";

describe("POST /users/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("password123", saltRounds);
    const userData = {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: hashedPassword,
      role: Roles.CUSTOMER,
      tenantId: 1,
    };

    const userRepository = connection.getRepository(User);
    await userRepository.save(userData);
    // Act
  }, 10000);

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all required fields are provided", () => {
    it("should return status code 200 and access token", async () => {
      const loginData = {
        email: "johndoe@example.com",
        password: "password123",
      };

      const response = await request(app).post("/auth/login").send(loginData);
      expect(response.statusCode).toBe(200);
      expect(response.headers["set-cookie"]).not.toBeUndefined();
      expect(response.headers["content-type"]).toBe(
        "application/json; charset=utf-8",
      );
    });

    it("should return status code 401 and error message", async () => {
      const loginData = {
        email: "johndoe@example.com",
        password: "password",
      };

      const response = await request(app).post("/auth/login").send(loginData);
      expect(response.statusCode).toBe(401);
      expect(
        (response.body as { errors: { msg: string }[] }).errors[0].msg,
      ).toBe("Invalid email or password");
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
