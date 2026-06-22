import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../services/mock-data.service';
import { SalonCard } from '../../shared/components/salon-card/salon-card.component';
import { Badge } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SalonCard, Badge],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class Search {
  private dataService = inject(MockDataService);
  
  salons = this.dataService.salons;
  categories = this.dataService.categories;
}
