export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  requiresConfirmation?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterResult {
  success: boolean;
  requiresConfirmation: boolean;
  message?: string;
}
