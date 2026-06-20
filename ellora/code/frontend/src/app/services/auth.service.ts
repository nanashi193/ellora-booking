import { Injectable } from '@angular/core';
import { LoginRequest, LoginResult } from '../models/auth.model';

const DEMO_CREDENTIALS = {
  email: 'demo@company.com',
  password: 'demo1234',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResult> {
    await new Promise((resolve) => setTimeout(resolve, 1800));

    return {
      success:
        credentials.email === DEMO_CREDENTIALS.email &&
        credentials.password === DEMO_CREDENTIALS.password,
    };
  }
}
