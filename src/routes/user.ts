import express, { NextFunction, Request, Response } from "express";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../contants";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { userRegistrationValidationSchema } from "../validators/register-validator";
import { UpdateUserRequest } from "../types";
import listUserValidator from "../validators/list-user-validator";
import { userUpdateValidationSchema } from "../validators/update-user-validator";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post(
  "/",
  userRegistrationValidationSchema,
  authenticate,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.create(req, res, next);
  },
);

router.get(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  listUserValidator,
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.getAll(req, res, next);
  },
);

router.get(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.getOneById(req, res, next);
  },
);

router.patch(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  userUpdateValidationSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.update(req as UpdateUserRequest, res, next);
  },
);

router.delete(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.delete(req, res, next);
  },
);

export default router;
