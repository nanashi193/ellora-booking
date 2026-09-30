import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiConfig } from '../config/api.config';
import { Profile } from './profile-api.service';
import { OwnerPage } from './owner-api.service';

export interface AdminUser {id:string;fullName:string;email:string;phone:string|null;role:Profile['role'];enabled:boolean;locked:boolean;createdAt:string;}
@Injectable({providedIn:'root'})
export class AdminUsersApiService {
 private http=inject(HttpClient);private base=apiConfig.baseUrl+'/admin/users';
 async list(keyword='',page=0){return(await firstValueFrom(this.http.get<{data:OwnerPage<AdminUser>}>(this.base,{params:{keyword,page}}))).data;}
 async lock(id:string,locked:boolean){return(await firstValueFrom(this.http.patch<{data:AdminUser}>(`${this.base}/${encodeURIComponent(id)}/lock`,{locked}))).data;}
}
