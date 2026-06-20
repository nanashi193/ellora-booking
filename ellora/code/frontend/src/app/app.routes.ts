import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.Home)
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/search.component').then(m => m.Search)
      },
      {
        path: 'salon/:id',
        loadComponent: () => import('./features/salon-details/salon-details.component').then(m => m.SalonDetails)
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
    path: '**',
    redirectTo: 'login',
  },
];
