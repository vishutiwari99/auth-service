import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookie, IRefreshTokenpayload } from "../types";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import logger from "../config/logger";
const refreshTokenSecret = Config.REFRESH_TOKEN_SECRET;
export default expressjwt({
  secret: String(refreshTokenSecret),
  algorithms: ["HS256"],
  getToken: (req: Request) => (req.cookies as AuthCookie).refreshToken,

  async isRevoked(req: Request, token) {
    try {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
      const refreshToken = await refreshTokenRepo.findOne({
        where: {
          id: Number((token?.payload as IRefreshTokenpayload).id),
          user: {
            id: Number(token?.payload.sub),
          },
        },
      });
      return refreshToken === null;
    } catch (error) {
      logger.error("Error while validating refresh token", error, {
        id: (token?.payload as IRefreshTokenpayload).id,
      });
    }
    return true;
  },
});
