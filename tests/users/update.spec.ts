import request from "supertest";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { createJWKSMock } from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";
describe("PATCH /users/:id", () => {
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
    it("should update the user and return 200", async () => {
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

      const updatedUserData = {
        firstName: "Vaibhav",
        lastName: "Tiwari",
        email: "johndoe@example.com",
        password: "password123",
        role: Roles.ADMIN,
      };
      //   generate token

      const response = await request(app)
        .patch("/users/1")
        .set("Cookie", [`accessToken=${adminToken};`])
        .send(updatedUserData);
      const updatedUser = await userRepository.find();
      expect(updatedUser[0].firstName).toBe(updatedUserData.firstName);
      expect(response.statusCode).toBe(200);
    });
  });
});
