import { Component, inject, signal, effect, untracked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BookingApiService,
  BookingItem,
  BookingStatus,
} from '../../../services/booking-api.service';
import { OwnerApiService, ownerError } from '../../../services/owner-api.service';
import { BookingService } from '../../../services/booking.service';
@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-management.component.html',
  styleUrl: '../owner-data.scss',
})
export class BookingManagement implements OnInit {
  private api = inject(BookingApiService);
  private owner = inject(OwnerApiService);
  private notifications = inject(BookingService);
  items = signal<BookingItem[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  page = signal(0);
  last = signal(true);
  filter: BookingStatus | '' = '';
  constructor() {
    effect(() => {
      this.notifications.pendingIds();
      untracked(() => { if (!this.loading() && !this.saving()) void this.load(this.page()); });
    });
  }
  labels: Record<BookingStatus, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    IN_PROGRESS: 'Đang thực hiện',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    REJECTED: 'Đã từ chối',
  };
  ngOnInit() {
    void this.load();
  }
  async load(page = 0) {
    this.loading.set(true);
    this.error.set('');
    this.items.set([]);
    try {
      const salon = await this.owner.salon();
      const result = await this.api.getSalonBookings(salon.id, this.filter || undefined, page, 20);
      this.items.set(result.content);
      this.page.set(page);
      this.last.set(result.last);
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.loading.set(false);
    }
  }
  async update(item: BookingItem, status: BookingStatus) {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      await this.api.updateBookingStatus(item.id, { status });
      this.notifications.stopRinging();
      await this.load(this.page());
      await this.notifications.loadSalonBookings();
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.saving.set(false);
    }
  }
}
