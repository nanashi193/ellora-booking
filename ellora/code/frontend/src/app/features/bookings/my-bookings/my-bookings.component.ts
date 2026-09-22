import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingApiService, BookingItem, BookingStatus } from '../../../services/booking-api.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookings implements OnInit {
  private readonly bookingApi = inject(BookingApiService);

  bookings = signal<BookingItem[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  cancellingId = signal<number | null>(null);
  reviewId = signal<number | null>(null);
  reviewSaving = signal(false);
  reviewError = signal('');
  reviewSuccess = signal('');
  rating = 0;
  comment = '';
  pageNumber = signal(0);
  lastPage = signal(true);

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
      await this.bookingApi.reviewBooking(id, this.rating, this.comment.trim());
      this.bookings.update(list => list.map(b => b.id === id ? {...b, reviewed: true} : b));
      this.reviewId.set(null);
      this.reviewSuccess.set('Cảm ơn bạn! Đánh giá đã được đăng trên trang tiệm.');
    } catch (e: any) {
      this.reviewError.set(e?.error?.message || 'Chưa gửi được đánh giá. Vui lòng thử lại.');
    } finally { this.reviewSaving.set(false); }
  }

  async ngOnInit() {
    await this.loadBookings();
  }

  async loadBookings(pageNumber = this.pageNumber()) {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      const page = await this.bookingApi.getMyBookings(pageNumber, 20);
      this.bookings.set(page.content);
      this.pageNumber.set(pageNumber); this.lastPage.set(page.last);
      this.reviewId.set(null);
    } catch (e: any) {
      this.error.set('Không thể tải danh sách đặt lịch. Vui lòng thử lại.');
      console.error('getMyBookings error', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  async cancelBooking(id: number) {
    if (!confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      this.cancellingId.set(id);
      await this.bookingApi.cancelBooking(id);
      this.bookings.update(list =>
        list.map(b => b.id === id ? { ...b, status: 'CANCELLED' as BookingStatus } : b)
      );
    } catch (e: any) {
      alert('Hủy thất bại: ' + (e?.error?.message ?? 'Vui lòng thử lại.'));
    } finally {
      this.cancellingId.set(null);
    }
  }

  isUpcoming(status: BookingStatus): boolean {
    return status === 'PENDING' || status === 'CONFIRMED' || status === 'IN_PROGRESS';
  }

  statusLabel(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      IN_PROGRESS: 'Đang thực hiện',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      REJECTED: 'Bị từ chối',
    };
    return map[status] ?? status;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + 'đ';
  }

  formatScheduled(scheduledAt: string): { date: string; time: string } {
    const d = new Date(scheduledAt);
    return {
      date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
