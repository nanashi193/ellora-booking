import { Component, inject, computed, HostListener, OnInit, OnDestroy, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MockDataService } from '../../../services/mock-data.service';
import { SalonCarouselComponent } from '../../../shared/components/salon-carousel/salon-carousel.component';
import { RouterModule } from '@angular/router';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SalonCarouselComponent, RevealOnScrollDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class Home implements OnInit, OnDestroy {
  private dataService = inject(MockDataService);
  private platformId = inject(PLATFORM_ID);

  salons = this.dataService.salons;
  topSalons = computed(() => {
    return [...this.salons()].sort((a, b) => b.rating - a.rating).slice(0, 5);
  });

  categories = this.dataService.categories;

  // Trust indicator: animated counter
  bookingCount = signal(0);
  showBackToTop = signal(false);
  private targetBookingCount = 247;
  private animationInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Animate counter from 0 to target over ~1.2s
    const duration = 1200;
    const steps = 60;
    const increment = this.targetBookingCount / steps;
    let current = 0;
    this.animationInterval = setInterval(() => {
      current += increment;
      if (current >= this.targetBookingCount) {
        this.bookingCount.set(this.targetBookingCount);
        clearInterval(this.animationInterval);
      } else {
        this.bookingCount.set(Math.floor(current));
      }
    }, duration / steps);
  }

  ngOnDestroy(): void {
    clearInterval(this.animationInterval);
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
