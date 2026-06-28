import { Component, computed, inject, signal, effect, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, BookingEvent } from '../../../services/booking.service';

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
export class BookingManagement {
  currentDate = 'Hôm nay, 24 Thg 10';
  
  // 1 hour = 100px
  hourHeight = 120;
  startHour = 8; // 8 AM
  endHour = 16;  // 4 PM
  
  hours = Array.from({ length: this.endHour - this.startHour + 1 }, (_, i) => this.startHour + i);

  isSidebarOpen = false;
  searchQuery = signal('');

  serviceCategories = signal<ServiceCategory[]>([
    {
      name: 'Chăm sóc tóc',
      count: 3,
      services: [
        { name: 'Cắt tóc tạo kiểu', duration: '45p', price: '150.000₫' },
        { name: 'Sấy bồng bềnh', duration: '30p', price: '100.000₫' },
        { name: 'Nhuộm màu thời trang', duration: '1h 30p', price: '500.000₫' }
      ]
    },
    {
      name: 'Làm móng (Nails)',
      count: 2,
      services: [
        { name: 'Cắt da & Sơn gel', duration: '1h', price: '200.000₫' },
        { name: 'Đắp móng bột', duration: '1h 30p', price: '350.000₫' }
      ]
    },
    {
      name: 'Chăm sóc da',
      count: 2,
      services: [
        { name: 'Massage mặt chuyên sâu', duration: '1h', price: '300.000₫' },
        { name: 'Lấy nhân mụn chuẩn y khoa', duration: '45p', price: '250.000₫' }
      ]
    }
  ]);

  filteredServiceCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.serviceCategories();
    
    return this.serviceCategories().map(category => ({
      ...category,
      services: category.services.filter(s => s.name.toLowerCase().includes(query)),
      count: category.services.filter(s => s.name.toLowerCase().includes(query)).length
    })).filter(category => category.count > 0);
  });

  staffs = signal<Staff[]>([
    { id: 1, name: 'Anna', role: 'Kỹ thuật viên nail', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 2, name: 'Ben', role: 'Chuyên viên massage', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 3, name: 'Chloe', role: 'Chuyên viên thẩm mỹ', avatar: 'https://i.pravatar.cc/150?img=9' },
    { id: 4, name: 'Daniel', role: 'Nhà tạo mẫu tóc', avatar: 'https://i.pravatar.cc/150?img=12' }
  ]);

  private readonly bookingService = inject(BookingService);
  private readonly elementRef = inject(ElementRef);
  
  bookings = this.bookingService.bookings;

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
    return this.bookings().filter(b => b.staffId === staffId && (b.status === 'confirmed' || b.status === 'pending'));
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
