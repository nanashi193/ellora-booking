import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Salon } from '../../../models/ellora.model';
import { Rating } from '../rating/rating.component';
import { Badge } from '../badge/badge.component';

@Component({
  selector: 'app-salon-card',
  standalone: true,
  imports: [CommonModule, Rating, Badge],
  templateUrl: './salon-card.component.html',
  styleUrl: './salon-card.component.scss'
})
export class SalonCard {
  salon = input.required<Salon>();
}
