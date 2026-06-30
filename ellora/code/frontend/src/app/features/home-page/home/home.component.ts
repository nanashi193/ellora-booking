import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../services/mock-data.service';
import { SalonCarouselComponent } from '../../../shared/components/salon-carousel/salon-carousel.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SalonCarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class Home {
  private dataService = inject(MockDataService);
  
  salons = this.dataService.salons;
  topSalons = computed(() => {
    return [...this.salons()].sort((a, b) => b.rating - a.rating).slice(0, 5);
  });
  
  categories = this.dataService.categories;
  
  promo = computed(() => ({
    id: 'p1',
    title: 'Elevate your business with Ellora.',
    description: 'Join our curated network of premium wellness providers and reach clients who value quality.',
  }));

}
