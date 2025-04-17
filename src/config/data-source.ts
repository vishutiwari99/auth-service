import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from ".";
// import { Config } from "./index";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: Config.DATABASE_URL,
  // Don't use in production. Always keep false
  synchronize: false,
  logging: false,
  entities: ["src/entity/*.{ts,js}"],
  migrations: ["src/migration/*.{ts.js}"],
  subscribers: [],
});
