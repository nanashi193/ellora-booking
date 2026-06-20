import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss'
})
export class SectionHeader {
  title = input.required<string>();
  subtitle = input<string>();
  linkText = input<string>();
  linkHref = input<string>('#');
}
