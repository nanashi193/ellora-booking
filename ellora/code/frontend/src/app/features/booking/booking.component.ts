import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { Button } from '../../shared/components/button/button.component';
import { Avatar } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, Button, Avatar],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class Booking {
  private dataService = inject(MockDataService);
  private router = inject(Router);

  // Mock initial data (normally fetched based on route params)
  salon = computed(() => this.dataService.salons()[0]);
  staffList = this.dataService.staff;
  
  // Wizard state
  currentStep = signal<1 | 2 | 3>(1);
  selectedStaffId = signal<string | null>(null);
  selectedDate = signal<string | null>(null);
  selectedTime = signal<string | null>(null);

  // Available dates (mock)
  availableDates = signal([
    { id: '1', day: 'Mon', date: '12', full: '2026-10-12' },
    { id: '2', day: 'Tue', date: '13', full: '2026-10-13' },
    { id: '3', day: 'Wed', date: '14', full: '2026-10-14' },
    { id: '4', day: 'Thu', date: '15', full: '2026-10-15' },
    { id: '5', day: 'Fri', date: '16', full: '2026-10-16' },
  ]);

  // Available times (mock)
  availableTimes = signal([
    '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:30 PM', '05:00 PM'
  ]);

  // Selected details for summary
  selectedStaff = computed(() => 
    this.staffList().find(s => s.id === this.selectedStaffId())
  );

  nextStep() {
    if (this.currentStep() === 1 && this.selectedStaffId()) {
      this.currentStep.set(2);
    } else if (this.currentStep() === 2 && this.selectedDate() && this.selectedTime()) {
      this.currentStep.set(3);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => (v - 1) as 1 | 2 | 3);
    }
  }

  confirmBooking() {
    // In a real app, send API request here
    alert('Booking confirmed successfully!');
    this.router.navigate(['/']);
  }
}
