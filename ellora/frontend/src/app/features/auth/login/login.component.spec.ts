import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../../services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authService: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = {
      login: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: AuthService, useValue: authService }],
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

  it('should show success after valid demo credentials', async () => {
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
  });
});
