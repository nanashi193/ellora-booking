import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class Profile {
  user = signal({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '+1 (555) 123-4567'
  });
}
