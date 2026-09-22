import { Component, computed, inject, signal, effect, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, BookingEvent } from '../../../services/booking.service';
import { OwnerApiService } from '../../../services/owner-api.service';

export interface Staff {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

export interface ServiceCategory {
  name: string;
  count: number;
  services: { name: string; duration: string; price: string }[];
}

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-management.component.html',
  styleUrl: './booking-management.component.scss'
})
export class BookingManagement implements OnInit {
  currentDate = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
  
  // 1 hour = 100px
  hourHeight = 120;
  startHour = 8; // 8 AM
  endHour = 16;  // 4 PM
  
  hours = Array.from({ length: this.endHour - this.startHour + 1 }, (_, i) => this.startHour + i);

  isSidebarOpen = false;
  searchQuery = signal('');

  serviceCategories = signal<ServiceCategory[]>([]);

  filteredServiceCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.serviceCategories();
    
    return this.serviceCategories().map(category => ({
      ...category,
      services: category.services.filter(s => s.name.toLowerCase().includes(query)),
      count: category.services.filter(s => s.name.toLowerCase().includes(query)).length
    })).filter(category => category.count > 0);
  });

  staffs = signal<Staff[]>([{ id: 0, name: 'Chưa phân công', role: '', avatar: '/salon-placeholder.svg' }]);

  private readonly bookingService = inject(BookingService);
  private readonly ownerApi = inject(OwnerApiService);
  private readonly elementRef = inject(ElementRef);
  
  bookings = this.bookingService.bookings;
  error = this.bookingService.error;

  async ngOnInit(): Promise<void> {
    void this.bookingService.loadSalonBookings();
    try {
      const [services, employees] = await Promise.all([this.ownerApi.services(), this.ownerApi.employees()]);
      this.serviceCategories.set([{ name: 'Dịch vụ', count: services.length, services: services.map(service => ({
        name: service.name, duration: `${service.durationMinutes}p`, price: `${service.price.toLocaleString('vi-VN')}₫`
      })) }]);
      this.staffs.set([{ id: 0, name: 'Chưa phân công', role: '', avatar: '/salon-placeholder.svg' }, ...employees.map(employee => ({
        id: employee.id, name: employee.fullName, role: employee.bio, avatar: employee.avatarUrl || '/salon-placeholder.svg'
      }))]);
    } catch { this.error.set('Không tải được dữ liệu nhân viên hoặc dịch vụ.'); }
  }

  constructor() {
    effect(() => {
      const focusedId = this.bookingService.focusedBookingId();
      if (focusedId !== null) {
        // Use setTimeout to ensure DOM is updated/rendered
        setTimeout(() => {
          const element = document.getElementById(`booking-${focusedId}`);
          if (element) {
            // Scroll to center
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add highlight class
            element.classList.add('highlight-pulse');
            
            // Remove highlight after 1.5s
            setTimeout(() => {
              element.classList.remove('highlight-pulse');
            }, 1500);
          }
          
          // Reset the focused ID so it can be triggered again later if needed
          this.bookingService.focusedBookingId.set(null);
        }, 100);
      }
    }, { allowSignalWrites: true });
  }

  // Helper method to format time from hours (e.g. 9.5 -> "09:30")
  formatTime(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // Get bookings for a specific staff member
  getBookingsForStaff(staffId: number) {
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return this.bookings().filter(b => b.staffId === staffId && b.date === date && (b.status === 'confirmed' || b.status === 'pending'));
  }

  // Calculate top position based on start time
  getTopPosition(startTime: number): number {
    return (startTime - this.startHour) * this.hourHeight;
  }

  // Calculate height based on duration
  getHeight(duration: number): number {
    return duration * this.hourHeight;
  }

  acceptBooking(id: number) {
    this.bookingService.acceptBooking(id);
  }

  rejectBooking(id: number) {
    this.bookingService.rejectBooking(id);
  }

  formatHour(hour: number): string {
    if (hour === 12) return '12 TRƯA';
    if (hour > 12) return `${hour - 12} CHIỀU`;
    return `${hour} SÁNG`;
  }
}
