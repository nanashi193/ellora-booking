import { Component, ElementRef, Input, ViewChild, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Salon } from '../../../models/ellora.model';
import { SalonCard } from '../salon-card/salon-card.component';

@Component({
  selector: 'app-salon-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule, SalonCard],
  templateUrl: './salon-carousel.component.html',
  styleUrl: './salon-carousel.component.scss'
})
export class SalonCarouselComponent implements AfterViewInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) viewAllLink!: string;
  @Input({ required: true }) salons: Salon[] = [];

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  canScrollLeft = signal(false);
  canScrollRight = signal(true);

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
