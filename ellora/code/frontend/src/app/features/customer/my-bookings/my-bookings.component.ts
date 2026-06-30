import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookings {
  activeTab = signal<'all' | 'upcoming' | 'completed'>('all');

  bookings = signal([
    {
      id: 'BK-101',
      service: 'Nối mi Classic tự nhiên',
      salonName: 'Ellora Boutique - Quận 1',
      date: '30 Tháng 5, 2024',
      time: '10:00',
      price: '350.000đ',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1512496015851-a1c8ae9db134?auto=format&fit=crop&q=80&w=200&h=200'
    },
    {
      id: 'BK-100',
      service: 'Sơn Gel & Trang trí đá',
      salonName: 'Ellora Boutique - Quận 1',
      date: '24 Tháng 5, 2024',
      time: '14:00',
      price: '250.000đ',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=200&h=200'
    },
    {
      id: 'BK-099',
      service: 'Chăm sóc móng tay cơ bản',
      salonName: 'Ellora Spa - Quận 7',
      date: '10 Tháng 5, 2024',
      time: '09:30',
      price: '150.000đ',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=200&h=200'
    }
  ]);

  filteredBookings = computed(() => {
    const currentTab = this.activeTab();
    if (currentTab === 'all') return this.bookings();
    return this.bookings().filter(b => b.status === currentTab);
  });
}
