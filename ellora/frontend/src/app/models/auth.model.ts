export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginResult {
  success: boolean;
}
