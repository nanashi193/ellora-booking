import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let authService: {
    register: ReturnType<typeof vi.fn>;
    confirmRegistration: ReturnType<typeof vi.fn>;
    resendConfirmationCode: ReturnType<typeof vi.fn>;
    loginWithGoogle: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    authService = {
      register: vi.fn(),
      confirmRegistration: vi.fn(),
      resendConfirmationCode: vi.fn(),
      loginWithGoogle: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([{ path: 'login', component: RegisterComponent }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should mark invalid controls when the form is submitted empty', async () => {
    await component.register();

    expect(component.fullNameInvalid).toBe(true);
    expect(component.emailInvalid).toBe(true);
    expect(component.passwordInvalid).toBe(true);
    expect(component.confirmPasswordInvalid).toBe(true);
    expect(component.showAlert).toBe(true);
  });

  it('should not submit when email is invalid', async () => {
    component.registerForm.setValue({
      fullName: 'Nguyen An',
      email: 'invalid-email',
      password: 'Demo1234!',
      confirmPassword: 'Demo1234!',
    });

    await component.register();

    expect(component.emailInvalid).toBe(true);
    expect(component.isSuccess).toBe(false);
  });

  it('should not submit when passwords do not match', async () => {
    component.registerForm.setValue({
      fullName: 'Nguyen An',
      email: 'an@example.com',
      password: 'Demo1234!',
      confirmPassword: 'wrong-password',
    });

    await component.register();

    expect(component.confirmPasswordInvalid).toBe(true);
    expect(component.isSuccess).toBe(false);
  });

  it('should request email confirmation after valid registration details', async () => {
    authService.register.mockResolvedValue({
      success: false,
      requiresConfirmation: true,
    });
    component.registerForm.setValue({
      fullName: 'Nguyen An',
      email: 'an@example.com',
      password: 'Demo1234!',
      confirmPassword: 'Demo1234!',
    });

    await component.register();

    expect(authService.register).toHaveBeenCalledWith({
      fullName: 'Nguyen An',
      email: 'an@example.com',
      password: 'Demo1234!',
    });
    expect(component.requiresConfirmation).toBe(true);
    expect(component.isSuccess).toBe(false);
    expect(component.showAlert).toBe(false);
  });

  it('should confirm registration with the emailed code', async () => {
    authService.confirmRegistration.mockResolvedValue({
      success: true,
      requiresConfirmation: false,
    });
    component.registerForm.controls.email.setValue('an@example.com');
    component.confirmationForm.controls.code.setValue('123456');

    await component.confirmRegistration();
    await fixture.whenStable();

    expect(authService.confirmRegistration).toHaveBeenCalledWith(
      'an@example.com',
      '123456',
    );
    expect(component.isSuccess).toBe(true);
    expect(component.requiresConfirmation).toBe(false);
    expect(router.url).toBe('/login');
  });

  it('should resend the confirmation code to the registered email', async () => {
    authService.resendConfirmationCode.mockResolvedValue({
      success: true,
      message: 'Đã gửi lại mã xác nhận.',
    });
    component.registerForm.controls.email.setValue('an@example.com');

    await component.resendConfirmationCode();

    expect(authService.resendConfirmationCode).toHaveBeenCalledWith('an@example.com');
    expect(component.resendMessage).toContain('Đã gửi lại');
    expect(component.showAlert).toBe(false);
  });

  it('should start Google registration', async () => {
    authService.loginWithGoogle.mockResolvedValue({ success: true });

    await component.registerWithGoogle();

    expect(authService.loginWithGoogle).toHaveBeenCalled();
    expect(component.showAlert).toBe(false);
  });
});
