import { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface AuthRequest extends Request {
  auth: {
    sub: number;
    role: number;
    id?: string;
  };
}

export interface AuthCookie {
  refreshToken: string;
  accessToken: string;
}

export interface IRefreshTokenpayload {
  id: string;
}
