import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookingApiService, BookingItem } from '../../../services/booking-api.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  reviewId = signal<number | null>(null);
  reviewSaving = signal(false);
  reviewError = signal('');
  reviewSuccess = signal('');
  rating = 0;
  comment = '';

  openReview(booking: BookingItem): void {
    if (this.reviewSaving() || booking.status !== 'COMPLETED' || booking.reviewed) return;
    this.reviewId.set(booking.id);
    this.rating = 0; this.comment = '';
    this.reviewError.set(''); this.reviewSuccess.set('');
  }

  async submitReview(): Promise<void> {
    const id = this.reviewId();
    if (id === null || this.reviewSaving()) return;
    if (!Number.isInteger(this.rating) || this.rating < 1 || this.rating > 5 || this.comment.length > 1000) {
      this.reviewError.set('Hãy chọn từ 1 đến 5 sao. Nhận xét tối đa 1000 ký tự.'); return;
    }
    this.reviewSaving.set(true); this.reviewError.set('');
    try {
      await this.api.reviewBooking(id, this.rating, this.comment.trim());
      this.bookings.update(list => list.map(b => b.id === id ? {...b, reviewed: true} : b));
      this.reviewId.set(null);
      this.reviewSuccess.set('Cảm ơn bạn! Đánh giá đã được đăng trên trang tiệm.');
    } catch (e: any) {
      this.reviewError.set(e?.error?.message || 'Chưa gửi được đánh giá. Vui lòng thử lại.');
    } finally { this.reviewSaving.set(false); }
  }


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
