import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password, role }: UserData) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      const error = createHttpError(400, "User with this email already exists");
      throw error;
    }
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role,
      });
    } catch {
      const error = createHttpError(
        400,
        "Failed to store the data in database ",
      );
      throw error;
    }
  }

  async findByEmailWithPassword(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ["id", "firstName", "lastName", "email", "password", "role"],
    });
  }
  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    return user;
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findAndUpdate(id: number, data: UserData) {
    return this.userRepository.update(id, data);
  }

  async findAndDelete(id: number) {
    const user = await this.findById(id);
    if (!user) {
      const error = createHttpError(404, "User not found");
      throw error;
    }
    return await this.userRepository.delete(id);
  }
}
