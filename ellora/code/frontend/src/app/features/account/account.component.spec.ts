import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../../services/auth.service';
import { AccountComponent } from './account.component';

describe('Account password change', () => {
  it('validates confirmation, prevents duplicate submits and clears passwords after success', async () => {
    let finish!: (result: { success: boolean }) => void;
    const changePassword = vi.fn(() => new Promise<{ success: boolean }>(resolve => { finish = resolve; }));
    await TestBed.configureTestingModule({ imports: [AccountComponent], providers: [provideRouter([]),
      { provide: AuthService, useValue: { getUserProfile: async () => ({ name: 'Linh', email: 'linh@example.com' }), changePassword } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AccountComponent);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.passwordForm.setValue({ currentPassword: 'OldPass123!', newPassword: 'NewPass123!', confirmPassword: 'Mismatch123!' });
    await component.changePassword();
    expect(changePassword).not.toHaveBeenCalled();
    expect(component.error()).toContain('không khớp');
    component.passwordForm.controls.confirmPassword.setValue('NewPass123!');
    const pending = component.changePassword();
    await component.changePassword();
    expect(changePassword).toHaveBeenCalledExactlyOnceWith('OldPass123!', 'NewPass123!');
    expect(component.saving()).toBe(true);
    finish({ success: true });
    await pending;
    await fixture.whenStable();
    expect(component.passwordForm.getRawValue()).toEqual({ currentPassword: '', newPassword: '', confirmPassword: '' });
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('thành công');
    changePassword.mockResolvedValueOnce({ success: false });
    component.passwordForm.setValue({ currentPassword: 'OldPass123!', newPassword: 'NewPass123!', confirmPassword: 'NewPass123!' });
    await component.changePassword();
    expect(component.error()).toContain('Không thể');
    expect(component.saving()).toBe(false);
    expect(component.passwordForm.enabled).toBe(true);
  });
});
