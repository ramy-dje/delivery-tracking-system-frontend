import api from "@/lib/api";
import { IAuthResponseDto } from "@/types/auth";
import { IUpdateUser, IUpdateUserResponse, IUser } from "@/types/user";

export const loginUser = async (
  data: { email: string; password: string }
): Promise<IAuthResponseDto> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (data: {
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  password: string,
}) => {
  return await api.post("/auth/register", data);
};

export const activateUser = async (data: {
  activation_number: string;
  activation_token?: string;
}) => {
  console.log("Activating user with data:", data);
  return await api.post("/auth/activate", data);
};

export const googleLogin = async (data: { credential: any }) => {
  return await api.post("/auth/google-login", data);
};

export const logOutUser = async () => {
  return await api.post("/auth/logout");
};

export const updateProfile = async (data: IUpdateUser): Promise<IUpdateUserResponse> => {
  const res = await api.put("/auth/update", data);
  return res.data;
};

export const confirmChangeEmail = async (data: { email_token: string; activation_number: string }) => {
  return await api.post("/auth/confirm-email", data);
}

export const passwordRecovery = async (data: { email: string }) => {
  return await api.post("/auth/password-recovery", data);
};

export const resetPassword = async (data: {
  newPassword: string;
  recovery_token: string;
}) => {
  return await api.post("/auth/reset-password", data);
};


export const updateProfilePicture = async (formData: FormData) => {
  const res = await api.put("/auth/profile-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}