import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterRequest } from '../../../models/auth.model';
import { AuthService } from '../../../services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!confirmPassword || password === confirmPassword) {
    return null;
  }

  return { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  registerForm = this.formBuilder.group(
    {
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  confirmationForm = this.formBuilder.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  submitted = false;
  confirmationSubmitted = false;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  isResending = false;
  resendCooldown = 0;
  showAlert = false;
  isSuccess = false;
  requiresConfirmation = false;
  alertMessage = '';
  resendMessage = '';

  get fullNameInvalid(): boolean {
    const control = this.registerForm.controls.fullName;
    return control.invalid && (control.touched || this.submitted);
  }

  get emailInvalid(): boolean {
    const control = this.registerForm.controls.email;
    return control.invalid && (control.touched || this.submitted);
  }

  get passwordInvalid(): boolean {
    const control = this.registerForm.controls.password;
    return control.invalid && (control.touched || this.submitted);
  }

  get confirmPasswordInvalid(): boolean {
    const control = this.registerForm.controls.confirmPassword;
    return (
      (control.invalid || this.registerForm.hasError('passwordsMismatch')) &&
      (control.touched || this.submitted)
    );
  }

  get confirmationCodeInvalid(): boolean {
    const control = this.confirmationForm.controls.code;
    return control.invalid && (control.touched || this.confirmationSubmitted);
  }

  get hasMinLength(): boolean {
    return (this.registerForm.controls.password.value || '').length >= 8;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.registerForm.controls.password.value || '');
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.registerForm.controls.password.value || '');
  }

  get hasNumber(): boolean {
    return /\d/.test(this.registerForm.controls.password.value || '');
  }

  get hasSpecialChar(): boolean {
    return /[^A-Za-z0-9]/.test(this.registerForm.controls.password.value || '');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async registerWithGoogle(): Promise<void> {
    this.showAlert = false;
    this.alertMessage = '';
    const result = await this.authService.loginWithGoogle();

    if (!result.success) {
      this.showAlert = true;
      this.alertMessage = result.message ?? 'Không thể tiếp tục bằng Google.';
      this.changeDetectorRef.detectChanges();
    }
  }

  async register(): Promise<void> {
    this.submitted = true;
    this.showAlert = false;
    this.isSuccess = false;
    this.alertMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showAlert = true;
      this.alertMessage = 'Vui lòng kiểm tra lại thông tin đăng ký.';
      return;
    }

    this.isLoading = true;
    try {
      const { fullName, email, password } = this.registerForm.getRawValue();
      const result = await this.authService.register({
        fullName,
        email,
        password,
      } as RegisterRequest);

      this.requiresConfirmation = result.requiresConfirmation;
      this.isSuccess = result.success;
      this.showAlert = !result.success && !result.requiresConfirmation;
      this.alertMessage = result.message ?? '';
      this.changeDetectorRef.detectChanges();
    } catch {
      this.showAlert = true;
      this.alertMessage = 'Không thể đăng ký lúc này. Vui lòng thử lại.';
    } finally {
      this.isLoading = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  async confirmRegistration(): Promise<void> {
    this.confirmationSubmitted = true;
    this.showAlert = false;
    this.alertMessage = '';

    if (this.confirmationForm.invalid) {
      this.confirmationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    try {
      const result = await this.authService.confirmRegistration(
        this.registerForm.controls.email.value,
        this.confirmationForm.controls.code.value,
      );

      this.isSuccess = result.success;
      this.requiresConfirmation = result.requiresConfirmation;
      this.showAlert = !result.success;
      this.alertMessage = result.message ?? '';

      if (result.success) {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        void this.router.navigateByUrl('/login');
        return;
      }
    } catch {
      this.showAlert = true;
      this.alertMessage = 'Không thể xác nhận email lúc này. Vui lòng thử lại.';
    } finally {
      this.isLoading = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  async resendConfirmationCode(): Promise<void> {
    if (this.isResending || this.resendCooldown > 0) {
      return;
    }

    const email = this.registerForm.controls.email.value;
    this.resendMessage = '';

    if (!email) {
      this.showAlert = true;
      this.alertMessage = 'Không tìm thấy email đăng ký.';
      return;
    }

    this.isResending = true;
    try {
      const result = await this.authService.resendConfirmationCode(email);

      if (result.success) {
        this.showAlert = false;
        this.alertMessage = '';
        this.resendMessage = result.message ?? 'Đã gửi lại mã xác nhận.';
        this.startResendCooldown();
        this.changeDetectorRef.detectChanges();
        return;
      }

      this.showAlert = true;
      this.alertMessage = result.message ?? 'Không thể gửi lại mã xác nhận.';
    } catch {
      this.showAlert = true;
      this.alertMessage = 'Không thể gửi lại mã xác nhận lúc này.';
    } finally {
      this.isResending = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  private startResendCooldown(): void {
    this.resendCooldown = 30;
    const timer = setInterval(() => {
      this.resendCooldown -= 1;
      this.changeDetectorRef.detectChanges();

      if (this.resendCooldown <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  }
}
