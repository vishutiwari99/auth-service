import request from "supertest";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";

describe("POST /tenants", () => {
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

  it("should return 201 and create a new tenant", async () => {
    const tenentData = {
      name: "Test Tenant",
      address: "Test Address",
    };
    const response = await request(app).post("/tenants").send(tenentData);
    expect(response.statusCode).toBe(201);
  });
});
