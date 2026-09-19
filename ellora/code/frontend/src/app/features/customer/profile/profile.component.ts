import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProfileApiService, Profile as UserProfile } from '../../../services/profile-api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class Profile implements OnInit {
  private readonly profileApi = inject(ProfileApiService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly user = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly showPaymentNotice = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.loadProfile();
    }
  }

  async loadProfile(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.user.set(null);
    try {
      this.user.set(await this.profileApi.getCurrentUser());
    } catch {
      this.error.set('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
    } finally {
      this.loading.set(false);
    }
  }
}
