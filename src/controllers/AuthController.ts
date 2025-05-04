import { NextFunction, Response } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { User } from "../entity/User";
import { Roles } from "../contants";

export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
    private readonly tokenService: TokenService,
    private readonly credentialService: CredentialService,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { firstName, lastName, email, password, role, tenantId } = req.body;

    this.logger.debug("New request to register user", {
      firstName,
      lastName,
      email,
      password: "*****",
    });

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: role.toLowerCase() ?? Roles.CUSTOMER,
        tenantId: tenantId,
      });

      this.logger.info(`User ${user.id} created successfully`);
      await this.setAuthCookies(res, user);
      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { email, password } = req.body;

    this.logger.debug("New request to login user", {
      email,
      password: "*****",
    });

    try {
      const user = await this.userService.findByEmailWithPassword(email);
      if (!user) {
        const error = createHttpError(400, "Invalid email or password");
        next(error);
        return;
      }

      const passwordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      );
      if (!passwordMatch) {
        const error = createHttpError(401, "Invalid email or password");
        next(error);
        return;
      }

      this.logger.info(`User ${user.id} logged in successfully`);
      await this.setAuthCookies(res, user);
      res.status(200).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async self(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.auth.sub);
      if (!user) {
        const error = createHttpError(404, "User not found");
        throw error;
      }
      return res.status(200).json({ ...user, password: undefined });
    } catch (error) {
      next(error);
      return;
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.auth.sub);
      if (!user) {
        const error = createHttpError(400, "User with token not found");
        next(error);
        return;
      }

      // Persist new refresh token
      const newRefreshToken =
        await this.tokenService.persistsRefreshToken(user);

      // Delete Old refresh token
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      // Generate tokens
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      // Set cookies
      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
        sameSite: "strict",
      });
      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: "strict",
      });

      res.json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.auth.sub);
      if (!user) {
        const error = createHttpError(400, "User with token not found");
        next(error);
        return;
      }
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));
      this.logger.info(`User ${user.id} logged out successfully`);
      res.clearCookie("accessToken").clearCookie("refreshToken");
      res.status(204).end();
    } catch (error) {
      next(error);
      return;
    }
  }

  private async setAuthCookies(res: Response, user: User) {
    const payload: JwtPayload = {
      sub: String(user.id),
      role: user.role,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const newRefreshToken = await this.tokenService.persistsRefreshToken(user);
    const refreshToken = this.tokenService.generateRefreshToken({
      ...payload,
      id: String(newRefreshToken.id),
    });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      domain: "localhost",
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
      domain: "localhost",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "strict",
    });
  }
}
