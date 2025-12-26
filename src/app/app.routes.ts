import { Routes } from '@angular/router';
import { NotFound } from './shared/components/not-found/not-found';

export const routes: Routes = [
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
