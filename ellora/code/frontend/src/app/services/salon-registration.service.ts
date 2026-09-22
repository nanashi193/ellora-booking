import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiConfig } from '../config/api.config';

export interface SalonRegistration {
  logoUrl?: string; imageUrls?: string[];
  id: number; name: string; address: string; city: string; district: string;
  phone: string | null; email: string | null; description: string | null;
  ownerName: string; ownerId: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
}
interface Response<T> { data: T; }
export interface PendingPage { content: Pick<SalonRegistration, 'id' | 'name' | 'address' | 'city'>[]; last: boolean; }
@Injectable({ providedIn: 'root' })
export class SalonRegistrationService {
  private readonly http = inject(HttpClient);
  async mine() { return (await firstValueFrom(this.http.get<Response<SalonRegistration>>(`${apiConfig.baseUrl}/business/registration`))).data; }
  async register(request: { name: string; address: string; city: string; district: string; phone: string; email: string; description: string }) {
    return (await firstValueFrom(this.http.post<Response<SalonRegistration>>(`${apiConfig.baseUrl}/business/registration`, request))).data;
  }
  async pending(page: number) { return (await firstValueFrom(this.http.get<Response<PendingPage>>(`${apiConfig.baseUrl}/admin/salons/pending`, { params: { page } }))).data; }
  async detail(id: number) { return (await firstValueFrom(this.http.get<Response<SalonRegistration>>(`${apiConfig.baseUrl}/admin/salons/${id}`))).data; }
  async decide(id: number, action: 'approve' | 'reject') { await firstValueFrom(this.http.post(`${apiConfig.baseUrl}/admin/salons/${id}/${action}`, {})); }
}
