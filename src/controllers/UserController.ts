import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
} from "../types";
import { matchedData, validationResult } from "express-validator";

export class UserController {
  constructor(private readonly userService: UserService) {}
  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    const { firstName, lastName, email, password, tenantId, role } = req.body;
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
      });
      return res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    const validatedQuery = matchedData(req, { onlyValidData: true });
    try {
      const [users, count] = await this.userService.findAll(
        validatedQuery as UserQueryParams,
      );
      return res.json({
        data: users,
        currentPage: validatedQuery.currentPage as number,
        perPage: validatedQuery.perPage as number,
        total: count,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async getOneById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(Number(req.params.id));
      return res.status(200).json(user);
    } catch (error) {
      next(error);
      return;
    }
  }

  async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findAndUpdate(
        Number(req.params.id),
        req.body,
      );
      return res.status(200).json(user);
    } catch (error) {
      next(error);
      return;
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.findAndDelete(Number(req.params.id));
      return res.status(204).json();
    } catch (error) {
      next(error);
      return;
    }
  }
}
