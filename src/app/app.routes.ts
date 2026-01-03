import { Routes } from '@angular/router';
import { NotFound } from './shared/components/not-found/not-found';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'business',
    loadChildren: () => import('./features/business/business.routes').then((m) => m.BUSINESS_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'governance',
    loadChildren: () =>
      import('./features/governance/governance.routes').then((m) => m.GOVERNANCE_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/landing/landing.routes').then((m) => m.LANDING_ROUTES),
  },
  {
    path: '**',
    component: NotFound,
  },
];