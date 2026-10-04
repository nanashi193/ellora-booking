import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerApiService, OwnerEmployee, OwnerEmployeeSchedule, ownerError } from '../../../services/owner-api.service';
import { PhotoUpload } from '../../../shared/components/photo-upload.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BookingApiService, BookingItem } from '../../../services/booking-api.service';
import { vnDate } from '../../../services/billing-api.service';

export interface StaffItem {
  id: number;
  name: string;
  avatar: string;
  workingHours: string;
  rating: string;
  completedBookings: number;
  monthlyRevenue: number;
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
  private readonly bookingApi = inject(BookingApiService);
  readonly employees = signal<OwnerEmployee[]>([]);
  readonly bookings = signal<BookingItem[]>([]);
  readonly averageRating = signal<number | null>(null);
  readonly completionRate = signal<number | null>(null);
  readonly recentAssignedOrders = signal<BookingItem[]>([]);
  readonly activeCount = computed(() => this.employees().filter(item => item.active).length);
  readonly error = signal('');
  readonly editorOpen = signal(false);
  editingId: number | null = null;
  draft = { fullName: '', phone: '', bio: '' };
  ngOnInit(): void { void this.load(); }
  async load(): Promise<void> {
    try {
      const [data, salon] = await Promise.all([this.api.employees(), this.api.salon()]);
      const bookings: BookingItem[] = [];
      for (let page = 0; page < 10; page++) {
        const result = await this.bookingApi.getSalonBookings(salon.id, undefined, page, 100);
        bookings.push(...result.content);
        if (result.last) break;
      }
      const schedules: Array<[number, OwnerEmployeeSchedule[]]> = await Promise.all(data.map(async employee => {
        try { return [employee.id, await this.api.employeeSchedules(employee.id)] as [number, OwnerEmployeeSchedule[]]; }
        catch { return [employee.id, []] as [number, OwnerEmployeeSchedule[]]; }
      }));
      const scheduleById = new Map<number, OwnerEmployeeSchedule[]>(schedules);
      this.bookings.set(bookings);
      this.employees.set(data);
      const month = vnDate().slice(0, 7);
      const mapped = data.map(item => {
        const assigned = bookings.filter(booking => booking.employeeId === item.id);
        const completed = assigned.filter(booking => booking.status === 'COMPLETED');
        const monthly = completed.filter(booking => booking.scheduledAt.slice(0, 7) === month);
        const ratings = completed.map(booking => booking.reviewRating).filter((rating): rating is number => typeof rating === 'number');
        return {
          id: item.id, name: item.fullName, avatar: item.avatarUrl || '/salon-placeholder.svg',
          workingHours: this.formatSchedules(scheduleById.get(item.id) ?? []),
          rating: ratings.length ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1) : '—',
          completedBookings: completed.length,
          monthlyRevenue: monthly.reduce((sum, booking) => sum + (booking.servicePrice || 0), 0),
          status: item.active ? 'working' as const : 'off' as const
        };
      });
      this.allStaffs.set(mapped);
      const ratings = bookings.filter(booking => booking.status === 'COMPLETED' && typeof booking.reviewRating === 'number')
        .map(booking => booking.reviewRating as number);
      this.averageRating.set(ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : null);
      const decided = bookings.filter(booking => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status));
      this.completionRate.set(decided.length ? bookings.filter(booking => booking.status === 'COMPLETED').length / decided.length * 100 : null);
      this.recentAssignedOrders.set(bookings.filter(booking => booking.employeeId != null)
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)).slice(0, 8));
      this.barChartData = {
        labels: mapped.map(item => item.name),
        datasets: [
          { ...this.barChartData.datasets[0], data: mapped.map(item => item.monthlyRevenue), label: 'Doanh thu dịch vụ' },
          { ...this.barChartData.datasets[1], data: mapped.map(item => item.completedBookings), label: 'Lịch hoàn tất' }
        ]
      };
      this.error.set('');
    } catch (error) { this.error.set(ownerError(error)); }
  }
  private formatSchedules(items: OwnerEmployeeSchedule[]): string {
    const days: Record<string, string> = { MONDAY: 'T2', TUESDAY: 'T3', WEDNESDAY: 'T4', THURSDAY: 'T5', FRIDAY: 'T6', SATURDAY: 'T7', SUNDAY: 'CN' };
    const working = items.filter(item => item.available).sort((a, b) => Object.keys(days).indexOf(a.dayOfWeek) - Object.keys(days).indexOf(b.dayOfWeek));
    return working.length ? working.map(item => `${days[item.dayOfWeek] ?? item.dayOfWeek} ${item.startTime.slice(0, 5)}–${item.endTime.slice(0, 5)}`).join(' · ') : 'Chưa cập nhật';
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
      grid: { display: false },
        border: { display: false },
        ticks: { font: { family: 'Inter', weight: 600 }, color: '#4B5563' }
      },
      y: { beginAtZero: true, grid: { display: false }, border: { display: false },
        ticks: { callback: value => `${Number(value).toLocaleString('vi-VN')} ₫` } },
      y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false },
        ticks: { precision: 0 } }
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
        label: 'Lịch hoàn tất',
        backgroundColor: '#E5E7EB', // gray-200
        hoverBackgroundColor: '#D1D5DB', // gray-300
        barThickness: 20,
        yAxisID: 'y1'
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
