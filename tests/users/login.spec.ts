import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";

describe("POST /users/login", () => {
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

  describe("Given all required fields are provided", () => {
    it("should return 200 and a valid JWT token", async () => {
      // TODO: Implement test
    });
  });
});
