import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

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
      password: 'demo1234',
      confirmPassword: 'demo1234',
    });

    await component.register();

    expect(component.emailInvalid).toBe(true);
    expect(component.isSuccess).toBe(false);
  });

  it('should not submit when passwords do not match', async () => {
    component.registerForm.setValue({
      fullName: 'Nguyen An',
      email: 'an@example.com',
      password: 'demo1234',
      confirmPassword: 'wrong-password',
    });

    await component.register();

    expect(component.confirmPasswordInvalid).toBe(true);
    expect(component.isSuccess).toBe(false);
  });

  it('should show success after valid registration details', async () => {
    component.registerForm.setValue({
      fullName: 'Nguyen An',
      email: 'an@example.com',
      password: 'demo1234',
      confirmPassword: 'demo1234',
    });

    await component.register();

    expect(component.isSuccess).toBe(true);
    expect(component.showAlert).toBe(false);
  });
});
