import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './owner-layout.html',
  styleUrl: './owner-layout.css',
})
export class OwnerLayout implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  private readonly bookingService = inject(BookingService);

  userName = '';
  userInitial = '';
  isDropdownOpen = false;
  isNotificationOpen = false;

  pendingCount = this.bookingService.pendingCount;
  pendingBookings = this.bookingService.pendingBookings;

  async ngOnInit(): Promise<void> {
    try {
      const profile = await this.authService.getUserProfile();
      this.userName = profile.name || profile.email;
      this.userInitial = this.userName.charAt(0).toUpperCase();
    } catch {
      this.userName = 'Owner';
      this.userInitial = 'O';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    if (this.isDropdownOpen && !this.elementRef.nativeElement.querySelector('.user-dropdown-container')?.contains(target)) {
      this.isDropdownOpen = false;
    }
    
    if (this.isNotificationOpen && !this.elementRef.nativeElement.querySelector('.notification-container')?.contains(target)) {
      this.isNotificationOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.isNotificationOpen = false;
    }
  }

  toggleNotification(): void {
    this.isNotificationOpen = !this.isNotificationOpen;
    if (this.isNotificationOpen) {
      this.isDropdownOpen = false;
    }
  }

  focusBooking(id: number): void {
    this.bookingService.focusedBookingId.set(id);
    this.isNotificationOpen = false;
    this.router.navigate(['/owner/bookings']);
  }

  async logout(): Promise<void> {
    this.isDropdownOpen = false;
    await this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
}
