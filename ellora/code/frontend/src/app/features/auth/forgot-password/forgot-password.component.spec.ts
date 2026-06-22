import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let component: ForgotPasswordComponent;
  let authService: {
    requestPasswordReset: ReturnType<typeof vi.fn>;
    confirmPasswordReset: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      requestPasswordReset: vi.fn(),
      confirmPasswordReset: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([{ path: 'login', component: ForgotPasswordComponent }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should request a reset code', async () => {
    authService.requestPasswordReset.mockResolvedValue({ success: true });
    component.emailForm.controls.email.setValue('user@example.com');

    await component.sendCode();

    expect(authService.requestPasswordReset).toHaveBeenCalledWith('user@example.com');
    expect(component.codeSent).toBe(true);
  });

  it('should reset the password and navigate to login', async () => {
    authService.confirmPasswordReset.mockResolvedValue({ success: true });
    component.emailForm.controls.email.setValue('user@example.com');
    component.resetForm.setValue({
      code: '123456',
      password: 'NewPassword1!',
      confirmPassword: 'NewPassword1!',
    });

    await component.resetPassword();
    await fixture.whenStable();

    expect(authService.confirmPasswordReset).toHaveBeenCalled();
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
