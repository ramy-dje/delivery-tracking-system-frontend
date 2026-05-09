import { IUser } from "./user";

export interface IRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
}

export interface IAuthResponseDto {
  accessToken: string;
  message?: string;
  user: IUser;
}