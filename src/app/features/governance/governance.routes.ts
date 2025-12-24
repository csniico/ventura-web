import { Routes } from '@angular/router';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { TermsOfUse } from './pages/terms-of-use/terms-of-use';

export const GOVERNANCE_ROUTES: Routes = [
  {
    path: 'privacy-policy',
    component: PrivacyPolicy,
  },
  {
    path: 'terms-of-use',
    component: TermsOfUse,
  },
  {
    path: '',
    redirectTo: 'privacy-policy',
    pathMatch: 'full',
  },
];
