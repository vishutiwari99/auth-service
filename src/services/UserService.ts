import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import logger from "../config/logger";

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: UserData) {
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password,
      });
    } catch (err) {
      logger.error(err);
      const error = createHttpError(
        400,
        "Failed to store the data in database ",
      );
      throw error;
    }
  }
}
