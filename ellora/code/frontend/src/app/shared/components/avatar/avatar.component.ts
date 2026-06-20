import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class Avatar {
  src = input<string>();
  name = input.required<string>();
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  initials = computed(() => {
    const n = this.name();
    if (!n) return '';
    return n.split(' ').map(part => part[0]).join('').substring(0, 2).toUpperCase();
  });

  computedClasses = computed(() => {
    const base = 'inline-flex items-center justify-center rounded-full bg-ivory-200 border border-charcoal-800/10 shrink-0 overflow-hidden';
    
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-14 h-14 text-base',
      xl: 'w-20 h-20 text-xl'
    };

    return `${base} ${sizes[this.size()]}`;
  });
}
