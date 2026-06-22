import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class Dashboard {
  stats = signal({
    totalBookings: 124,
    revenue: '$4,250',
    newCustomers: 12,
    upcomingAppointments: 8
  });
}
