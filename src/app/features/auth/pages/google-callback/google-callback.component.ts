import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner.component';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <app-loading-spinner size="lg" text="Completing Google sign in..." />
        @if (errorMessage) {
          <div class="mt-6 rounded-md bg-red-50 p-4 border border-red-200 max-w-md">
            <p class="text-sm text-red-800">{{ errorMessage }}</p>
            <button
              (click)="redirectToLogin()"
              class="mt-4 text-sm text-blue-600 hover:underline"
            >
              Return to login
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class GoogleCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected errorMessage = '';

  ngOnInit(): void {
    this.handleGoogleCallback();
  }

  private handleGoogleCallback(): void {
    // Parse user data from query params (sent by backend)
    this.route.queryParams.subscribe(params => {
      if (params['user']) {
        try {
          const user = JSON.parse(params['user']);

          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(user));

          // Update auth service state
          this.authService.user.set(user);
          this.authService.isAuthenticated.set(true);

          // Navigate based on user state
          // Google users are auto-verified, so we only check businessId
          if (!user.businessId) {
            this.router.navigate(['/business/setup']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
          this.errorMessage = 'Failed to complete Google sign in. Please try again.';
        }
      } else if (params['error']) {
        this.errorMessage = 'Google authentication failed. Please try again.';
      } else {
        this.errorMessage = 'Invalid authentication response. Please try again.';
      }
    });
  }

  protected redirectToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
