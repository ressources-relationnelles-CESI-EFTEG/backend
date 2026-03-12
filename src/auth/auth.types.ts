export interface LoginResponseUser {
  id: number;
  firstname: string | null;
  lastname: string | null;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: LoginResponseUser;
}

export interface RegisterResponse {
  message: string;
  user: LoginResponseUser;
}
