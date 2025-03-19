import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { Config } from "./index";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USER_NAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,

  // Don't use in production. Always keep false
  synchronize: false,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
