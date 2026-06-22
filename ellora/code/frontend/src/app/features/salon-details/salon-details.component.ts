import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { Rating } from '../../shared/components/rating/rating.component';
import { Button } from '../../shared/components/button/button.component';
import { Badge } from '../../shared/components/badge/badge.component';
import { ServiceCard } from '../../shared/components/service-card/service-card.component';
import { Avatar } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-salon-details',
  standalone: true,
  imports: [CommonModule, RouterModule, Rating, Button, Badge, ServiceCard, Avatar],
  templateUrl: './salon-details.component.html',
  styleUrl: './salon-details.component.scss'
})
export class SalonDetails {
  private dataService = inject(MockDataService);
  
  // In a real app we'd get ID from route params, here we just pick the first salon
  salon = computed(() => this.dataService.salons()[0]);
  services = this.dataService.services;
  staff = this.dataService.staff;
  reviews = this.dataService.reviews;
}
