import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
        @if (errorMessage()) {
          <div class="mt-6 rounded-md bg-red-50 p-4 border border-red-200 max-w-md">
            <p class="text-sm text-red-800">{{ errorMessage() }}</p>
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
export class GoogleCallbackComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  protected errorMessage = signal('');

  ngOnInit(): void {
    this.handleGoogleCallback();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleGoogleCallback(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const userId = params['id'];
        const error = params['error'];

        if (error) {
          this.errorMessage.set('Google authentication failed. Please try again.');
          return;
        }

        if (!userId) {
          this.errorMessage.set('Invalid authentication response. Please try again.');
          return;
        }

        this.fetchUserData(userId);
      });
  }

  private fetchUserData(userId: string): void {
    this.authService.fetchUserById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Navigation handled by AuthService.handleLoginSuccess
        },
        error: () => {
          this.errorMessage.set('Failed to complete Google sign in. Please try again.');
        }
      });
  }

  protected redirectToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
