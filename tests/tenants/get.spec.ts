import request from "supertest";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import { Roles } from "../../src/contants";
import { createJWKSMock } from "mock-jwks";
import { ITenant } from "../../src/types";

describe("Get /tenants", () => {
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

  it("should return all tenants", async () => {
    const mockTenants: ITenant[] = [
      { name: "Tenant 1", address: "Address 1" },
      { name: "Tenant 2", address: "Address 2" },
    ];
    adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });
    const tenantRepository = connection.getRepository(Tenant);
    await tenantRepository.save(mockTenants);
    const response = await request(app)
      .get("/tenants")
      .set("Cookie", [`accessToken=${adminToken}`]);
    expect(response.body.data).toHaveLength(2);
    expect(response.statusCode).toBe(200);

    const tenants = await tenantRepository.find();
    expect(tenants).toHaveLength(2);
  });
  it("should return tenants with matching query", async () => {
    const mockTenants: ITenant[] = [
      { name: "Tenant 1", address: "Address 1" },
      { name: "Tenant 2", address: "Address 2" },
    ];
    adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });
    const tenantRepository = connection.getRepository(Tenant);
    await tenantRepository.save(mockTenants);
    const response = await request(app)
      .get("/tenants?q=Tenant 1")
      .set("Cookie", [`accessToken=${adminToken}`]);
    expect(response.body.data).toHaveLength(1);
  });

  it("should return a single tenant by id", async () => {
    const mockTenants: ITenant[] = [
      { name: "Tenant 1", address: "Address 1" },
      { name: "Tenant 2", address: "Address 2" },
    ];
    adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });
    const tenantRepository = connection.getRepository(Tenant);
    await tenantRepository.save(mockTenants);
    const tenant = await tenantRepository.find();
    const response = await request(app)
      .get(`/tenants/${tenant[0].id}`)
      .set("Cookie", [`accessToken=${adminToken}`]);
    expect(response.body).toHaveLength(1);
  });
});
