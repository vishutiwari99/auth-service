import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData, UserQueryParams } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}
  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
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
        tenant: tenantId ? { id: tenantId } : undefined,
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
      relations: ["tenant"],
    });
    return user;
  }

  async findAll(validatedQuery: UserQueryParams) {
    const querBuilder = this.userRepository.createQueryBuilder();
    const result = await querBuilder
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .getManyAndCount();
    return result;
    // return await this.userRepository.find();
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
