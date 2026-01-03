import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BusinessService } from '../business/services/business.service';
import { Business } from '../../shared/models/business.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <div class="flex items-center space-x-3">
                @if (business()?.logo) {
                  <img [src]="business()?.logo" alt="Business logo" class="w-8 h-8 rounded-lg object-cover" />
                } @else {
                  <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-sm">{{ business()?.name?.charAt(0) || 'V' }}</span>
                  </div>
                }
                <h1 class="text-xl font-semibold text-gray-900">{{ business()?.name || 'Ventura Dashboard' }}</h1>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">Welcome, {{ authService.user()?.firstName }}</span>
              <button
                (click)="authService.logout()"
                class="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Welcome Section -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 mb-8">
            <div class="text-white">
              <h2 class="text-2xl font-bold mb-2">Welcome to your dashboard! 🎉</h2>
              <p class="text-blue-100">Your business <strong>{{ business()?.name }}</strong> is now live on Ventura.</p>
            </div>
          </div>

          <!-- Business Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <!-- Business Details -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
              <div class="space-y-2">
                <p class="text-sm text-gray-600"><span class="font-medium">Name:</span> {{ business()?.name }}</p>
                @if (business()?.tagLine) {
                  <p class="text-sm text-gray-600"><span class="font-medium">Tagline:</span> {{ business()?.tagLine }}</p>
                }
                @if (business()?.categories?.length) {
                  <p class="text-sm text-gray-600"><span class="font-medium">Categories:</span> {{ business()?.categories?.join(', ') }}</p>
                }
              </div>
            </div>

            <!-- Contact Info -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div class="space-y-2">
                @if (business()?.email) {
                  <p class="text-sm text-gray-600"><span class="font-medium">Email:</span> {{ business()?.email }}</p>
                }
                @if (business()?.phone) {
                  <p class="text-sm text-gray-600"><span class="font-medium">Phone:</span> {{ business()?.phone }}</p>
                }
                @if (!business()?.email && !business()?.phone) {
                  <p class="text-sm text-gray-500 italic">No contact information added yet</p>
                }
              </div>
            </div>

            <!-- Location -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              <div class="space-y-2">
                @if (business()?.address || business()?.city || business()?.state || business()?.country) {
                  @if (business()?.address) {
                    <p class="text-sm text-gray-600">{{ business()?.address }}</p>
                  }
                  <p class="text-sm text-gray-600">
                    {{ business()?.city }}{{ business()?.city && business()?.state ? ', ' : '' }}{{ business()?.state }}
                    {{ (business()?.city || business()?.state) && business()?.country ? ', ' : '' }}{{ business()?.country }}
                  </p>
                } @else {
                  <p class="text-sm text-gray-500 italic">No location information added yet</p>
                }
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div class="text-blue-600 mb-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <h4 class="font-medium text-gray-900">Add Services</h4>
                <p class="text-sm text-gray-500">List your services</p>
              </button>
              
              <button class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div class="text-green-600 mb-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4h8v4z"></path>
                  </svg>
                </div>
                <h4 class="font-medium text-gray-900">Manage Bookings</h4>
                <p class="text-sm text-gray-500">View appointments</p>
              </button>
              
              <button class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div class="text-purple-600 mb-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h4 class="font-medium text-gray-900">Analytics</h4>
                <p class="text-sm text-gray-500">View insights</p>
              </button>
              
              <button class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div class="text-orange-600 mb-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h4 class="font-medium text-gray-900">Settings</h4>
                <p class="text-sm text-gray-500">Business settings</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  protected authService = inject(AuthService);
  private businessService = inject(BusinessService);
  
  protected business = signal<Business | null>(null);

  ngOnInit(): void {
    this.loadBusinessData();
  }

  private loadBusinessData(): void {
    const user = this.authService.getCurrentUser();
    if (user?.businessId) {
      console.log('Loading business data for ID:', user.businessId);
      console.log('User authenticated:', this.authService.isAuthenticated());
      
      // Check browser cookies
      console.log('All cookies:', document.cookie);
      
      this.businessService.getBusinessById(user.businessId).subscribe({
        next: (business) => {
          console.log('Business data loaded:', business);
          this.business.set(business);
        },
        error: (error) => {
          console.error('Failed to load business data:', error);
          console.log('Response headers:', error.headers);
          
          // Don't logout immediately - let's see what's happening
          if (error.status === 401) {
            console.log('401 Unauthorized - cookies might not be set properly');
            console.log('Need to re-authenticate via login flow');
          }
        }
      });
    } else {
      console.log('No businessId found for user');
    }
  }
}