import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Header } from './header.component';

describe('Header authentication', () => {
  it('renders the account menu after the asynchronous session check without a user interaction', async () => {
    let resolveSession!: (authenticated: boolean) => void;
    const session = new Promise<boolean>((resolve) => { resolveSession = resolve; });
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: {
          isAuthenticated: () => session,
          getUserProfile: async () => ({ name: 'Linh', email: 'linh@example.com' }),
        } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#header-avatar-btn')).toBeNull();

    resolveSession(true);
    await session;
    await Promise.resolve();
    await Promise.resolve();
    await fixture.whenStable();

    const avatar = fixture.nativeElement.querySelector('#header-avatar-btn') as HTMLButtonElement;
    expect(avatar).not.toBeNull();
    expect(avatar.textContent).toContain('L');
    avatar.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#dropdown-logout')?.textContent).toContain('Đăng xuất');
  });
});
