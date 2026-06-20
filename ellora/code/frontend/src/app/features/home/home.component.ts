import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../services/mock-data.service';
import { SalonCard } from '../../shared/components/salon-card/salon-card.component';
import { SectionHeader } from '../../shared/components/section-header/section-header.component';
import { PromotionBanner } from '../../shared/components/promotion-banner/promotion-banner.component';
import { Badge } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SalonCard, SectionHeader, PromotionBanner, Badge],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class Home {
  private dataService = inject(MockDataService);
  
  salons = this.dataService.salons;
  categories = this.dataService.categories;
  
  promo = computed(() => ({
    id: 'p1',
    title: 'Elevate your business with Ellora.',
    description: 'Join our curated network of premium wellness providers and reach clients who value quality.',
  }));
}
