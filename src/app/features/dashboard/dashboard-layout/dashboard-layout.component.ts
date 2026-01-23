import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { BusinessService } from '../../../core/services/business.service';
import { Business } from '../../../shared/models/business.model';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html'
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly destroy$ = new Subject<void>();

  // UI State
  protected sidebarOpen = signal(false);
  protected userMenuOpen = signal(false);

  // Data
  protected user = computed(() => this.authService.user());
  protected business = computed(() => this.businessService.business());

  // Computed values
  protected greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  protected currentDate = computed(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  ngOnInit(): void {
    this.loadBusinessData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBusinessData(): void {
    const currentUser = this.authService.user();
    if (currentUser?.businessId) {
      this.businessService.fetchOwnerBusiness()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (err) => console.error('Failed to load business:', err)
        });
    }
  }

  protected getInitials(): string {
    const user = this.user();
    if (!user) return '?';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  protected openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }

  protected logout(): void {
    this.authService.logout();
  }
}
