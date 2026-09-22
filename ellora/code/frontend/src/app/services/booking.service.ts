import { Injectable, computed, inject, signal } from '@angular/core';
import { BookingApiService, BookingItem } from './booking-api.service';
import { OwnerApiService, ownerError } from './owner-api.service';

export interface BookingEvent {
  id: number;
  staffId: number;
  customerName: string;
  serviceName: string;
  date: string;
  startTime: number;
  duration: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly api = inject(BookingApiService);
  private readonly owner = inject(OwnerApiService);
  bookings = signal<BookingEvent[]>([]);
  focusedBookingId = signal<number | null>(null);
  pendingBookings = computed(() => this.bookings().filter(item => item.status === 'pending'));
  pendingCount = signal(0);
  error = signal('');
  isLoading = signal(false);

  private map(item: BookingItem): BookingEvent {
    const time = item.scheduledAt.slice(11, 16).split(':').map(Number);
    return {
      id: item.id,
      staffId: item.employeeId ?? 0,
      customerName: item.customerName || 'Khách hàng',
      serviceName: item.serviceName,
      date: item.scheduledAt.slice(0, 10),
      startTime: time[0] + time[1] / 60,
      duration: item.durationMinutes / 60,
      status: item.status === 'PENDING' ? 'pending' : item.status === 'CONFIRMED' || item.status === 'IN_PROGRESS' ? 'confirmed' : item.status === 'COMPLETED' ? 'completed' : 'cancelled',
    };
  }

  async loadSalonBookings(): Promise<void> {
    this.error.set(''); this.isLoading.set(true);
    try {
      const salon = await this.owner.salon();
      const items: BookingItem[] = [];
      for (let pageNumber = 0; ; pageNumber++) {
        const page = await this.api.getSalonBookings(salon.id, undefined, pageNumber, 100);
        items.push(...page.content);
        if (page.last) break;
      }
      this.bookings.set(items.map(item => this.map(item)));
      this.pendingCount.set(items.filter(item => item.status === 'PENDING').length);
    } catch (error) { this.bookings.set([]); this.pendingCount.set(0); this.error.set(ownerError(error)); }
    finally { this.isLoading.set(false); }
  }

  async acceptBooking(id: number): Promise<void> { await this.update(id, 'CONFIRMED'); }
  async rejectBooking(id: number): Promise<void> { await this.update(id, 'REJECTED'); }

  private async update(id: number, status: 'CONFIRMED' | 'REJECTED'): Promise<void> {
    try {
      await this.api.updateBookingStatus(id, { status });
      await this.loadSalonBookings();
    } catch (error) { this.error.set(ownerError(error)); }
  }
}
