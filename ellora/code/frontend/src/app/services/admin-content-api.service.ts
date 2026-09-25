import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiConfig } from '../config/api.config';
import { OwnerReview } from './owner-api.service';
export interface ContentPage<T> { content:T[]; last:boolean; }
export interface AdminSalon {id:number;name:string;status:string;}
export interface AdminContent {id:number;name:string;gallery:string[];photos:{kind:'cover'|'services'|'employees';id:number;name:string;url:string|null}[];}
@Injectable({providedIn:'root'})
export class AdminContentApiService {
  private http=inject(HttpClient);
  private base=apiConfig.baseUrl+'/admin/content';
  private async get<T>(path:string) {return (await firstValueFrom(this.http.get<{data:T}>(this.base+path))).data;}
  salons(page:number) {return this.get<ContentPage<AdminSalon>>('/salons?page='+page);}
  detail(id:number) {return this.get<AdminContent>('/salons/'+id);}
  reviews(id:number,page:number) {return this.get<ContentPage<OwnerReview>>(`/salons/${id}/reviews?page=${page}`);}
  async uploadPhoto(salon:number,kind:string,id:number,file:File,oldUrl?:string) {
    const form=new FormData();form.append('file',file);if(oldUrl)form.append('oldUrl',oldUrl);
    return (await firstValueFrom(this.http.post<{data:string}>(`${this.base}/salons/${salon}/photos/${kind}/${id}`,form))).data;
  }
  async removePhoto(salon:number,kind:string,id:number,url?:string) {
    await firstValueFrom(this.http.delete(`${this.base}/salons/${salon}/photos/${kind}/${id}`,{params:url?{url}:{}}));
  }
  async editReview(id:number,rating:number,comment:string) {await firstValueFrom(this.http.put(`${this.base}/reviews/${id}`,{rating,comment}));}
  async deleteReview(id:number) {await firstValueFrom(this.http.delete(`${this.base}/reviews/${id}`));}
  async editReply(id:number,reply:string) {await firstValueFrom(this.http.put(`${this.base}/reviews/${id}/reply`,{reply}));}
  async deleteReply(id:number) {await firstValueFrom(this.http.delete(`${this.base}/reviews/${id}/reply`));}
}
