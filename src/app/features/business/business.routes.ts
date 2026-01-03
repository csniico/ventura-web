import { Routes } from '@angular/router';
import { BusinessGuard } from './services/business.guard';

export const BUSINESS_ROUTES: Routes = [
  {
    path: 'setup',
    loadComponent: () => import('./pages/setup/business-setup.component').then(m => m.BusinessSetupComponent),
    canActivate: [BusinessGuard]
  },
  {
    path: '',
    redirectTo: 'setup',
    pathMatch: 'full'
  }
];