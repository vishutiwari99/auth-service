import express, { NextFunction, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { userRegistrationValidationSchema } from "../validators/register-validator";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import { userLoginValidationSchema } from "../validators/login-validator";
import { CredentialService } from "../services/CredentialService";
import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "../types";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import parseRefreshToken from "../middlewares/parseRefreshToken";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialService,
);

router.post(
  "/register",
  userRegistrationValidationSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.register(req, res, next);
      // Ensure no value is returned here, just continue execution
    } catch (error) {
      next(error); // Pass the error to the next error handler
    }
  },
);
router.post(
  "/login",
  userLoginValidationSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.login(req, res, next);
      // Ensure no value is returned here, just continue execution
    } catch (error) {
      next(error); // Pass the error to the next error handler
    }
  },
);
router.get(
  "/self",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.self(req as AuthRequest, res, next);
      // Ensure no value is returned here, just continue execution
    } catch (error) {
      next(error); // Pass the error to the next error handler
    }
  },
);
router.post(
  "/refresh",
  authenticate,
  validateRefreshToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.refresh(req as AuthRequest, res, next);
      // Ensure no value is returned here, just continue execution
    } catch (error) {
      next(error); // Pass the error to the next error handler
    }
  },
);

router.post(
  "/logout",
  parseRefreshToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.logout(req as AuthRequest, res, next);
      // Ensure no value is returned here, just continue execution
    } catch (error) {
      next(error); // Pass the error to the next error handler
    }
  },
);

export default router;
