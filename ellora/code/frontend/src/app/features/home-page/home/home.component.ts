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

  bookingCount = signal(1003);
  bookingDigits = computed(() => this.bookingCount().toString().split(''));
  bookingCounterBump = signal(false);
  showBackToTop = signal(false);
  private liveBookingTimer: ReturnType<typeof setTimeout> | undefined;
  private bookingBumpTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.scheduleLiveBookingBump();
  }

  ngOnDestroy(): void {
    clearTimeout(this.liveBookingTimer);
    clearTimeout(this.bookingBumpTimer);
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

  private scheduleLiveBookingBump(): void {
    this.liveBookingTimer = setTimeout(() => {
      this.bookingCount.update((count) => count + this.randomInt(1, 13));
      this.bookingCounterBump.set(true);

      clearTimeout(this.bookingBumpTimer);
      this.bookingBumpTimer = setTimeout(() => {
        this.bookingCounterBump.set(false);
      }, 420);

      this.scheduleLiveBookingBump();
    }, 3000);
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
