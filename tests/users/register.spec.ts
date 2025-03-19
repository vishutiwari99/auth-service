import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });
  describe("Given all fields", () => {
    it("should return 201 status code", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(201);
      // Assert
    });

    it("should return valid json response", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.headers["content-type"]).toBe(
        "application/json; charset=utf-8",
      );
    });
    it("should persist user data in the database", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };

      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users.length).toBe(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });

    it("should return a id in the response body", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };

      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].id).not.toBeUndefined();
    });

    it("should assign a customer role", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };

      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });
  });
  describe("Fields are missing", () => {
    // it("should register a new user", () => {});
  });
});
