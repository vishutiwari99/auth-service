import express, { NextFunction, Request, Response } from "express";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../contants";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.create(req, res, next);
  },
);

export default router;
