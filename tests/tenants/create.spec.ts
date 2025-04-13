import request from "supertest";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import { Roles } from "../../src/contants";
import { createJWKSMock } from "mock-jwks";

describe("POST /tenants", () => {
  let connection: DataSource;

  let jwks: ReturnType<typeof createJWKSMock>;

  let adminToken: string;

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

  it("should return 201 and create a new tenant", async () => {
    const tenentData = {
      name: "Test Tenant",
      address: "Test Address",
    };
    adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });

    const response = await request(app)
      .post("/tenants")
      .set("Cookie", [`accessToken=${adminToken}`])
      .send(tenentData);
    expect(response.statusCode).toBe(201);
  });

  it("should create a new tenant in the database", async () => {
    const tenentData = {
      name: "Test Tenant",
      address: "Test Address",
    };
    adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });
    await request(app)
      .post("/tenants")
      .set("Cookie", [`accessToken=${adminToken}`])
      .send(tenentData);

    const tenantRepository = connection.getRepository(Tenant);
    const tenants = await tenantRepository.find();

    expect(tenants).toHaveLength(1);
    expect(tenants[0].name).toBe(tenentData.name);
  });
  it("should return 401 if user is not authenticated", async () => {
    const tenentData = {
      name: "Test Tenant",
      address: "Test Address",
    };
    const response = await request(app).post("/tenants").send(tenentData);
    expect(response.statusCode).toBe(401);

    const tenantRepository = connection.getRepository(Tenant);
    const tenants = await tenantRepository.find();
    expect(tenants).toHaveLength(0);
  });
});
