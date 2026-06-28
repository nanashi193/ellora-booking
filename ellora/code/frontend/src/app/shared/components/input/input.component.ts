import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class Input {
  id = input<string>(`input-${Math.random().toString(36).substr(2, 9)}`);
  label = input<string>();
  type = input<string>('text');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  value = input<string>('');
  error = input<string>();
  icon = input<boolean>(false); // Just a boolean to reserve space for icon projection

  valueChange = output<string>();

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
