import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { ServiceCard } from '../../shared/components/service-card/service-card.component';
import { Service } from '../../models/ellora.model';

@Component({
  selector: 'app-salon-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ServiceCard],
  templateUrl: './salon-details.component.html',
  styleUrl: './salon-details.component.scss'
})
export class SalonDetails {
  private dataService = inject(MockDataService);

  salon = computed(() => this.dataService.salons()[0]);
  services = this.dataService.services;
  reviews = this.dataService.reviews;

  // Service tabs
  readonly tabs = ['Nổi bật', 'Làm móng tay', 'Nối móng', 'Nghệ thuật làm móng'];
  activeTab = signal('Nổi bật');

  // Selected services for booking widget
  selectedServices = signal<Service[]>([]);

  filteredServices = computed(() => {
    // For now, "Nổi bật" shows all. Other tabs would filter by category when data supports it.
    return this.services();
  });

  totalPrice = computed(() => {
    return this.selectedServices().reduce((sum, s) => sum + s.price, 0);
  });

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  addService(service: Service): void {
    const current = this.selectedServices();
    if (current.some(s => s.id === service.id)) {
      return;
    }
    this.selectedServices.set([...current, service]);
  }

  removeService(serviceId: string): void {
    this.selectedServices.update(list => list.filter(s => s.id !== serviceId));
  }

  getOpenStatusText(): string {
    const s = this.salon();
    if (!s) return '';
    return s.isOpen ? 'Đang mở cửa' : 'Đã đóng cửa';
  }

  getCloseTimeText(): string {
    return 'Đóng cửa lúc 8:00 Tối';
  }

  getGoogleMapsUrl(): string {
    const s = this.salon();
    if (!s) return '#';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address + ', ' + s.city)}`;
  }

  getRelativeTime(dateString: string): string {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Hôm nay';
    if (days === 1) return '1 ngày trước';
    if (days < 7) return `${days} ngày trước`;
    if (days < 14) return '1 tuần trước';
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    return `${Math.floor(days / 30)} tháng trước`;
  }
}
