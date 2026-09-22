import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home-page/home/home.component').then(m => m.Home)
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/search.component').then(m => m.Search)
      },
      {
        path: 'salon/:id',
        loadComponent: () => import('./features/salon-details/salon-details.component').then(m => m.SalonDetails)
      },
      {
        path: 'for-business',
        loadComponent: () => import('./features/home-page/for-business/for-business.component').then(m => m.ForBusiness)
      },
      {
        path: 'booking',
        loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent)
      },
      {
        path: 'my-bookings',
        loadComponent: () => import('./features/bookings/my-bookings/my-bookings.component').then(m => m.MyBookings)
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./features/customer/profile/profile.component').then(m => m.Profile)
      },
      {
        path: 'business-registration', canActivate: [authGuard],
        loadComponent: () => import('./features/business-registration/business-registration.component').then(m => m.BusinessRegistrationComponent),
      },
      {
        path: 'admin/approvals', canActivate: [roleGuard], data: { role: 'ADMIN' },
        loadComponent: () => import('./features/admin-approvals/admin-approvals.component').then(m => m.AdminApprovalsComponent),
      },
      {
        path: 'admin/content', canActivate: [roleGuard], data: { role: 'ADMIN' },
        loadComponent: () => import('./features/admin-content/admin-content.component').then(m => m.AdminContentComponent),
      },
      {
        path: 'admin/billing', canActivate: [roleGuard], data: { role: 'ADMIN' },
        loadComponent: () => import('./features/admin-content/billing.component').then(m => m.AdminBillingComponent),
      },
      {
        path: 'account',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/account/account.component').then((m) => m.AccountComponent),
      },
    ]
  },
  {
    path: 'owner',
    canActivate: [roleGuard], canActivateChild: [roleGuard], data: { role: 'SALON_OWNER' },
    loadComponent: () => import('./layouts/owner-layout/owner-layout').then(m => m.OwnerLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/owner/dashboard/dashboard.component').then(m => m.Dashboard)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/owner/service-management/service-management.component').then(m => m.ServiceManagement)
      },
      {
        path: 'staff',
        loadComponent: () => import('./features/owner/staff-management/staff-management.component').then(m => m.StaffManagement)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./features/owner/review-management/review-management.component').then(m => m.ReviewManagement)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/owner/booking-management/booking-management.component').then(m => m.BookingManagement)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
