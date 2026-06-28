import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginComponent } from './login.component';
import { ProfileApiService } from '../../../services/profile-api.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authService: {
    login: ReturnType<typeof vi.fn>;
    loginWithGoogle: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    confirmRegistration: ReturnType<typeof vi.fn>;
    resendConfirmationCode: ReturnType<typeof vi.fn>;
  };
  let profileApiService: { syncCurrentUser: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = {
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      isAuthenticated: vi.fn().mockResolvedValue(false),
      confirmRegistration: vi.fn(),
      resendConfirmationCode: vi.fn(),
    };
    profileApiService = {
      syncCurrentUser: vi.fn().mockResolvedValue({
        id: 'user-id',
        email: 'demo@company.com',
        fullName: 'Demo User',
        role: 'CUSTOMER',
      }),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([{ path: 'account', component: LoginComponent }]),
        { provide: AuthService, useValue: authService },
        { provide: ProfileApiService, useValue: profileApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should mark invalid controls when the form is submitted empty', async () => {
    await component.login();

    expect(component.emailInvalid).toBe(true);
    expect(component.passwordInvalid).toBe(true);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should not submit an invalid email', async () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: 'demo1234',
    });

    await component.login();

    expect(component.emailInvalid).toBe(true);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should show success after Cognito signs the user in', async () => {
    authService.login.mockResolvedValue({ success: true });
    component.loginForm.setValue({
      email: 'demo@company.com',
      password: 'demo1234',
      remember: true,
    });

    await component.login();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'demo@company.com',
      password: 'demo1234',
      remember: true,
    });
    expect(profileApiService.syncCurrentUser).toHaveBeenCalled();
    expect(component.isSuccess).toBe(true);
    expect(component.showAlert).toBe(false);
  });

  it('should show an alert when credentials are invalid', async () => {
    authService.login.mockResolvedValue({ success: false });
    component.loginForm.setValue({
      email: 'user@company.com',
      password: 'wrong-password',
      remember: false,
    });

    await component.login();

    expect(component.isSuccess).toBe(false);
    expect(component.showAlert).toBe(true);
    expect(profileApiService.syncCurrentUser).not.toHaveBeenCalled();
  });

  it('should show confirmation form for an unconfirmed account', async () => {
    authService.login.mockResolvedValue({
      success: false,
      requiresConfirmation: true,
    });
    authService.resendConfirmationCode.mockResolvedValue({
      success: true,
      message: 'Đã gửi lại mã xác nhận.',
    });
    component.loginForm.setValue({
      email: 'pending@company.com',
      password: 'Demo1234!',
      remember: false,
    });

    await component.login();

    expect(component.requiresConfirmation).toBe(true);
    expect(component.showAlert).toBe(false);
    expect(authService.resendConfirmationCode).toHaveBeenCalledWith(
      'pending@company.com',
    );
  });

  it('should confirm the account and finish login', async () => {
    authService.confirmRegistration.mockResolvedValue({
      success: true,
      requiresConfirmation: false,
    });
    authService.login.mockResolvedValue({ success: true });
    component.requiresConfirmation = true;
    component.loginForm.setValue({
      email: 'pending@company.com',
      password: 'Demo1234!',
      remember: false,
    });
    component.confirmationForm.controls.code.setValue('123456');

    await component.confirmRegistration();

    expect(authService.confirmRegistration).toHaveBeenCalledWith(
      'pending@company.com',
      '123456',
    );
    expect(profileApiService.syncCurrentUser).toHaveBeenCalled();
    expect(component.isSuccess).toBe(true);
  });

  it('should start Google sign-in', async () => {
    authService.loginWithGoogle.mockResolvedValue({ success: true });

    await component.loginWithGoogle();

    expect(authService.loginWithGoogle).toHaveBeenCalled();
    expect(component.showAlert).toBe(false);
  });

  it('should show a backend error when profile sync fails', async () => {
    authService.login.mockResolvedValue({ success: true });
    profileApiService.syncCurrentUser.mockRejectedValue(new Error('Backend unavailable'));
    component.loginForm.setValue({
      email: 'demo@company.com',
      password: 'demo1234',
      remember: false,
    });

    await component.login();

    expect(component.isSuccess).toBe(false);
    expect(component.showAlert).toBe(true);
    expect(component.alertMessage).toContain('backend');
  });
});
