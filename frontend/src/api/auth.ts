import apiClient from "./client";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

// ===== Register =====

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  user: AuthUser;
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>("/register", payload);
  return response.data;
}

// ===== Login =====

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/login", payload);
  return response.data;
}