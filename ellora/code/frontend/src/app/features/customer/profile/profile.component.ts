import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileApiService } from '../../../services/profile-api.service';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class Profile implements OnInit {
  private profileApi = inject(ProfileApiService);

  user = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatarUrl: ''
  });

  async ngOnInit(): Promise<void> {
    try {
      const profile = await this.profileApi.getCurrentUser();
      
      // Tách tên thành First/Last name đơn giản (hoặc gán hết vào firstName nếu cần)
      const nameParts = (profile.fullName || '').split(' ');
      const lastName = nameParts.length > 1 ? nameParts.pop() || '' : '';
      const firstName = nameParts.join(' ') || profile.fullName;

      this.user.set({
        firstName: firstName,
        lastName: lastName,
        email: profile.email || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || ''
      });
    } catch (error) {
      console.error('Lỗi khi tải thông tin cá nhân:', error);
    }
  }
}
