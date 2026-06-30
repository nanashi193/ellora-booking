import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="font-serif text-2xl text-charcoal-900">Bảo mật tài khoản</h2>
      </div>
      
      <div class="bg-white rounded-2xl shadow-sm border border-charcoal-800/5 p-8 text-center text-charcoal-800/60 py-16">
        Tính năng đổi mật khẩu và cài đặt bảo mật đang được cập nhật.
      </div>
    </div>
  `
})
export class SecurityComponent {}
