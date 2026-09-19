import { Component, inject, computed, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SalonApiService } from '../../services/salon-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ServiceCard } from '../../shared/components/service-card/service-card.component';
import { Salon, Review, Service } from '../../models/ellora.model';

@Component({
  selector: 'app-salon-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ServiceCard],
  templateUrl: './salon-details.component.html',
  styleUrl: './salon-details.component.scss'
})
export class SalonDetails implements OnInit {
  private dataService = inject(SalonApiService);

  private route = inject(ActivatedRoute);
  private destroy = inject(DestroyRef);
  private request = 0;
  salon = signal<Salon | null>(null);
  services = signal<Service[]>([]);
  reviews = signal<Review[]>([]);
  loading = signal(true); error = signal(''); reviewPage = signal(0); reviewsLast = signal(true); reviewsLoading = signal(false); reviewError = signal('');
  ngOnInit() { this.route.paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(() => { void this.load(); }); }
  async load() {
    const request = ++this.request;
    this.loading.set(true); this.error.set(''); this.salon.set(null); this.services.set([]); this.reviews.set([]); this.selectedServices.set([]);
    const id = this.route.snapshot.paramMap.get('id') || '';
    try { const [salon, services, reviews] = await Promise.all([this.dataService.detail(id), this.dataService.services(id), this.dataService.reviews(id)]);
      if(request !== this.request) return;
      this.salon.set(salon); this.services.set(services); this.reviews.set(reviews.content); this.reviewPage.set(0); this.reviewsLast.set(reviews.last);
    } catch { if(request === this.request) this.error.set('Không tải được salon hoặc salon chưa được duyệt.'); }
    finally { if(request === this.request) this.loading.set(false); }
  }
  async moreReviews() {
    const id = this.salon()?.id; if(!id || this.reviewsLoading()) return;
    this.reviewsLoading.set(true); this.reviewError.set('');
    try { const result = await this.dataService.reviews(id, this.reviewPage()+1); if(this.salon()?.id !== id) return; this.reviews.update(items=>[...items,...result.content]); this.reviewPage.set(result.pageNumber); this.reviewsLast.set(result.last); }
    catch { this.reviewError.set('Không tải được thêm đánh giá.'); } finally { this.reviewsLoading.set(false); }
  }
  // Service tabs
  readonly tabs = ['Dịch vụ'];
  activeTab = signal('Dịch vụ');

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
    this.selectedServices.set([service]);
  }

  removeService(serviceId: string): void {
    this.selectedServices.update(list => list.filter(s => s.id !== serviceId));
  }

  getOpenStatusText(): string {
    const s = this.salon();
    if (!s) return '';
    return 'Liên hệ salon để biết giờ mở cửa';
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
