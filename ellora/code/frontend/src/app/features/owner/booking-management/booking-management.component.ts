import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-management.component.html',
  styleUrl: './booking-management.component.scss'
})
export class BookingManagement {
  bookings = signal([
    { id: 'B1001', customer: 'Jane Doe', service: 'Classic Gel Manicure', date: '2026-10-12', time: '09:00 AM', status: 'Pending', price: '$45' },
    { id: 'B1002', customer: 'John Smith', service: 'Spa Pedicure', date: '2026-10-12', time: '11:00 AM', status: 'Confirmed', price: '$55' },
    { id: 'B1003', customer: 'Emily Chen', service: 'Acrylic Extensions', date: '2026-10-13', time: '02:00 PM', status: 'Confirmed', price: '$85' }
  ]);
}
