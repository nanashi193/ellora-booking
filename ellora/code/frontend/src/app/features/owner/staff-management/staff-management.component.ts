import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerApiService, OwnerEmployee, ownerError } from '../../../services/owner-api.service';
import { PhotoUpload } from '../../../shared/components/photo-upload.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

export interface StaffItem {
  id: number;
  name: string;
  avatar: string;
  workingHours: string;
  rating: string;
  status: 'working' | 'off';
}

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule, PhotoUpload],
  templateUrl: './staff-management.component.html',
  styleUrl: './staff-management.component.scss'
})
export class StaffManagement implements OnInit {
  private readonly api = inject(OwnerApiService);
  readonly employees = signal<OwnerEmployee[]>([]);
  readonly activeCount = computed(() => this.employees().filter(item => item.active).length);
  readonly error = signal('');
  readonly editorOpen = signal(false);
  editingId: number | null = null;
  draft = { fullName: '', phone: '', bio: '' };
  ngOnInit(): void { void this.load(); }
  async load(): Promise<void> {
    try {
      const data = await this.api.employees();
      this.employees.set(data);
      this.allStaffs.set(data.map(item => ({
        id: item.id, name: item.fullName, avatar: item.avatarUrl || '/salon-placeholder.svg',
        workingHours: 'Chưa cập nhật', rating: '—', status: item.active ? 'working' : 'off'
      })));
      this.error.set('');
    } catch (error) { this.error.set(ownerError(error)); }
  }
  edit(item?: OwnerEmployee): void {
    this.editingId = item?.id ?? null;
    this.draft = { fullName: item?.fullName ?? '', phone: item?.phone ?? '', bio: item?.bio ?? '' };
    this.editorOpen.set(true);
  }
  async save(): Promise<void> {
    if (this.draft.fullName.trim().length < 2 || !this.draft.phone.trim()) { this.error.set('Vui lòng nhập tên và số điện thoại nhân viên.'); return; }
    try { await this.api.saveEmployee(this.draft, this.editingId ?? undefined); this.editorOpen.set(false); await this.load(); }
    catch (error) { this.error.set(ownerError(error)); }
  }
  async remove(id: number): Promise<void> {
    if (!confirm('Xóa nhân viên này?')) return;
    try { await this.api.remove('employees', id); await this.load(); }
    catch (error) { this.error.set(ownerError(error)); }
  }
  
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
    labels: [],
    datasets: [
      { 
        data: [],
        label: 'Doanh thu dịch vụ',
        backgroundColor: '#F9A8D4', // pink-300
        hoverBackgroundColor: '#F472B6', // pink-400
        barThickness: 32
      },
      { 
        data: [],
        label: 'Đỉnh điểm cuối tuần',
        backgroundColor: '#E5E7EB', // gray-200
        hoverBackgroundColor: '#D1D5DB', // gray-300
        barThickness: 32
      }
    ]
  };

  allStaffs = signal<StaffItem[]>([]);

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
