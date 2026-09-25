import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingApiService, PlatformBill, vnMonth, billLabels } from '../../../services/billing-api.service';
@Component({selector:'app-owner-billing',standalone:true,imports:[CommonModule,FormsModule],styleUrl:'../owner-data.scss',template:`
<section class="card">
 <h2>Thanh toán phí nền tảng theo tháng</h2>
 <div class="actions"><label>Tháng đối soát<input type="month" [(ngModel)]="month" [max]="maxMonth" [disabled]="loading()" /></label><button (click)="load()" [disabled]="loading()">{{loading()?'Đang tải…':'Xem công nợ'}}</button></div>
 @if(error()){<p role="alert" class="error">{{error()}}</p>}
 @if(bill();as b){
  <p><strong>{{labels[b.status]}}</strong> · Tháng {{b.month}}</p>
  <p>Doanh thu hoàn thành: <strong>{{b.gross|number:'1.0-0'}} đ</strong></p>
  <p>Phí nền tảng {{b.percent}}%: <strong>{{b.fee|number:'1.0-0'}} đ</strong> · Admin đã xác nhận: {{b.paid|number:'1.0-0'}} đ</p>
  <p>Còn phải thanh toán: <strong class="metric">{{b.due|number:'1.0-0'}} đ</strong></p>
  <p>Hạn thanh toán: <strong>{{b.dueDate|date:'dd/MM/yyyy'}}</strong></p>
  @if(b.paidAt){<p class="muted">Xác nhận gần nhất: {{b.paidAt|date:'dd/MM/yyyy HH:mm'}}</p>}
  @if(b.due>0){
   @if(b.qrUrl){<img [src]="b.qrUrl" alt="Mã QR thanh toán phí nền tảng do quản trị viên cung cấp" style="width:min(280px,100%);height:auto;object-fit:contain" />}
   @else{<p>Admin chưa cập nhật mã QR. Vui lòng liên hệ hỗ trợ.</p>}
   <p>Nội dung chuyển khoản: <strong>{{b.transferContent}}</strong></p>
   <p class="muted">Nhập đúng số tiền còn phải thanh toán và nội dung trên. Sau khi chuyển khoản, chờ admin kiểm tra và xác nhận.</p>
  }
  <p class="muted">Tháng đang diễn ra sẽ tăng doanh thu khi có lịch hoàn thành mới. Tỷ lệ phí đã có hiệu lực không thay đổi trong tháng.</p>
 }
</section>`})
export class OwnerBillingComponent implements OnInit {
 private api=inject(BillingApiService);month=vnMonth();maxMonth=this.month;labels=billLabels;
 loading=signal(false);error=signal('');bill=signal<PlatformBill|null>(null);
 ngOnInit(){void this.load();}
 async load(){if(this.loading()||!this.month)return;this.loading.set(true);this.error.set('');this.bill.set(null);
  try{this.bill.set(await this.api.owner(this.month));}catch{this.error.set('Không tải được công nợ. Kiểm tra tháng và thử lại.');}finally{this.loading.set(false);}}
}
