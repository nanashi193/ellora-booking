import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileApiService, Profile } from '../services/profile-api.service';

export function roleHome(role: Profile['role']): string {
  return role === 'ADMIN' ? '/admin/approvals' : role === 'SALON_OWNER' ? '/owner/dashboard' : '/';
}
export const roleGuard: CanActivateFn = async (route) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  const auth = inject(AuthService);
  const profiles = inject(ProfileApiService);
  const router = inject(Router);
  if (!await auth.isAuthenticated()) return router.createUrlTree(['/login']);
  try {
    const profile = await profiles.getCurrentUser();
    const requiredRole = route.data['role'] ?? route.parent?.data['role'];
    return profile.role === requiredRole ? true : router.parseUrl(roleHome(profile.role));
  } catch { return router.createUrlTree(['/login']); }
};
