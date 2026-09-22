import { Component, inject, computed, HostListener, OnInit, signal, PLATFORM_ID } from '@angular/core';
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
export class Home implements OnInit {
  private dataService = inject(MockDataService);
  private salonApi = inject(SalonApiService);
  private platformId = inject(PLATFORM_ID);

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
  }

  private async loadSalons(): Promise<void> {
    try { this.salons.set((await this.salonApi.search()).content); }
    catch { this.salonError.set('Không tải được danh sách salon. Vui lòng thử lại.'); }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.showBackToTop.set(window.scrollY > 360);
  }

  scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
