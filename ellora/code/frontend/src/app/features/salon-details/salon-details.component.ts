import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SalonApiService } from '../../services/salon-api.service';
import { ServiceCard } from '../../shared/components/service-card/service-card.component';
import { Review, Salon, Service } from '../../models/ellora.model';

@Component({
  selector: 'app-salon-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ServiceCard],
  templateUrl: './salon-details.component.html',
  styleUrl: './salon-details.component.scss'
})
export class SalonDetails implements OnInit, AfterViewInit, OnDestroy {
  private salonApi = inject(SalonApiService);
  private route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private titleObserver?: IntersectionObserver;

  salon = signal<Salon | null>(null);
  services = signal<Service[]>([]);
  reviews = signal<Review[]>([]);
  error = signal('');
  showStickySummary = signal(false);
  nearbySalons = signal<Salon[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.salon.set(null); this.services.set([]); this.reviews.set([]); this.selectedServices.set([]);
    try {
      const [salon, services, reviews, nearby] = await Promise.all([
        this.salonApi.detail(id), this.salonApi.services(id), this.salonApi.reviews(id), this.salonApi.search('', 0, 5)
      ]);
      this.salon.set(salon); this.services.set(services); this.reviews.set(reviews.content);
      this.nearbySalons.set(nearby.content.filter(item => item.id !== id).slice(0, 4));
      this.error.set('');
      if (isPlatformBrowser(this.platformId)) setTimeout(() => this.observeTitle(), 0);
    } catch { this.error.set('Không tải được thông tin salon. Vui lòng thử lại.'); }
  }

  @ViewChild('salonTitle')
  private salonTitle?: ElementRef<HTMLElement>;

  // Service tabs
  readonly tabs = ['Nổi bật', 'Làm móng tay', 'Nối móng', 'Nghệ thuật làm móng'];
  activeTab = signal('Nổi bật');
  readonly bookingHours: readonly (readonly [string, string])[] = [];

  // Selected services for booking widget
  selectedServices = signal<Service[]>([]);

  filteredServices = computed(() => {
    // For now, "Nổi bật" shows all. Other tabs would filter by category when data supports it.
    return this.services();
  });

  ngAfterViewInit(): void {
    this.observeTitle();
  }

  private observeTitle(): void {
    if (!isPlatformBrowser(this.platformId) || !this.salonTitle?.nativeElement || !window.matchMedia('(min-width: 1024px)').matches) {
      return;
    }

    this.titleObserver?.disconnect();
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
    this.selectedServices.set([service]);
  }

  getOpenStatusText(): string {
    const s = this.salon();
    if (!s) return '';
    return s.isOpen === undefined ? 'Chưa có giờ mở cửa' : s.isOpen ? 'Đang mở cửa' : 'Đã đóng cửa';
  }

  getCloseTimeText(): string {
    return '';
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
