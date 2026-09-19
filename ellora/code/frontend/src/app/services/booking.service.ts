import { Injectable, inject, signal } from '@angular/core';
import { BookingApiService, BookingItem } from './booking-api.service';
import { OwnerApiService, ownerError } from './owner-api.service';
@Injectable({ providedIn: 'root' })
export class BookingService {
  private api = inject(BookingApiService);
  private owner = inject(OwnerApiService);
  pendingBookings = signal<BookingItem[]>([]);
  pendingCount = signal(0);
  error = signal('');
  isLoading = signal(false);
  async loadSalonBookings(): Promise<void> {
    this.pendingBookings.set([]);
    this.pendingCount.set(0);
    this.error.set('');
    this.isLoading.set(true);
    try {
      const salon = await this.owner.salon();
      const page = await this.api.getSalonBookings(salon.id, 'PENDING', 0, 20);
      this.pendingBookings.set(page.content);
      this.pendingCount.set(page.totalElements);
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.isLoading.set(false);
    }
  }
}
