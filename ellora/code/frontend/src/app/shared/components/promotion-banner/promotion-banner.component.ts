import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Promotion } from '../../../models/ellora.model';
import { Button } from '../button/button.component';

@Component({
  selector: 'app-promotion-banner',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './promotion-banner.component.html',
  styleUrl: './promotion-banner.component.scss'
})
export class PromotionBanner {
  promotion = input.required<Promotion>();
}
