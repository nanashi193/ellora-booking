import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);

  email = '';
  password = '';
  remember = false;
  showPassword = false;
  isLoading = false;
  showAlert = false;
  emailError = false;
  passwordError = false;
  isSuccess = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async login(): Promise<void> {
    this.showAlert = false;
    this.isSuccess = false;
    this.emailError = false;
    this.passwordError = false;

    let valid = true;

    if (!this.validateEmail(this.email.trim())) {
      this.emailError = true;
      valid = false;
    }

    if (!this.password.trim()) {
      this.passwordError = true;
      valid = false;
    }

    if (!valid) return;

    this.isLoading = true;
    await new Promise(resolve => setTimeout(resolve, 1800));
    this.isLoading = false;

    const isDemo =
      this.email === 'demo@company.com' &&
      this.password === 'demo1234';

    if (!isDemo) {
      this.showAlert = true;
    } else {
      this.isSuccess = true;
    }

    this.changeDetector.detectChanges();
  }
}
