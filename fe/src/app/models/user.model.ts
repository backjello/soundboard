export interface User {
  id: number;
  fullName: string | null;
  email: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: {
    type: string;
    token: string;
    name: string | null;
    abilities: string[];
    lastUsedAt: string | null;
    expiresAt: string | null;
  },
  user: User;
}
