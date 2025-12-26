import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { HelpPage } from './pages/help-page/help-page';
import { LandingLayout } from './pages/landing-layout/landing-layout';

export const LANDING_ROUTES: Routes = [
  {
    path: '',
    component: LandingLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: LandingPage,
      },
      {
        path: 'help',
        component: HelpPage,
      },
    ],
  },
];
