import { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  tenantId?: string;
}
export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface AuthRequest extends Request {
  auth: {
    sub: number;
    role: string;
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

export interface ITenant {
  name: string;
  address: string;
}

export interface CreateTenantRequest extends Request {
  body: ITenant;
}

export interface CreateUserRequest extends Request {
  body: UserData;
}

export interface UpdateUserRequest extends Request {
  id: number;
  body: UserData;
}
