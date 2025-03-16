import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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
    });
  });
  describe("Fields are missing", () => {
    // it("should register a new user", () => {});
  });
});
