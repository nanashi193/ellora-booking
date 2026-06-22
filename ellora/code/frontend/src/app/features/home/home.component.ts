import { Component, inject, computed, ViewChild, ElementRef, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../services/mock-data.service';
import { SalonCard } from '../../shared/components/salon-card/salon-card.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SalonCard],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class Home implements AfterViewInit {
  private dataService = inject(MockDataService);
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;
  
  canScrollLeft = signal(false);
  canScrollRight = signal(true);
  
  salons = this.dataService.salons;
  categories = this.dataService.categories;
  
  promo = computed(() => ({
    id: 'p1',
    title: 'Elevate your business with Ellora.',
    description: 'Join our curated network of premium wellness providers and reach clients who value quality.',
  }));

  ngAfterViewInit() {
    setTimeout(() => this.checkScroll(), 100);
  }

  onScroll() {
    this.checkScroll();
  }

  checkScroll() {
    if (!this.scrollContainer) return;
    const el = this.scrollContainer.nativeElement;
    this.canScrollLeft.set(el.scrollLeft > 0);
    this.canScrollRight.set(Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth);
  }

  scrollLeft() {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      const cardWidth = el.clientWidth > 768 ? el.clientWidth / 3 : el.clientWidth;
      el.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      const cardWidth = el.clientWidth > 768 ? el.clientWidth / 3 : el.clientWidth;
      el.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  }
}
