import { Component, inject, computed, OnInit, OnDestroy, signal, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MockDataService } from '../../../services/mock-data.service';
import { SalonCarouselComponent } from '../../../shared/components/salon-carousel/salon-carousel.component';
import { RouterModule } from '@angular/router';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';
import { SalonApiService } from '../../../services/salon-api.service';
import { Salon } from '../../../models/ellora.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SalonCarouselComponent, RevealOnScrollDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class Home implements OnInit, OnDestroy {
  private dataService = inject(MockDataService);
  private salonApi = inject(SalonApiService);
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);
  private scrollFrame = 0;
  private readonly handleScroll = () => {
    if (this.scrollFrame) return;
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = 0;
      const shouldShow = window.scrollY > 360;
      if (this.showBackToTop() !== shouldShow) {
        this.zone.run(() => this.showBackToTop.set(shouldShow));
      }
    });
  };

  salons = signal<Salon[]>([]);
  salonError = signal('');
  searchKeyword = signal('');
  topSalons = computed(() => {
    return [...this.salons()].sort((a, b) => b.rating - a.rating).slice(0, 5);
  });

  categories = this.dataService.categories;

  showBackToTop = signal(false);

  ngOnInit(): void {
    void this.loadSalons();
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => window.addEventListener('scroll', this.handleScroll, { passive: true }));
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.handleScroll);
      if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
    }
  }

  private async loadSalons(): Promise<void> {
    try { this.salons.set((await this.salonApi.search()).content); }
    catch { this.salonError.set('Không tải được danh sách salon. Vui lòng thử lại.'); }
  }

  scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
