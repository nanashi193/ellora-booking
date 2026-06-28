import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Salon } from '../../../models/ellora.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-salon-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './salon-card.component.html',
  styleUrl: './salon-card.component.scss'
})
export class SalonCard {
  salon = input.required<Salon>();
}
