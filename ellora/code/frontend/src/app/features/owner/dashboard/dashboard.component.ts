import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class Dashboard {
  stats = signal({
    totalBookings: 842,
    revenue: '124.5Mđ',
    newCustomers: 156,
    upcomingAppointments: 8
  });

  // Revenue Line Chart
  revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
    datasets: [
      {
        data: [12, 19, 15, 22, 28, 35, 30],
        label: 'Tháng này',
        fill: true,
        tension: 0.4,
        borderColor: '#8C3A5A',
        backgroundColor: 'rgba(140, 58, 90, 0.1)',
        pointBackgroundColor: '#8C3A5A'
      },
      {
        data: [8, 12, 11, 16, 21, 26, 20],
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
    labels: ['Cắt & Tạo kiểu', 'Nhuộm màu', 'Chăm sóc da'],
    datasets: [
      {
        data: [45, 30, 15],
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
    labels: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'],
    datasets: [
      {
        data: [15, 42, 38, 55, 75, 48],
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

  staffPerformance = [
    { name: 'Nguyễn Thu Thảo', role: 'Senior Stylist', revenue: '28.4Mđ', growth: '+15%', progress: 85, avatar: 'https://i.pravatar.cc/150?u=thao' },
    { name: 'Lê Minh Hải', role: 'Master Barber', revenue: '24.2Mđ', growth: '+5%', progress: 75, avatar: 'https://i.pravatar.cc/150?u=hai' },
    { name: 'Trần Phương Linh', role: 'Aesthetician', revenue: '21.8Mđ', growth: '~0%', progress: 65, avatar: 'https://i.pravatar.cc/150?u=linh' },
  ];

  transactions = [
    { id: '#INV-9842', customer: 'Hoàng Anh', service: 'Nhuộm Balayage', staff: 'Thu Thảo', date: '24/10/2023', amount: '2.450.000đ', status: 'THÀNH CÔNG' },
    { id: '#INV-9841', customer: 'Minh Tuyết', service: 'Gội đầu thảo dược', staff: 'Phương Linh', date: '24/10/2023', amount: '350.000đ', status: 'THÀNH CÔNG' },
    { id: '#INV-9840', customer: 'Quốc Cường', service: 'Cắt tóc & Cạo mặt', staff: 'Minh Hải', date: '23/10/2023', amount: '450.000đ', status: 'ĐANG CHỜ' },
    { id: '#INV-9839', customer: 'Hà Vy', service: 'Liệu trình chăm sóc da mặt', staff: 'Phương Linh', date: '23/10/2023', amount: '1.200.000đ', status: 'THÀNH CÔNG' },
  ];
}
