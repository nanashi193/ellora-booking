import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  registerForm = this.formBuilder.group(
    {
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  submitted = false;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  showAlert = false;
  isSuccess = false;

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

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async register(): Promise<void> {
    this.submitted = true;
    this.showAlert = false;
    this.isSuccess = false;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showAlert = true;
      return;
    }

    this.isLoading = true;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    this.isLoading = false;
    this.isSuccess = true;
  }
}
