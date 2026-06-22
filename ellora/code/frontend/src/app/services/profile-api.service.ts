import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { apiConfig } from '../config/api.config';
import { AuthService } from './auth.service';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'SALON_OWNER' | 'ADMIN';
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  async syncCurrentUser(): Promise<Profile> {
    const cognitoProfile = await this.authService.getUserProfile();
    const response = await firstValueFrom(
      this.http.post<ApiResponse<Profile>>(`${apiConfig.baseUrl}/profiles/me`, {
        email: cognitoProfile.email,
        fullName: cognitoProfile.name,
      }),
    );

    return response.data;
  }

  async getCurrentUser(): Promise<Profile> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<Profile>>(`${apiConfig.baseUrl}/profiles/me`),
    );

    return response.data;
  }
}
