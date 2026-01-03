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

    if (!user.isEmailVerified) {
      this.router.navigate(['/auth/verify-email']);
      return false;
    }

    if (user.businessId) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}