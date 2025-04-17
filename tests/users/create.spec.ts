import request from "supertest";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { createJWKSMock } from "mock-jwks";
import { Roles } from "../../src/contants";
import { User } from "../../src/entity/User";
import { Tenant } from "../../src/entity/Tenant";
import { createTenant } from "../utils";
describe("POST /users", () => {
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
    it("should persist the user and return a 201 status code", async () => {
      const adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      //   generate token

      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });
    it("should create a manager user", async () => {
      const adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });

      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
        tenantId: 1,
        role: Roles.MANAGER,
      };

      //   generate token

      const response = await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);
      expect(response.status).toBe(201);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.MANAGER);
    });

    it("should return 400 if email is empty or invalid", async () => {
      const adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });

      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoeexamplecom",
        password: "password123",
        tenantId: 1,
      };

      //   generate token

      const response = await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);
      expect(response.status).toBe(400);
    });

    it("should return 403 if non admin tries to create a user", async () => {
      const adminToken = jwks.token({ sub: "1", role: Roles.MANAGER });

      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoeexamplecom",
        password: "password123",
        tenantId: 1,
      };

      //   generate token

      const response = await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);
      expect(response.status).toBe(403);
    });
  });
});
