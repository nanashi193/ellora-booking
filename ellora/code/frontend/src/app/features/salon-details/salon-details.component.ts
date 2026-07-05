import { AfterViewInit, Component, ElementRef, OnDestroy, PLATFORM_ID, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
export class SalonDetails implements AfterViewInit, OnDestroy {
  private dataService = inject(MockDataService);
  private readonly platformId = inject(PLATFORM_ID);
  private titleObserver?: IntersectionObserver;

  salon = computed(() => this.dataService.salons()[0]);
  services = this.dataService.services;
  reviews = this.dataService.reviews;
  showStickySummary = signal(false);
  nearbySalons = computed(() => this.dataService.salons().slice(0, 4));

  @ViewChild('salonTitle')
  private salonTitle?: ElementRef<HTMLElement>;

  // Service tabs
  readonly tabs = ['Nổi bật', 'Làm móng tay', 'Nối móng', 'Nghệ thuật làm móng'];
  activeTab = signal('Nổi bật');
  readonly bookingHours = [
    ['Monday', '10:00 AM - 8:00 PM'],
    ['Tuesday', '10:00 AM - 8:00 PM'],
    ['Wednesday', '10:00 AM - 8:00 PM'],
    ['Thursday', '10:00 AM - 8:00 PM'],
    ['Friday', '10:00 AM - 8:00PM'],
    ['Saturday', '10:00 AM - 8:00 PM'],
    ['Sunday', '10:00 AM - 8:00 PM']
  ] as const;

  // Selected services for booking widget
  selectedServices = signal<Service[]>([]);

  filteredServices = computed(() => {
    // For now, "Nổi bật" shows all. Other tabs would filter by category when data supports it.
    return this.services();
  });

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.salonTitle?.nativeElement || !window.matchMedia('(min-width: 1024px)').matches) {
      return;
    }

    this.titleObserver = new IntersectionObserver(
      ([entry]) => {
        this.showStickySummary.set(!entry.isIntersecting && entry.boundingClientRect.top < 96);
      },
      { rootMargin: '-96px 0px 0px 0px', threshold: 0 }
    );
    this.titleObserver.observe(this.salonTitle.nativeElement);
  }

  ngOnDestroy(): void {
    this.titleObserver?.disconnect();
  }

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
