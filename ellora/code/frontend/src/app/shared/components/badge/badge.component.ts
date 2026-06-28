import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class Badge {
  color = input<'dusty-pink' | 'gray' | 'dark' | 'outline'>('gray');
  size = input<'sm' | 'md'>('sm');

  computedClasses = computed(() => {
    const base = 'inline-flex items-center font-medium rounded-full';
    
    const colors = {
      'dusty-pink': 'bg-dusty-pink-500/10 text-dusty-pink-600',
      'gray': 'bg-ivory-200 text-charcoal-800',
      'dark': 'bg-charcoal-900 text-white',
      'outline': 'bg-transparent border border-charcoal-800 text-charcoal-800'
    };

    const sizes = {
      sm: 'px-2.5 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm'
    };

    return `${base} ${colors[this.color()]} ${sizes[this.size()]}`;
  });
}
