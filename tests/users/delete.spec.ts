import request from "supertest";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { createJWKSMock } from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";
describe("DELETE /users/id", () => {
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
    it("should return delete user from database ", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };
      const adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });

      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: Roles.ADMIN,
      });
      //   generate token

      const response = await request(app)
        .delete("/users/1")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(204);
    });

    it("should return 401 if token is not provided", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };
      // const adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });

      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: Roles.ADMIN,
      });
      //   generate token

      const response = await request(app)
        .delete("/users/1")
        //   .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 if user is not admin", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };
      const managerToken = jwks.token({ sub: "1", role: Roles.MANAGER });

      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: Roles.ADMIN,
      });
      //   generate token

      const response = await request(app)
        .delete("/users/1")
        .set("Cookie", [`accessToken=${managerToken};`])
        .send();
      expect(response.statusCode).toBe(403);
    });
  });

  describe("Missing fields", () => {
    it("should return 404 if user does not exist", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      };
      const adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });

      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: Roles.ADMIN,
      });
      //   generate token

      const response = await request(app)
        .delete("/users/2")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.statusCode).toBe(404);
    });
  });
});
