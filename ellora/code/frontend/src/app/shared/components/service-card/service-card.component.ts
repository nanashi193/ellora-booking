import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '../../../models/ellora.model';
import { Button } from '../button/button.component';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss'
})
export class ServiceCard {
  service = input.required<Service>();
  book = output<Service>();

  onBook() {
    this.book.emit(this.service());
  }
}
