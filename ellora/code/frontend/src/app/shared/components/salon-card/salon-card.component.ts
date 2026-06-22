import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Salon } from '../../../models/ellora.model';
import { Badge } from '../badge/badge.component';

@Component({
  selector: 'app-salon-card',
  standalone: true,
  imports: [CommonModule, Badge],
  templateUrl: './salon-card.component.html',
  styleUrl: './salon-card.component.scss'
})
export class SalonCard {
  salon = input.required<Salon>();
}
