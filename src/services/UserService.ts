import { Brackets, Repository } from "typeorm";
import { User } from "../entity/User";
import { LimitedUserData, UserData, UserQueryParams } from "../types";
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
      const user = await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role,
        tenant: tenantId ? { id: tenantId } : null,
      });
      return user;
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
    const querBuilder = this.userRepository.createQueryBuilder("user");
    if (validatedQuery.q) {
      const searchQuery = `%${validatedQuery.q}%`;
      querBuilder.where(
        new Brackets((qb) => {
          qb.where(
            "CONCAT(user.firstName, ' ', user.lastName) ILike :searchQuery",
            {
              searchQuery,
            },
          ).orWhere("user.email ILike :searchQuery", {
            searchQuery,
          });
        }),
      );
    }
    if (validatedQuery.role) {
      querBuilder.andWhere("user.role = :role", {
        role: validatedQuery.role,
      });
    }
    const result = await querBuilder
      .leftJoinAndSelect("user.tenant", "tenant")
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy("user.createdAt", "DESC")
      .getManyAndCount();

    return result;
    // return await this.userRepository.find();
  }

  async findAndUpdate(id: number, userData: LimitedUserData) {
    const { email, firstName, lastName, role, tenantId } = userData;

    const user = await this.userRepository.update(id, {
      email,
      firstName,
      lastName,
      role,
      tenant: tenantId ? { id: tenantId } : null,
    });

    return user;
    // return this.userRepository.update(id, data);
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
