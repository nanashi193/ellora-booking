import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfileApiService, Profile as UserProfile } from '../../../services/profile-api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ReactiveFormsModule],
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
  readonly adminView = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly success = signal('');
  avatarFile: File | null = null;
  readonly form = inject(NonNullableFormBuilder).group({
    fullName: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/\S/)]],
    phone: ['', [Validators.pattern(/^$|^[+0-9 ()-]{8,20}$/)]],
  });

  resetForm(): void {
    const profile = this.user();
    if (profile) this.form.reset({ fullName: profile.fullName, phone: profile.phone || '' });
    this.saveError.set('');this.success.set('');
  }

  async save(): Promise<void> {
    if (this.saving()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);this.saveError.set('');this.success.set('');this.form.disable();
    try {
      const value = this.form.getRawValue();
      this.user.set(await this.profileApi.update({fullName:value.fullName.trim(),phone:value.phone.trim()}));
      this.resetForm();this.success.set('Đã lưu thông tin cá nhân.');
    } catch (e) { this.showSaveError(e); }
    finally { this.saving.set(false);this.form.enable(); }
  }

  chooseAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];input.value='';this.avatarFile=null;this.saveError.set('');
    if (!file) return;
    if (!['image/jpeg','image/png'].includes(file.type) || file.size>5*1024*1024) {
      this.saveError.set('Chọn ảnh JPG hoặc PNG, tối đa 5 MB.');return;
    }
    this.avatarFile=file;
  }

  async uploadAvatar(): Promise<void> {
    if (!this.avatarFile || this.saving()) return;
    this.saving.set(true);this.saveError.set('');this.success.set('');
    try {
      this.user.set(await this.profileApi.uploadAvatar(this.avatarFile));
      this.avatarFile=null;this.success.set('Đã cập nhật ảnh đại diện.');
    } catch(e) { this.showSaveError(e); }
    finally { this.saving.set(false); }
  }

  private showSaveError(e: unknown): void {
    this.saveError.set(e instanceof HttpErrorResponse && typeof e.error?.message==='string'
      ? e.error.message : 'Không lưu được thay đổi. Vui lòng thử lại.');
  }

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
      this.resetForm();
    } catch {
      this.error.set('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
    } finally {
      this.loading.set(false);
    }
  }
}
