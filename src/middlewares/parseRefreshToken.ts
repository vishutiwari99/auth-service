import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookie } from "../types";
const refreshTokenSecret = Config.REFRESH_TOKEN_SECRET;
export default expressjwt({
  secret: String(refreshTokenSecret),
  algorithms: ["HS256"],
  getToken: (req: Request) => (req.cookies as AuthCookie).refreshToken,
});
