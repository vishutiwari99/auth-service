import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/contants";
import { isJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

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
        role: Roles.CUSTOMER,
        tenantId: 1,
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
        role: Roles.CUSTOMER,
        tenantId: 1,
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
        role: Roles.CUSTOMER,
        tenantId: 1,
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
        role: Roles.CUSTOMER,
        tenantId: 1,
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
        role: Roles.CUSTOMER,
        tenantId: 1,
      };

      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });
    it("should store hashed password in the database", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
        role: Roles.CUSTOMER,
        tenantId: 1,
      };

      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find({ select: ["password"] });
      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });

    it("should return 400 status code if email is already registered", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
        role: Roles.CUSTOMER,
        tenantId: 1,
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(400);
    });

    it("should return a accesstoken and refresh token inside the cookie", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
        role: Roles.CUSTOMER,
        tenantId: 1,
      };
      // Act

      const response = await request(app).post("/auth/register").send(userData);
      interface Headers {
        ["set-cookie"]: string[] | string;
      }
      const rawCookies =
        (response.headers["set-cookie"] as Headers["set-cookie"]) || [];
      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];

      let accessToken = null;
      let refreshToken = null;
      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }
        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });
      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();
      expect(isJWT(accessToken)).toBeTruthy();
      expect(isJWT(refreshToken)).toBeTruthy();
    });

    it("should store the refresh token in the database", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
        role: Roles.CUSTOMER,
        tenantId: 1,
      };
      // Act

      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      const refreshTokenRepo = connection.getRepository(RefreshToken);
      const tokens = await refreshTokenRepo
        .createQueryBuilder("refreshToken")
        .where("refreshToken.userId = :userId", {
          userId: (response.body as Record<string, string>).id,
        })
        .getMany();
      expect(tokens).toHaveLength(1);
    });
    describe("Fields are missing", () => {
      it('should return "400 Bad Request" if "email" is missing', async () => {
        const userData = {
          firstName: "John",
          lastName: "Doe",
          email: "",
          password: "password123",
          role: Roles.CUSTOMER,
          tenantId: 1,
        };
        const response = await request(app)
          .post("/auth/register")
          .send(userData);
        expect(response.statusCode).toBe(400);
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();
        expect(users).toHaveLength(0);
      });
      it("Should return 400 status code if firstName is missing.", async () => {
        const userData = {
          firstName: "",
          lastName: "Doe",
          email: "johndoe@example.com",
          password: "password123",
          role: Roles.CUSTOMER,
          tenantId: 1,
        };
        const response = await request(app)
          .post("/auth/register")
          .send(userData);
        expect(response.statusCode).toBe(400);
      });
      it("Should return 400 status code if lastName is missing.", async () => {
        const userData = {
          firstName: "John",
          lastName: "",
          email: "johndoe@example.com",
          password: "password123",
          role: Roles.CUSTOMER,
          tenantId: 1,
        };
        const response = await request(app)
          .post("/auth/register")
          .send(userData);
        expect(response.statusCode).toBe(400);
      });
      it("Should return 400 status code if password is missing.", async () => {
        const userData = {
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@example.com",
          password: "",
          role: Roles.CUSTOMER,
          tenantId: 1,
        };
        const response = await request(app)
          .post("/auth/register")
          .send(userData);
        expect(response.statusCode).toBe(400);
      });
      it("Should return 400 status code if email is not a valid email.", async () => {
        const userData = {
          firstName: "John",
          lastName: "Doe",
          email: "johndoeexample.com",
          password: "V@123tiwari",
          role: Roles.CUSTOMER,
          tenantId: 1,
        };
        const response = await request(app)
          .post("/auth/register")
          .send(userData);
        expect(response.statusCode).toBe(400);
      });
    });

    describe("Fields are not in proper format", () => {
      it("should trim the email field", async () => {
        const userData = {
          firstName: "John",
          lastName: "Doe",
          email: " johndoe@example.com ",
          password: "password123",
          role: Roles.CUSTOMER,
          tenantId: 1,
        };
        await request(app).post("/auth/register").send(userData);
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();
        expect(users[0].email).toBe("johndoe@example.com");
      });
    });
  });
});
