import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Email verification is part of sign-in now (OTP / Google / Apple), so
    // there's no separate gate here — only redirect away once a business exists.
    if (user.businessId) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}