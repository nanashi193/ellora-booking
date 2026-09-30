import { Component, inject, OnInit, signal } from '@angular/core';
import { SalonChangePage, SalonProfileChange, SalonRegistrationService } from '../../services/salon-registration.service';
import { SalonChangePreviewComponent } from '../../shared/components/salon-change-preview.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({selector:'app-admin-salon-changes',standalone:true,imports:[SalonChangePreviewComponent],template:`
 <section class="mb-10" aria-label="Duyệt cập nhật hồ sơ salon">
  <h2 class="font-serif text-2xl mb-4">Yêu cầu cập nhật thông tin và ảnh</h2>
  <p class="mb-4">Duyệt để áp dụng thay đổi. Từ chối sẽ giữ nguyên hồ sơ đang hiển thị.</p>
  @if(error()){<p role="alert" class="text-red-700 mb-4">{{error()}}</p>}
  @if(message()){<p role="status" class="text-green-800 mb-4">{{message()}}</p>}
  <button type="button" (click)="load()" [disabled]="busy()" class="underline mb-4">Tải lại yêu cầu cập nhật</button>
  @if(busy()){<p role="status">Đang xử lý…</p>}
  @for(change of page()?.content;track change.id){
   <article class="border rounded-xl bg-white p-4 mb-4">
    <h3 class="font-semibold text-lg">{{change.salonName}}</h3>
    <p>{{change.kind === 'PROFILE' ? 'Thông tin tiệm' : change.kind === 'COVER' ? 'Ảnh đại diện' : 'Bộ ảnh salon'}}</p>
    <button type="button" class="underline my-3" (click)="selected.set(selected()?.id === change.id ? null : change)" [disabled]="busy()">{{selected()?.id === change.id ? 'Thu gọn' : 'Xem thay đổi'}}</button>
    @if(selected()?.id === change.id){
     <app-salon-change-preview [change]="change"/>
     <div class="flex flex-wrap gap-3 mt-5">
      <button type="button" (click)="decide(change,'approve')" [disabled]="busy()" class="bg-charcoal-900 text-white px-5 py-3 rounded disabled:opacity-50">Duyệt cập nhật</button>
      <button type="button" (click)="decide(change,'reject')" [disabled]="busy()" class="border text-red-700 px-5 py-3 rounded disabled:opacity-50">Từ chối cập nhật</button>
     </div>
    }
   </article>
  } @empty {@if(page() && !busy()){<p>Không có yêu cầu cập nhật chờ duyệt.</p>}}
  <div class="flex gap-5 mt-4">
   <button type="button" (click)="move(-1)" [disabled]="busy()||pageNumber()===0" class="disabled:opacity-40">Trang trước</button>
   <span>Trang {{pageNumber()+1}}</span>
   <button type="button" (click)="move(1)" [disabled]="busy()||!page()||page()?.last" class="disabled:opacity-40">Trang sau</button>
  </div>
 </section>
`})
export class SalonChangesComponent implements OnInit {
 private api=inject(SalonRegistrationService);
 page=signal<SalonChangePage|null>(null);pageNumber=signal(0);selected=signal<SalonProfileChange|null>(null);
 busy=signal(false);error=signal('');message=signal('');
 ngOnInit(){void this.load();}
 async load(){
  if(this.busy())return;this.busy.set(true);this.error.set('');this.selected.set(null);
  try{this.page.set(await this.api.changes(this.pageNumber()));}
  catch{this.page.set(null);this.error.set('Không tải được yêu cầu cập nhật. Vui lòng thử lại.');}
  finally{this.busy.set(false);}
 }
 async move(delta:number){this.pageNumber.update(p=>Math.max(0,p+delta));await this.load();}
 async decide(change:SalonProfileChange,action:'approve'|'reject'){
  if(this.busy())return;this.busy.set(true);this.error.set('');this.message.set('');
  try{await this.api.decideChange(change.id,action);this.pageNumber.set(0);this.message.set(action==='approve'?'Đã duyệt và cập nhật hồ sơ salon.':'Đã từ chối. Hồ sơ salon được giữ nguyên.');}
  catch(e){this.error.set(e instanceof HttpErrorResponse && typeof e.error?.message==='string'?e.error.message:'Không xử lý được yêu cầu. Vui lòng tải lại danh sách.');return;}
  finally{this.busy.set(false);}
  await this.load();
 }
}
