import { Routes } from '@angular/router';
import { NotFound } from './shared/components/not-found/not-found';
import { LandingPage } from './features/landing/pages/landing-page/landing-page';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
  },
  {
    path: 'governance',
    loadChildren: () =>
      import('./features/governance/governance.routes').then((m) => m.GOVERNANCE_ROUTES),
  },
  {
    path: '**',
    component: NotFound,
  },
];
