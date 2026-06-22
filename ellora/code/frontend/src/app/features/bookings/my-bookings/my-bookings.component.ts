import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookings {
  // Mock data for bookings
  bookings = signal([
    {
      id: 'B1001',
      salonName: 'The Ivory Room',
      service: 'Classic Gel Manicure',
      date: '2026-10-12',
      time: '09:00 AM',
      status: 'upcoming',
      price: '$45'
    },
    {
      id: 'B1002',
      salonName: 'Lush & Co. Studio',
      service: 'Spa Pedicure',
      date: '2026-09-15',
      time: '02:00 PM',
      status: 'completed',
      price: '$55'
    }
  ]);
}
