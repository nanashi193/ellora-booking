import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Bỏ qua kiểm tra auth trên server-side rendering vì không có localStorage
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  return (await authService.isAuthenticated())
    ? true
    : router.createUrlTree(['/login']);
};
