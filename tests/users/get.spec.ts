import request from "supertest";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { createJWKSMock } from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";
describe("GET /users", () => {
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
    it("should return all users list ", async () => {
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
        role: Roles.MANAGER,
      });
      //   generate token

      const response = await request(app)
        .get("/users")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.body).toHaveLength(1);

      expect(response.statusCode).toBe(200);
    });
    it("should return a single user by Id ", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
        tenantId: 1,
      };
      const userRepository = connection.getRepository(User);
      const adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });

      await userRepository.save({
        ...userData,
        role: Roles.MANAGER,
      });
      //   generate token

      const response = await request(app)
        .get("/users/1")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send();
      expect(response.body).not.toBeNull();

      expect(response.statusCode).toBe(200);
    });
  });
});
