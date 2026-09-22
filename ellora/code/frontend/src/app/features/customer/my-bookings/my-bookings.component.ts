import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingApiService, BookingItem } from '../../../services/booking-api.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookings implements OnInit {
  private readonly api = inject(BookingApiService);
  activeTab = signal<'all' | 'upcoming' | 'completed'>('all');
  bookings = signal<BookingItem[]>([]);
  page = signal(0);
  hasMore = signal(false);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void { void this.load(true); }

  async load(reset = false): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true); this.error.set('');
    try {
      const page = reset ? 0 : this.page() + 1;
      const result = await this.api.getMyBookings(page);
      this.bookings.update(current => reset ? result.content : [...current, ...result.content]);
      this.page.set(page); this.hasMore.set(!result.last);
    } catch { this.error.set('Không tải được lịch sử đặt chỗ. Vui lòng thử lại.'); }
    finally { this.loading.set(false); }
  }

  async cancel(id: number): Promise<void> {
    try {
      await this.api.cancelBooking(id);
      this.bookings.update(current => current.map(booking => booking.id === id ? { ...booking, status: 'CANCELLED' } : booking));
    } catch { this.error.set('Không hủy được lịch này. Vui lòng tải lại.'); }
  }

  filteredBookings = computed(() => {
    const currentTab = this.activeTab();
    if (currentTab === 'all') return this.bookings();
    if (currentTab === 'completed') return this.bookings().filter(b => b.status === 'COMPLETED');
    return this.bookings().filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');
  });
}
