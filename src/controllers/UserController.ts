import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { CreateUserRequest, UpdateUserRequest } from "../types";
import { validationResult } from "express-validator";

export class UserController {
  constructor(private userService: UserService) {}
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
    try {
      const users = await this.userService.findAll();
      return res.status(200).json(users);
    } catch (error) {
      next(error);
      return;
    }
  }

  async getOneById(req: Request, res: Response, next: NextFunction) {
    try {
      return await this.userService.findById(Number(req.params.id));
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
