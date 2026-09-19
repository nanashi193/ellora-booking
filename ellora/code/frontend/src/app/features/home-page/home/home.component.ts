import { Component, inject, ViewChild, ElementRef, signal, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonApiService } from '../../../services/salon-api.service';
import { Salon } from '../../../models/ellora.model';
import { FormsModule } from '@angular/forms';
import { SalonCard } from '../../../shared/components/salon-card/salon-card.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SalonCard, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class Home implements AfterViewInit, OnInit {
  private dataService = inject(SalonApiService);
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;
  
  canScrollLeft = signal(false);
  canScrollRight = signal(false);
  
  salons = signal<Salon[]>([]);
  loading = signal(true);
  error = signal('');
  keyword = '';
  ngOnInit() { void this.load(); }
  async load() {
    this.loading.set(true); this.error.set(''); this.salons.set([]);
    try { this.salons.set((await this.dataService.search('', 0, 12)).content); setTimeout(() => this.checkScroll()); }
    catch { this.error.set('Không tải được danh sách salon. Vui lòng thử lại.'); }
    finally { this.loading.set(false); }
  }
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
