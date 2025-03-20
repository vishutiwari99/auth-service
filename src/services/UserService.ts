import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import logger from "../config/logger";
import { Roles } from "../contants";
import bcrypt from "bcrypt";
export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: UserData) {
    // const user = await this.userRepository.findOne({ where: { email } });
    // if (user) {
    //   const error = createHttpError(400, "User already exists with this email");
    //   throw error;
    // }
    // Hash the password before storing it in the database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Roles.CUSTOMER,
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
