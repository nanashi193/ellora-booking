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
import { AuthService } from '../../../services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return !confirmPassword || password === confirmPassword
    ? null
    : { passwordsMismatch: true };
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  emailForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetForm = this.formBuilder.group(
    {
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
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

  codeSent = false;
  submitted = false;
  isLoading = false;
  isResending = false;
  resendCooldown = 0;
  showPassword = false;
  showConfirmPassword = false;
  alertMessage = '';
  isSuccess = false;

  get emailInvalid(): boolean {
    const control = this.emailForm.controls.email;
    return control.invalid && (control.touched || this.submitted);
  }

  get codeInvalid(): boolean {
    const control = this.resetForm.controls.code;
    return control.invalid && (control.touched || this.submitted);
  }

  get passwordInvalid(): boolean {
    const control = this.resetForm.controls.password;
    return control.invalid && (control.touched || this.submitted);
  }

  get confirmPasswordInvalid(): boolean {
    const control = this.resetForm.controls.confirmPassword;
    return (
      (control.invalid || this.resetForm.hasError('passwordsMismatch')) &&
      (control.touched || this.submitted)
    );
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async sendCode(): Promise<void> {
    this.submitted = true;
    this.alertMessage = '';

    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    try {
      const result = await this.authService.requestPasswordReset(
        this.emailForm.controls.email.value,
      );
      this.codeSent = result.success;
      this.alertMessage = result.message ?? '';
      this.submitted = false;
    } finally {
      this.isLoading = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  async resetPassword(): Promise<void> {
    this.submitted = true;
    this.alertMessage = '';

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    try {
      const values = this.resetForm.getRawValue();
      const result = await this.authService.confirmPasswordReset(
        this.emailForm.controls.email.value,
        values.code,
        values.password,
      );

      this.isSuccess = result.success;
      this.alertMessage = result.message ?? '';

      if (result.success) {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        void this.router.navigateByUrl('/login');
      }
    } finally {
      this.isLoading = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  async resendCode(): Promise<void> {
    if (this.isResending || this.resendCooldown > 0) {
      return;
    }

    this.alertMessage = '';
    this.isResending = true;
    try {
      const result = await this.authService.requestPasswordReset(
        this.emailForm.controls.email.value,
      );
      this.alertMessage = result.message ?? '';

      if (result.success) {
        this.startResendCooldown();
      }
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
