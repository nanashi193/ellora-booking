import { Component } from '@angular/core';
import { OwnerBillingComponent } from './billing.component';

@Component({
  selector: 'app-owner-billing-page',
  standalone: true,
  imports: [OwnerBillingComponent],
  template: `
    <main class="owner-page">
      <header>
        <div>
          <h1>Phí nền tảng</h1>
          <p class="muted">Theo dõi công nợ hàng tháng và hướng dẫn thanh toán.</p>
        </div>
      </header>
      <app-owner-billing />
    </main>
  `,
  styleUrl: '../owner-data.scss',
})
export class OwnerBillingPage {}
