import { Injectable, computed, signal } from '@angular/core';

export interface BookingEvent {
  id: number;
  staffId: number;
  customerName: string;
  serviceName: string;
  startTime: number; // in hours, e.g., 9 for 09:00
  duration: number; // in hours
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  
  // Initial Mock Data
  private mockBookings: BookingEvent[] = [
    // Confirmed bookings
    { id: 1, staffId: 1, customerName: 'Nguyễn Thị A', serviceName: 'Cắt tóc nữ', startTime: 9, duration: 1, status: 'confirmed' },
    { id: 2, staffId: 1, customerName: 'Trần Văn B', serviceName: 'Uốn tóc', startTime: 10.5, duration: 2, status: 'confirmed' },
    { id: 3, staffId: 2, customerName: 'Lê Minh C', serviceName: 'Gội đầu thảo dược', startTime: 8.5, duration: 1, status: 'confirmed' },
    { id: 4, staffId: 2, customerName: 'Phạm Thu D', serviceName: 'Massage mặt', startTime: 13, duration: 1.5, status: 'confirmed' },
    { id: 5, staffId: 3, customerName: 'Hoàng Hải E', serviceName: 'Làm móng tay', startTime: 14, duration: 1, status: 'confirmed' },
    { id: 6, staffId: 4, customerName: 'Đặng Ngọc F', serviceName: 'Nhuộm tóc', startTime: 9, duration: 3, status: 'confirmed' },
    
    // Pending bookings
    { id: 7, staffId: 2, customerName: 'Michael Chang', serviceName: 'Massage mô sâu (60p)', startTime: 10, duration: 1, status: 'pending' },
    { id: 8, staffId: 3, customerName: 'Anna Bella', serviceName: 'Nail Art (90p)', startTime: 15, duration: 1.5, status: 'pending' }
  ];

  // Signal holding all bookings
  bookings = signal<BookingEvent[]>(this.mockBookings);

  // Signal for the booking ID to focus on when clicking a notification
  focusedBookingId = signal<number | null>(null);

  // Derived signal for pending bookings (notifications)
  pendingBookings = computed(() => {
    return this.bookings().filter(b => b.status === 'pending');
  });

  // Derived signal for notification badge count
  pendingCount = computed(() => {
    return this.pendingBookings().length;
  });

  // Actions
  acceptBooking(id: number) {
    this.bookings.update(current => 
      current.map(b => b.id === id ? { ...b, status: 'confirmed' } : b)
    );
  }

  rejectBooking(id: number) {
    this.bookings.update(current => 
      current.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
    );
  }
}
