import express, { NextFunction, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { userValidationSchema } from "../validators/register-validator";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(userService, logger, tokenService);

router.post(
  "/register",
  userValidationSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.register(req, res, next);
      // Ensure no value is returned here, just continue execution
    } catch (error) {
      next(error); // Pass the error to the next error handler
    }
  },
);

export default router;
