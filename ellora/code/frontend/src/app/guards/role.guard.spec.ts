import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileApiService, Profile } from '../services/profile-api.service';
import { roleGuard, roleHome } from './role.guard';

describe('Role routes', () => {
  let role: Profile['role'];
  let authenticated: boolean;
  beforeEach(() => {
    role = 'CUSTOMER'; authenticated = true;
    TestBed.configureTestingModule({ providers: [provideRouter([]),
      { provide: AuthService, useValue: { isAuthenticated: async () => authenticated } },
      { provide: ProfileApiService, useValue: { getCurrentUser: async () => ({ role }) } },
    ] });
  });
  const check = (requiredRole: string, child = false) => TestBed.runInInjectionContext(() => roleGuard(
    (child ? { data: {}, parent: { data: { role: requiredRole } } } : { data: { role: requiredRole } }) as unknown as ActivatedRouteSnapshot,
    {} as RouterStateSnapshot));
  it('blocks customers from owner and admin routes', async () => {
    expect(TestBed.inject(Router).serializeUrl(await check('SALON_OWNER') as any)).toBe('/');
    expect(TestBed.inject(Router).serializeUrl(await check('ADMIN') as any)).toBe('/');
  });
  it('allows approved owners including child routes, but not admin routes', async () => {
    role = 'SALON_OWNER';
    expect(await check('SALON_OWNER')).toBe(true);
    expect(await check('SALON_OWNER', true)).toBe(true);
    expect(await check('ADMIN')).not.toBe(true);
  });
  it('allows admins and redirects logged-out users to login', async () => {
    role = 'ADMIN'; expect(await check('ADMIN')).toBe(true);
    authenticated = false;
    expect(TestBed.inject(Router).serializeUrl(await check('ADMIN') as any)).toBe('/login');
  });
  it('chooses login destinations for all roles', () => {
    expect(roleHome('ADMIN')).toBe('/admin/approvals');
    expect(roleHome('SALON_OWNER')).toBe('/owner/dashboard');
    expect(roleHome('CUSTOMER')).toBe('/');
  });
});
