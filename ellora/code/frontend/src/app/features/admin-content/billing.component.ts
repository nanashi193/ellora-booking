import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BillingApiService, BillingConfig, PlatformBill, vnDate, vnMonth, billLabels } from '../../services/billing-api.service';
@Component({standalone:true,imports:[CommonModule,FormsModule],styleUrl:'../owner/owner-data.scss',template:`
<section class="owner-page" style="max-width:none;padding:0">
 <header><h1>Phí nền tảng và thanh toán</h1></header>
 @if(error()){<p role="alert" class="error">{{error()}}</p>}
 @if(message()){<p role="status">{{message()}}</p>}
 @if(config();as c){
 <section class="card">
  <h2>Tỷ lệ phí chung cho tất cả dịch vụ, tất cả tiệm</h2>
  <p>Đang áp dụng: <strong>{{c.currentPercent}}%</strong>. @if(c.effectiveDate){Thay đổi kế tiếp từ {{c.effectiveDate|date:'dd/MM/yyyy'}}: <strong>{{c.nextPercent}}%</strong>.}</p>
  <form #rateForm="ngForm" (ngSubmit)="saveRate()" class="actions">
   <label>Tỷ lệ hoa hồng (%)<input type="number" name="percent" min="0" max="100" step="0.01" required [(ngModel)]="percent" [disabled]="busy()" /></label>
   <label>Ngày áp dụng<input type="date" name="effectiveDate" required [(ngModel)]="effectiveDate" [disabled]="busy()" /></label>
   <button type="submit" [disabled]="busy()||rateForm.invalid">Lưu tỷ lệ</button>
  </form>
  <p class="muted">Áp dụng từ 00:00 ngày đã chọn (giờ Việt Nam) đến mốc thay đổi tiếp theo, theo ngày hoàn thành lịch hẹn. Có thể chọn ngày quá khứ, hôm nay hoặc tương lai. Lưu cùng ngày sẽ thay tỷ lệ tại mốc đó.</p>
  <p class="muted">Chọn ngày quá khứ sẽ tính lại phí và công nợ liên quan. Số tiền đã xác nhận vẫn giữ nguyên; khoản trả dư được hiển thị để đối soát.</p>
  <h3>QR nhận tiền của nền tảng</h3>
  @if(c.qrUrl){<img [src]="c.qrUrl" alt="QR nhận tiền nền tảng" style="width:min(240px,100%);height:auto" />}
  <label>Chọn ảnh QR (JPG/PNG, tối đa 5 MB)<input type="file" accept="image/jpeg,image/png" (change)="chooseQr($event)" [disabled]="busy()" /></label>
  @if(qrFile){<p>{{qrFile.name}}</p><button (click)="saveQr()" [disabled]="busy()">Lưu ảnh QR</button>}
 </section>}
 <section class="card">
  <h2>Đối soát công nợ tiệm</h2>
  <div class="actions"><label>Tháng<input type="month" [(ngModel)]="month" [max]="maxMonth" [disabled]="busy()" /></label><button (click)="load(0)" [disabled]="busy()">Xem công nợ</button></div>
  <p>Chỉ xác nhận sau khi kiểm tra tiền thực nhận. Phí được cộng theo tỷ lệ có hiệu lực khi từng lịch hoàn thành, rồi làm tròn tổng tháng đến đồng.</p>
  <div class="table-wrap"><table><thead><tr><th>Tiệm / Tháng</th><th>Doanh thu</th><th>Phí</th><th>Đã trả / Còn nợ</th><th>Hạn / Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
   @for(b of bills();track b.salonId){<tr>
    <td>{{b.salonName}}<p>{{b.month}}</p><small>{{b.transferContent}}</small></td>
    <td>{{b.gross|number:'1.0-0'}} đ</td><td>Bình quân {{b.percent}}%<p>{{b.fee|number:'1.0-0'}} đ</p></td>
    <td>{{b.paid|number:'1.0-0'}} đ / <strong>{{b.due|number:'1.0-0'}} đ</strong>@if(b.overpaid>0){<p>Trả dư: {{b.overpaid|number:'1.0-0'}} đ</p>}</td>
    <td>{{b.dueDate|date:'dd/MM/yyyy'}}<p>{{labels[b.status]}}</p>@if(b.paidAt){<small>Xác nhận {{b.paidAt|date:'dd/MM HH:mm'}}</small>}</td>
    <td><button (click)="confirmPaid(b)" [disabled]="busy()||b.due<=0">Xác nhận đã nhận tiền</button><button (click)="remind(b)" [disabled]="busy()||b.due<=0">Nhắc thanh toán</button>@if(b.remindedAt){<small>Nhắc gần nhất: {{b.remindedAt|date:'dd/MM HH:mm'}}</small>}</td>
   </tr>} @empty{<tr><td colspan="6">Chưa có dữ liệu.</td></tr>}
  </tbody></table></div>
  <div class="pager"><button (click)="load(page-1)" [disabled]="busy()||page===0">Trang trước</button><span>{{page+1}}</span><button (click)="load(page+1)" [disabled]="busy()||last">Trang sau</button></div>
 </section>
</section>`})
export class AdminBillingComponent implements OnInit {
 private api=inject(BillingApiService);config=signal<BillingConfig|null>(null);bills=signal<PlatformBill[]>([]);
 busy=signal(false);error=signal('');message=signal('');percent=0;effectiveDate=vnDate();month=vnMonth();maxMonth=this.month;labels=billLabels;page=0;last=true;qrFile:File|null=null;
 ngOnInit(){void this.load(0);}
 private fail(e:unknown){this.error.set(e instanceof HttpErrorResponse&&typeof e.error?.message==='string'?e.error.message:'Không thực hiện được. Vui lòng thử lại.');}
 async load(page=0){if(this.busy())return;this.busy.set(true);this.error.set('');try{const [c,p]=await Promise.all([this.api.config(),this.api.list(this.month,page)]);if(!this.config())this.percent=c.currentPercent;this.config.set(c);this.bills.set(p.content);this.page=page;this.last=p.last;}catch(e){this.bills.set([]);this.fail(e);}finally{this.busy.set(false);}}
 async saveRate(){
  if(this.busy())return;
  this.error.set('');this.message.set('');
  if(!this.effectiveDate||this.percent==null||!Number.isFinite(this.percent)||this.percent<0||this.percent>100||Math.abs(this.percent*100-Math.round(this.percent*100))>0.000001){this.error.set('Chọn ngày áp dụng và tỷ lệ từ 0 đến 100%, tối đa 2 chữ số thập phân.');return;}
  this.busy.set(true);
  try{
   this.config.set(await this.api.rate(this.percent,this.effectiveDate));
   this.message.set('Đã lưu tỷ lệ từ ngày '+this.effectiveDate.split('-').reverse().join('/')+'.');
   this.bills.set([]);
   const result=await this.api.list(this.month,this.page);this.bills.set(result.content);this.last=result.last;
  }catch(e){this.fail(e);}finally{this.busy.set(false);}
 }
 chooseQr(event:Event){const input=event.target as HTMLInputElement;const file=input.files?.[0];input.value='';this.qrFile=null;if(!file)return;if(!['image/jpeg','image/png'].includes(file.type)||file.size>5*1024*1024){this.error.set('Chọn ảnh JPG/PNG tối đa 5 MB.');return;}this.qrFile=file;}
 async saveQr(){if(!this.qrFile||this.busy())return;this.busy.set(true);this.error.set('');try{const url=await this.api.qr(this.qrFile);this.config.update(c=>c?{...c,qrUrl:url}:c);this.qrFile=null;this.message.set('Đã cập nhật QR nhận tiền.');}catch(e){this.fail(e);}finally{this.busy.set(false);}}
 async confirmPaid(b:PlatformBill){if(this.busy()||!confirm('Xác nhận đã nhận '+b.due.toLocaleString('vi-VN')+' đ từ '+b.salonName+' cho tháng '+b.month+'?'))return;await this.action(b,false);}
 async remind(b:PlatformBill){if(this.busy()||!confirm('Gửi email nhắc thanh toán cho '+b.salonName+'?'))return;await this.action(b,true);}
 private async action(b:PlatformBill,reminder:boolean){this.busy.set(true);this.error.set('');this.message.set('');try{if(reminder)await this.api.remind(b);else await this.api.confirm(b);const result=await this.api.list(this.month,this.page);this.bills.set(result.content);this.message.set(reminder?'Đã xếp hàng gửi email nhắc thanh toán.':'Đã xác nhận số tiền tiệm thanh toán.');}catch(e){this.fail(e);}finally{this.busy.set(false);}}
}
