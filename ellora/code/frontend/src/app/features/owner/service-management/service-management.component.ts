import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-management.component.html',
  styleUrl: './service-management.component.scss'
})
export class ServiceManagement {
  services = signal([
    { id: 1, name: 'Classic Gel Manicure', category: 'Nails', duration: '45 mins', price: '$45', status: 'Active' },
    { id: 2, name: 'Spa Pedicure', category: 'Nails', duration: '60 mins', price: '$55', status: 'Active' },
    { id: 3, name: 'Acrylic Extensions', category: 'Nails', duration: '90 mins', price: '$85', status: 'Inactive' }
  ]);
}
