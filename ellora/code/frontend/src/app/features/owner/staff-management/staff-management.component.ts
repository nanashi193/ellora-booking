import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

export interface StaffItem {
  id: number;
  name: string;
  avatar: string;
  workingHours: string;
  rating: number;
  status: 'working' | 'off';
}

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './staff-management.component.html',
  styleUrl: './staff-management.component.scss'
})
export class StaffManagement {
  
  // Chart Configuration
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        border: { display: false },
        ticks: { font: { family: 'Inter', weight: 600 }, color: '#4B5563' }
      },
      y: {
        stacked: true,
        grid: { display: false },
        border: { display: false },
        display: false
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#FFF',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true
      }
    },
    elements: {
      bar: {
        borderRadius: 6 // rounded bars
      }
    }
  };
  
  public barChartType: ChartType = 'bar';

  public barChartData: ChartData<'bar'> = {
    labels: [ 'T2', 'T3', 'T4', 'T5', 'T6', 'T7' ],
    datasets: [
      { 
        data: [ 50, 45, 60, 40, 70, 80 ], 
        label: 'Doanh thu dịch vụ',
        backgroundColor: '#F9A8D4', // pink-300
        hoverBackgroundColor: '#F472B6', // pink-400
        barThickness: 32
      },
      { 
        data: [ 20, 25, 10, 30, 20, 15 ], 
        label: 'Đỉnh điểm cuối tuần',
        backgroundColor: '#E5E7EB', // gray-200
        hoverBackgroundColor: '#D1D5DB', // gray-300
        barThickness: 32
      }
    ]
  };

  // Mock Data
  allStaffs = signal<StaffItem[]>([
    { id: 1, name: 'Lê Minh Anh', avatar: 'https://ui-avatars.com/api/?name=Le+Minh+Anh&background=random', workingHours: '09:00 - 18:00', rating: 4.9, status: 'working' },
    { id: 2, name: 'Nguyễn Hoàng Nam', avatar: 'https://ui-avatars.com/api/?name=Nguyen+Hoang+Nam&background=random', workingHours: '11:00 - 20:00', rating: 4.7, status: 'off' },
    { id: 3, name: 'Trần Thanh Vân', avatar: 'https://ui-avatars.com/api/?name=Tran+Thanh+Van&background=random', workingHours: '08:00 - 17:00', rating: 4.8, status: 'working' },
    { id: 4, name: 'Phạm Hải Đăng', avatar: 'https://ui-avatars.com/api/?name=Pham+Hai+Dang&background=random', workingHours: '10:00 - 19:00', rating: 4.6, status: 'working' },
    { id: 5, name: 'Lý Nhã Kỳ', avatar: 'https://ui-avatars.com/api/?name=Ly+Nha+Ky&background=random', workingHours: '13:00 - 21:00', rating: 4.9, status: 'working' },
    { id: 6, name: 'Đặng Mai Phương', avatar: 'https://ui-avatars.com/api/?name=Dang+Mai+Phuong&background=random', workingHours: '09:00 - 18:00', rating: 4.5, status: 'off' },
    { id: 7, name: 'Vũ Minh Đức', avatar: 'https://ui-avatars.com/api/?name=Vu+Minh+Duc&background=random', workingHours: '10:00 - 18:00', rating: 4.8, status: 'working' },
    { id: 8, name: 'Bùi Thị Lan', avatar: 'https://ui-avatars.com/api/?name=Bui+Thi+Lan&background=random', workingHours: '08:00 - 17:00', rating: 4.9, status: 'working' },
    { id: 9, name: 'Hồ Tuấn Anh', avatar: 'https://ui-avatars.com/api/?name=Ho+Tuan+Anh&background=random', workingHours: '11:00 - 20:00', rating: 4.7, status: 'working' },
    { id: 10, name: 'Lâm Oanh', avatar: 'https://ui-avatars.com/api/?name=Lam+Oanh&background=random', workingHours: '09:00 - 18:00', rating: 4.4, status: 'off' }
  ]);

  // Pagination State
  pageSize = signal<number>(5);
  currentPage = signal<number>(1);

  // Computed Derived State
  paginatedStaffs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.allStaffs().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.allStaffs().length / this.pageSize());
  });

  pagesArray = computed(() => {
    const count = this.totalPages();
    return Array.from({length: count}, (_, i) => i + 1);
  });

  // Actions
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  previousPage() {
    const p = this.currentPage();
    if (p > 1) {
      this.currentPage.set(p - 1);
    }
  }

  nextPage() {
    const p = this.currentPage();
    if (p < this.totalPages()) {
      this.currentPage.set(p + 1);
    }
  }
}
