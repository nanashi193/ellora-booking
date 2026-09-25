import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiConfig } from '../config/api.config';
export interface BillingConfig {currentPercent:number;nextPercent:number;effectiveMonth:string;qrUrl:string|null;}
export interface PlatformBill {salonId:number;salonName:string;month:string;gross:number;percent:number;fee:number;paid:number;due:number;dueDate:string;status:'NO_FEE'|'PAID'|'OVERDUE'|'UNPAID';transferContent:string;qrUrl:string|null;paidAt?:string;remindedAt?:string;}
export function vnDate(){
  const parts=new Intl.DateTimeFormat('en',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part=(name:string)=>parts.find(p=>p.type===name)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function vnMonth(){return vnDate().slice(0,7);}
export const billLabels={NO_FEE:'Không phát sinh phí',PAID:'Đã thanh toán',OVERDUE:'Quá hạn',UNPAID:'Chưa thanh toán'};
@Injectable({providedIn:'root'})
export class BillingApiService {
  private http=inject(HttpClient);private base=apiConfig.baseUrl;
  private async get<T>(path:string){return(await firstValueFrom(this.http.get<{data:T}>(this.base+path))).data;}
  config(){return this.get<BillingConfig>('/admin/billing/config');}
  owner(month:string){return this.get<PlatformBill>('/owner/billing?month='+encodeURIComponent(month));}
  list(month:string,page:number){return this.get<{content:PlatformBill[];last:boolean}>(`/admin/billing/statements?month=${encodeURIComponent(month)}&page=${page}`);}
  async rate(percent:number){return(await firstValueFrom(this.http.put<{data:BillingConfig}>(this.base+'/admin/billing/config',{percent}))).data;}
  async qr(file:File){const data=new FormData();data.append('file',file);return(await firstValueFrom(this.http.post<{data:string}>(this.base+'/admin/billing/qr',data))).data;}
  async confirm(bill:PlatformBill){await firstValueFrom(this.http.post(`${this.base}/admin/billing/statements/${bill.salonId}/confirm?month=${bill.month}`,{expectedDue:bill.due}));}
  async remind(bill:PlatformBill){await firstValueFrom(this.http.post(`${this.base}/admin/billing/statements/${bill.salonId}/remind?month=${bill.month}`,{}));}
}
