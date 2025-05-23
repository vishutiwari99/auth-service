import request from "supertest";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import { Roles } from "../../src/contants";
import { createJWKSMock } from "mock-jwks";
import { ITenant } from "../../src/types";

describe("DELETE /tenants/:id", () => {
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

  it("should return 200 when updating a tenant", async () => {
    const mockTenants: ITenant[] = [
      { name: "Tenant 1", address: "Address 1" },
      { name: "Tenant 2", address: "Address 2" },
    ];
    const tenantRepository = connection.getRepository(Tenant);
    await tenantRepository.save(mockTenants);

    adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });

    const response = await request(app)
      .delete("/tenants/1")
      .set("Cookie", [`accessToken=${adminToken}`]);
    const afterDeleteTenants = await tenantRepository.find();
    expect(afterDeleteTenants).toHaveLength(1);
    expect(response.status).toBe(200);
  });
});
