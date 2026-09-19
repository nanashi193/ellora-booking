import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly profile = signal<{ email: string; name: string } | null>(null);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly showPasswords = signal(false);
  readonly passwordForm = inject(NonNullableFormBuilder).group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)]],
    confirmPassword: ['', Validators.required],
  });

  async ngOnInit(): Promise<void> {
    try {
      this.profile.set(await this.authService.getUserProfile());
    } catch {
      this.error.set('Không thể tải thông tin tài khoản. Vui lòng kiểm tra phiên đăng nhập.');
    }
  }

  async changePassword(): Promise<void> {
    if (this.saving()) return;
    this.error.set('');
    this.success.set('');
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) {
      this.error.set('Điền đủ mật khẩu. Mật khẩu mới cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.error.set('Mật khẩu nhập lại không khớp.');
      return;
    }
    if (newPassword === currentPassword) {
      this.error.set('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }
    this.saving.set(true);
    this.passwordForm.disable();
    try {
      const result = await this.authService.changePassword(currentPassword, newPassword);
      if (result.success) {
        this.passwordForm.reset();
        this.showPasswords.set(false);
        this.success.set('Đổi mật khẩu thành công.');
      } else {
        this.error.set(result.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
      }
    } catch {
      this.error.set('Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      this.passwordForm.enable();
      this.saving.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
}
