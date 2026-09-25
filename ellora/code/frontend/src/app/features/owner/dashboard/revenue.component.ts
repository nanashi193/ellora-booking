import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { apiConfig } from '../../../config/api.config';
import { vnDate } from '../../../services/billing-api.service';
export interface RevenueReport {
  gross:number;fee:number;net:number;completedBookings:number;estimatedBookings:number;
  points:{date:string;gross:number;fee:number;net:number;bookings:number}[];
}
@Component({selector:'app-owner-revenue',standalone:true,imports:[CommonModule,FormsModule,BaseChartDirective],
template:`
<section class="card">
  <h2>Doanh thu và phí nền tảng</h2>
  <p class="muted">Tính theo lịch đã hoàn thành, giờ Việt Nam. Số tiền còn lại chưa trừ chi phí vận hành; đây không phải xác nhận đã thanh toán.</p>
  <div class="actions" style="margin:16px 0">
    <button (click)="preset('day')" [disabled]="loading()">Hôm nay</button>
    <button (click)="preset('week')" [disabled]="loading()">Tuần này</button>
    <button (click)="preset('month')" [disabled]="loading()">Tháng này</button>
    <button (click)="preset('year')" [disabled]="loading()">Năm nay</button>
  </div>
  <form (ngSubmit)="load()" class="actions" style="align-items:end">
    <label>Từ ngày<input type="date" name="from" [(ngModel)]="from" required [disabled]="loading()" /></label>
    <label>Đến ngày<input type="date" name="to" [(ngModel)]="to" required [min]="from" [disabled]="loading()" /></label>
    <label>Gộp theo<select name="groupBy" [(ngModel)]="groupBy" [disabled]="loading()"><option value="day">Ngày</option><option value="week">Tuần (thứ Hai)</option><option value="month">Tháng</option><option value="year">Năm</option></select></label>
    <button type="submit" [disabled]="loading()">{{loading()?'Đang tải…':'Xem báo cáo'}}</button>
  </form>
  @if(error()){<p role="alert" class="error">{{error()}}</p>}
  @if(report();as r){
    <div class="grid" style="margin-top:20px">
      <div class="card">Doanh thu dịch vụ<strong class="metric">{{r.gross|number:'1.0-0'}} đ</strong></div>
      <div class="card">Phí nền tảng phải trả<strong class="metric">{{r.fee|number:'1.0-0'}} đ</strong></div>
      <div class="card">Tiệm còn lại<strong class="metric">{{r.net|number:'1.0-0'}} đ</strong></div>
    </div>
    <p>{{r.completedBookings}} lịch hoàn thành · {{displayFrom|date:'dd/MM/yyyy'}} – {{displayTo|date:'dd/MM/yyyy'}}</p>
    @if(r.estimatedBookings){<p class="muted">Có {{r.estimatedBookings}} lịch cũ chưa lưu giá hoặc ngày hoàn thành riêng. Số liệu dùng giá dịch vụ hiện có và thời điểm cập nhật để ước tính.</p>}
    @if(!r.completedBookings){<p role="status">Chưa có doanh thu trong khoảng ngày đã chọn.</p>}
    <div style="height:320px;margin-top:20px"><canvas baseChart [data]="chartData" [options]="chartOptions" type="bar" role="img" aria-label="Biểu đồ doanh thu dịch vụ, phí nền tảng và số tiền tiệm còn lại"></canvas></div>
    <details style="margin-top:16px"><summary>Xem số liệu chi tiết</summary>
      <div class="table-wrap"><table><thead><tr><th>Kỳ bắt đầu</th><th>Lịch hoàn thành</th><th>Doanh thu</th><th>Phí nền tảng</th><th>Còn lại</th></tr></thead><tbody>
      @for(p of r.points;track p.date){<tr><td>{{p.date|date:'dd/MM/yyyy'}}</td><td>{{p.bookings}}</td><td>{{p.gross|number:'1.0-0'}} đ</td><td>{{p.fee|number:'1.0-0'}} đ</td><td>{{p.net|number:'1.0-0'}} đ</td></tr>}
      </tbody></table></div>
    </details>
  }
</section>`,styleUrl:'../owner-data.scss'})
export class OwnerRevenueComponent implements OnInit {
  private http=inject(HttpClient);
  from='';to='';groupBy='day';displayFrom='';displayTo='';
  loading=signal(false);error=signal('');report=signal<RevenueReport|null>(null);
  chartData:ChartData<'bar'>={labels:[],datasets:[]};
  chartOptions:ChartOptions<'bar'>={responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,ticks:{callback:value=>Number(value).toLocaleString('vi-VN')+' đ'}}},plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:context=>context.dataset.label+': '+Number(context.raw).toLocaleString('vi-VN')+' đ'}}}};
  ngOnInit(){this.preset('month');}
  private format(d:Date){return [d.getUTCFullYear(),String(d.getUTCMonth()+1).padStart(2,'0'),String(d.getUTCDate()).padStart(2,'0')].join('-');}
  preset(period:string){
    const today=new Date(vnDate()+'T00:00:00Z');
    const start=new Date(today);this.to=this.format(today);
    if(period==='week')start.setUTCDate(start.getUTCDate()-((start.getUTCDay()+6)%7));
    if(period==='month')start.setUTCDate(1);
    if(period==='year'){start.setUTCMonth(0,1);}
    this.from=this.format(start);this.groupBy=period==='year'?'month':'day';void this.load();
  }
  async load(){
    if(this.loading())return;
    if(!this.from||!this.to||this.from>this.to){this.error.set('Chọn ngày bắt đầu không lớn hơn ngày kết thúc.');return;}
    this.loading.set(true);this.error.set('');this.report.set(null);
    try{
      const response=await firstValueFrom(this.http.get<{data:RevenueReport}>(apiConfig.baseUrl+'/owner/revenue',{params:{from:this.from,to:this.to,groupBy:this.groupBy}}));
      const r=response.data;this.report.set(r);this.displayFrom=this.from;this.displayTo=this.to;
      this.chartData={labels:r.points.map(p=>p.date),datasets:[
        {label:'Doanh thu dịch vụ',data:r.points.map(p=>p.gross),backgroundColor:'#8c3a5a'},
        {label:'Phí nền tảng',data:r.points.map(p=>p.fee),backgroundColor:'#e9a052'},
        {label:'Tiệm còn lại',data:r.points.map(p=>p.net),backgroundColor:'#4a968b'}]};
    }catch(e){this.error.set(e instanceof HttpErrorResponse&&e.status===400 ? 'Khoảng ngày tối đa 10 năm. Vui lòng kiểm tra ngày đã chọn.' : 'Không tải được báo cáo. Vui lòng thử lại.');}
    finally{this.loading.set(false);}
  }
}
