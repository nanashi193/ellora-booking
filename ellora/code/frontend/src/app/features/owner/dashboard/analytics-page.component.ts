import { Component } from '@angular/core';
import { OwnerRevenueComponent } from './revenue.component';

@Component({
  selector: 'app-owner-analytics-page',
  standalone: true,
  imports: [OwnerRevenueComponent],
  template: `
    <main class="owner-page">
      <header>
        <div>
          <h1>Phân tích doanh thu</h1>
          <p class="muted">Theo dõi doanh thu dịch vụ, phí nền tảng và số lịch đã hoàn thành.</p>
        </div>
      </header>
      <app-owner-revenue />
    </main>
  `,
  styleUrl: '../owner-data.scss',
})
export class OwnerAnalyticsPage {}
