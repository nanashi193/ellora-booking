import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return (await authService.isAuthenticated())
    ? true
    : router.createUrlTree(['/login'], state.url === '/business-registration'
      ? { queryParams: { returnUrl: '/business-registration' } } : {});
};
