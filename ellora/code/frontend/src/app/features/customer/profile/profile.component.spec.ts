import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProfileApiService } from '../../../services/profile-api.service';
import { Profile } from './profile.component';

describe('Profile database information', () => {
  it('renders the API profile and shows an error instead of sample data on failure', async () => {
    let fail = false;
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [provideRouter([]), { provide: ProfileApiService, useValue: {
        getCurrentUser: async () => {
          if (fail) throw new Error('Unavailable');
          return { id: 'user-id', fullName: 'Nguyễn Linh', email: 'linh@example.com', phone: null, role: 'CUSTOMER' };
        },
      } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Profile);
    await fixture.whenStable();
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect(Array.from(inputs).map(input => input.value)).toEqual(['Nguyễn Linh', 'linh@example.com', '']);
    expect(inputs[2].placeholder).toBe('Chưa cập nhật');
    const paymentButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Payment Methods'))!;
    expect(paymentButton.type).toBe('button');
    expect(paymentButton.closest('a')).toBeNull();
    paymentButton.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Chưa hỗ trợ quản lý phương thức thanh toán.');
    expect(fixture.componentInstance.user()?.fullName).toBe('Nguyễn Linh');
    fail = true;
    await fixture.componentInstance.loadProfile();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
  });
});
