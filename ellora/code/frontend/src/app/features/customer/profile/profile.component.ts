import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class Profile implements OnInit {
  private authService = inject(AuthService);

  user = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  async ngOnInit(): Promise<void> {
    try {
      const profile = await this.authService.getUserProfile();
      
      // Tách tên thành First/Last name đơn giản (hoặc gán hết vào firstName nếu cần)
      const nameParts = (profile.name || '').split(' ');
      const lastName = nameParts.length > 1 ? nameParts.pop() || '' : '';
      const firstName = nameParts.join(' ') || profile.name;

      this.user.set({
        firstName: firstName,
        lastName: lastName,
        email: profile.email || '',
        phone: profile.phone_number || ''
      });
    } catch (error) {
      console.error('Lỗi khi tải thông tin cá nhân:', error);
    }
  }
}
