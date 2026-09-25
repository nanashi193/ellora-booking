import { OwnerRevenueComponent } from './revenue.component';
import { OwnerBillingComponent } from './billing.component';
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { OwnerApiService } from '../../../services/owner-api.service';
import { SalonRegistration } from '../../../services/salon-registration.service';
import { PhotoUpload } from '../../../shared/components/photo-upload.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PhotoUpload, OwnerRevenueComponent, OwnerBillingComponent],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class Dashboard implements OnInit {
  private readonly owner = inject(OwnerApiService);
  readonly error = signal('');
  readonly salon = signal<SalonRegistration | null>(null);
  stats = signal({
    totalBookings: 0,
    revenue: '—',
    newCustomers: '—',
    upcomingAppointments: 0
  });

  async ngOnInit(): Promise<void> {
    void this.loadSalon();
    try {
      const summary = await this.owner.summary();
      this.stats.set({ totalBookings: summary.totalBookings, revenue: '—', newCustomers: '—', upcomingAppointments: summary.pendingBookings + summary.confirmedBookings });
    } catch { this.error.set('Không tải được thống kê salon.'); }
  }
  async loadSalon(): Promise<void> {
    try { this.salon.set(await this.owner.salon()); }
    catch { this.error.set('Không tải được hồ sơ salon.'); }
  }
  async removeGallery(url: string): Promise<void> {
    try { await this.owner.removeGallery(url); await this.loadSalon(); }
    catch { this.error.set('Không xóa được ảnh salon.'); }
  }

  // Revenue Line Chart
  revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Tháng này',
        fill: true,
        tension: 0.4,
        borderColor: '#8C3A5A',
        backgroundColor: 'rgba(140, 58, 90, 0.1)',
        pointBackgroundColor: '#8C3A5A'
      },
      {
        data: [],
        label: 'Tháng trước',
        fill: false,
        tension: 0.4,
        borderColor: '#D4C4B7',
        borderDash: [5, 5],
        pointBackgroundColor: '#D4C4B7'
      }
    ]
  };
  revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 35, ticks: { stepSize: 5 } },
      x: { grid: { display: false } }
    }
  };

  // Services Doughnut Chart
  servicesChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#8C3A5A', '#F2A4BB', '#D4C4B7'],
        borderWidth: 0
      }
    ]
  };
  servicesChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { legend: { display: false } }
  };

  // Peak Hours Bar Chart
  peakHoursChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: '#F2A4BB',
        borderRadius: 4
      }
    ]
  };
  peakHoursChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 80, ticks: { stepSize: 10 } },
      x: { grid: { display: false } }
    }
  };

  staffPerformance: { name: string; role: string; revenue: string; growth: string; progress: number; avatar: string }[] = [];

  transactions: { id: string; customer: string; service: string; staff: string; date: string; amount: string; status: string }[] = [];
}
