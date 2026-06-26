import { Component, inject, signal, computed, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';

interface CalendarDay {
  date: number;
  fullDate: string; // 'YYYY-MM-DD'
  isCurrentMonth: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit, OnDestroy {
  private dataService = inject(MockDataService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Data
  salon = computed(() => this.dataService.salons()[0]);
  services = this.dataService.services;
  staffList = this.dataService.staff;

  // Wizard state: 1=Dịch vụ, 2=Thợ nail, 3=Thời gian, 4=Xác nhận
  currentStep = signal<1 | 2 | 3 | 4>(1);

  // Step 1: Services
  selectedServiceIds = signal<string[]>([]);

  // Step 2: Staff
  selectedStaffId = signal<string | null>(null);

  // Step 3: Date/Time
  calendarYear = signal(new Date().getFullYear());
  calendarMonth = signal(new Date().getMonth()); // 0-indexed
  selectedDate = signal<string | null>(null);
  selectedTime = signal<string | null>(null);

  // Popup & Countdown
  showSuccessPopup = signal(false);
  countdown = signal(30);
  private countdownTimer: any;

  // Step 4: Form
  customerForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: ['', Validators.required],
    notes: ['']
  });

  async ngOnInit() {
    try {
      const profile = await this.authService.getUserProfile();
      this.customerForm.patchValue({
        fullName: profile.name || '',
        phone: profile.phone_number || ''
      });
    } catch (e) {
      console.warn('Could not fetch user profile from Cognito', e);
    }
  }

  // ─── Computed ───────────────────────────────────────

  selectedServices = computed(() =>
    this.services().filter(s => this.selectedServiceIds().includes(s.id))
  );

  totalPrice = computed(() =>
    this.selectedServices().reduce((sum, s) => sum + s.price, 0)
  );

  selectedStaff = computed(() =>
    this.staffList().find(s => s.id === this.selectedStaffId())
  );

  calendarMonthLabel = computed(() => {
    const d = new Date(this.calendarYear(), this.calendarMonth(), 1);
    return d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  });

  calendarDays = computed<CalendarDay[]>(() => {
    const year = this.calendarYear();
    const month = this.calendarMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    // Mon=0 … Sun=6 offset
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Prev month filler
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date: daysInPrevMonth - i, fullDate: this.toISODate(d), isCurrentMonth: false, isPast: d < today });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: i, fullDate: this.toISODate(d), isCurrentMonth: true, isPast: d < today });
    }
    // Next month filler to complete last row
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        days.push({ date: i, fullDate: this.toISODate(d), isCurrentMonth: false, isPast: false });
      }
    }
    return days;
  });

  morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  afternoonSlots = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  selectedDateLabel = computed(() => {
    if (!this.selectedDate()) return '';
    const [y, m, d] = this.selectedDate()!.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
  });

  // ─── Helpers ────────────────────────────────────────

  private toISODate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  formatPrice(p: number): string {
    return p.toLocaleString('vi-VN') + 'đ';
  }

  // ─── Actions ────────────────────────────────────────

  toggleService(id: string) {
    this.selectedServiceIds.update(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  prevMonth() {
    if (this.calendarMonth() === 0) {
      this.calendarMonth.set(11);
      this.calendarYear.update(y => y - 1);
    } else {
      this.calendarMonth.update(m => m - 1);
    }
  }

  nextMonth() {
    if (this.calendarMonth() === 11) {
      this.calendarMonth.set(0);
      this.calendarYear.update(y => y + 1);
    } else {
      this.calendarMonth.update(m => m + 1);
    }
  }

  nextStep() {
    const step = this.currentStep();
    if (step === 1 && this.selectedServiceIds().length > 0) this.currentStep.set(2);
    else if (step === 2 && this.selectedStaffId()) this.currentStep.set(3);
    else if (step === 3 && this.selectedDate() && this.selectedTime()) this.currentStep.set(4);
  }

  prevStep() {
    const step = this.currentStep();
    if (step > 1) this.currentStep.set((step - 1) as 1 | 2 | 3 | 4);
  }

  goToStep(step: number) {
    if (step < this.currentStep()) {
      this.currentStep.set(step as 1 | 2 | 3 | 4);
    }
  }


  confirmBooking() {
    if (this.customerForm.invalid) return;
    this.showSuccessPopup.set(true);
    this.countdown.set(30);
    this.startCountdown();
  }

  startCountdown() {
    this.countdownTimer = setInterval(() => {
      this.countdown.update(c => c - 1);
      if (this.countdown() <= 0) {
        this.closeSuccessPopupAndRedirect();
      }
    }, 1000);
  }

  closeSuccessPopupAndRedirect() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.showSuccessPopup.set(false);
    this.router.navigate(['/my-bookings']);
  }

  ngOnDestroy() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  trackByFn(_: number, item: { id: string }) { return item.id; }
}
