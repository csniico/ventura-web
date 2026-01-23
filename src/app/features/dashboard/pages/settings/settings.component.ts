import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../../core/services/business.service';

type SettingsTab = 'profile' | 'business' | 'notifications' | 'security' | 'appearance';

interface NotificationSettings {
  emailNotifications: boolean;
  appointmentReminders: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly destroy$ = new Subject<void>();

  // Tab state
  protected readonly activeTab = signal<SettingsTab>('profile');

  // User & Business data
  protected readonly user = computed(() => this.authService.user());
  protected readonly business = computed(() => this.businessService.business());

  // Form states
  protected readonly isProfileSaving = signal(false);
  protected readonly isBusinessSaving = signal(false);
  protected readonly isPasswordSaving = signal(false);

  // Profile form
  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly email = signal('');

  // Business form
  protected readonly businessName = signal('');
  protected readonly businessDescription = signal('');
  protected readonly businessPhone = signal('');
  protected readonly businessEmail = signal('');
  protected readonly businessAddress = signal('');

  // Password form
  protected readonly currentPassword = signal('');
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly passwordError = signal('');

  // Notification settings
  protected readonly notifications = signal<NotificationSettings>({
    emailNotifications: true,
    appointmentReminders: true,
    orderUpdates: true,
    marketingEmails: false
  });

  // Theme
  protected readonly isDarkMode = signal(false);

  // Toast
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');

  protected readonly tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'profile', label: 'Profile', icon: 'user' },
    { key: 'business', label: 'Business', icon: 'building' },
    { key: 'notifications', label: 'Notifications', icon: 'bell' },
    { key: 'security', label: 'Security', icon: 'lock' },
    { key: 'appearance', label: 'Appearance', icon: 'palette' }
  ];

  ngOnInit(): void {
    this.loadUserData();
    this.loadBusinessData();
    this.loadThemePreference();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    const user = this.user();
    if (user) {
      this.firstName.set(user.firstName || '');
      this.lastName.set(user.lastName || '');
      this.email.set(user.email || '');
    }
  }

  private loadBusinessData(): void {
    const business = this.business();
    if (business) {
      this.businessName.set(business.name || '');
      this.businessDescription.set(business.description || '');
      this.businessPhone.set(business.phone || '');
      this.businessEmail.set(business.email || '');
      this.businessAddress.set(business.address || '');
    } else {
      this.businessService.fetchOwnerBusiness()
        .pipe(takeUntil(this.destroy$))
        .subscribe(business => {
          if (business) {
            this.businessName.set(business.name || '');
            this.businessDescription.set(business.description || '');
            this.businessPhone.set(business.phone || '');
            this.businessEmail.set(business.email || '');
            this.businessAddress.set(business.address || '');
          }
        });
    }
  }

  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode.set(savedTheme === 'dark');
  }

  protected setActiveTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }

  protected onSaveProfile(): void {
    this.isProfileSaving.set(true);

    // Simulate save - in real app, call user service
    setTimeout(() => {
      this.isProfileSaving.set(false);
      this.showToast('Profile updated successfully', 'success');
    }, 1000);
  }

  protected onSaveBusiness(): void {
    this.isBusinessSaving.set(true);

    // Simulate save - in real app, call business service
    setTimeout(() => {
      this.isBusinessSaving.set(false);
      this.showToast('Business settings updated successfully', 'success');
    }, 1000);
  }

  protected onChangePassword(): void {
    this.passwordError.set('');

    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('New passwords do not match');
      return;
    }

    if (this.newPassword().length < 8) {
      this.passwordError.set('Password must be at least 8 characters');
      return;
    }

    this.isPasswordSaving.set(true);

    // Simulate save - in real app, call auth service
    setTimeout(() => {
      this.isPasswordSaving.set(false);
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
      this.showToast('Password changed successfully', 'success');
    }, 1000);
  }

  protected toggleNotification(key: keyof NotificationSettings): void {
    this.notifications.update(n => ({
      ...n,
      [key]: !n[key]
    }));
    this.showToast('Notification preference updated', 'success');
  }

  protected toggleTheme(): void {
    this.isDarkMode.update(v => !v);
    const theme = this.isDarkMode() ? 'dark' : 'light';
    localStorage.setItem('theme', theme);

    // Apply theme to document
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    this.showToast(`Theme changed to ${theme} mode`, 'success');
  }

  protected getInitials(): string {
    const user = this.user();
    if (!user) return '?';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
