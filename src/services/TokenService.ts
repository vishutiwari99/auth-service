import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";
export class TokenService {
  constructor(private readonly refreshtokenRepo: Repository<RefreshToken>) {}

  generateAccessToken(payload: JwtPayload) {
    if (!Config.PRIVATE_KEY) {
      const error = createHttpError(500, "SECRET KEY is not set");
      throw error;
    }
    const privateKey = Config.PRIVATE_KEY;

    if (!privateKey) {
      const error = createHttpError(500, "Error while reading private key");
      throw error;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "auth-service",
    });
    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, String(Config.REFRESH_TOKEN_SECRET), {
      algorithm: "HS256",
      expiresIn: "7d",
      issuer: "auth-service",
      jwtid: String(payload.id),
    });
    return refreshToken;
  }

  async persistsRefreshToken(user: User) {
    const MS_IN_YEAR = 365 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + MS_IN_YEAR);
    const newRefreshToken = await this.refreshtokenRepo.save({
      user,
      expiresAt,
    });
    return newRefreshToken;
  }

  async deleteRefreshToken(tokenId: number) {
    return await this.refreshtokenRepo.delete({
      id: tokenId,
    });
  }
}
