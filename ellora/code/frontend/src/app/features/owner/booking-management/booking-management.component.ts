import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Staff {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Booking {
  id: string;
  staffId: string;
  customerName: string;
  service: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  status: 'confirmed' | 'pending';
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

  staffs = signal<Staff[]>([
    { id: 'S1', name: 'Anna', role: 'Kỹ thuật viên nail', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 'S2', name: 'Ben', role: 'Chuyên viên massage', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 'S3', name: 'Chloe', role: 'Chuyên viên thẩm mỹ', avatar: 'https://i.pravatar.cc/150?img=9' }
  ]);

  bookings = signal<Booking[]>([
    {
      id: 'B1',
      staffId: 'S1',
      customerName: 'Sarah Jenkins',
      service: 'Làm móng gel & Chăm sóc chân',
      startTime: '08:30',
      endTime: '10:00',
      status: 'confirmed'
    },
    {
      id: 'B2',
      staffId: 'S2',
      customerName: 'Michael Chang',
      service: 'Massage mô sâu (60p)',
      startTime: '10:00',
      endTime: '11:00',
      status: 'pending'
    },
    {
      id: 'B3',
      staffId: 'S3',
      customerName: 'Emma Davis',
      service: 'Chăm sóc da mặt đặc trưng',
      startTime: '09:00',
      endTime: '10:00',
      status: 'confirmed'
    }
  ]);

  getTopPosition(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    const decimalHours = hours + (minutes / 60);
    return (decimalHours - this.startHour) * this.hourHeight;
  }

  getHeight(startTime: string, endTime: string): number {
    const [sHours, sMinutes] = startTime.split(':').map(Number);
    const [eHours, eMinutes] = endTime.split(':').map(Number);
    
    const startDec = sHours + (sMinutes / 60);
    const endDec = eHours + (eMinutes / 60);
    
    return (endDec - startDec) * this.hourHeight;
  }

  getBookingsForStaff(staffId: string): Booking[] {
    return this.bookings().filter(b => b.staffId === staffId);
  }

  formatHour(hour: number): string {
    if (hour === 12) return '12 TRƯA';
    if (hour > 12) return `${hour - 12} CHIỀU`;
    return `${hour} SÁNG`;
  }
}
