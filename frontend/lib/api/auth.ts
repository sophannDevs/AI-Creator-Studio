import { apiRequest, withAuthHeaders } from './client';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
};

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me', {
    method: 'GET',
    headers: withAuthHeaders(token),
  });
}
