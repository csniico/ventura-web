import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { BusinessService } from '../../../../core/services/business.service';
import { ResourceService } from '../../../../core/services/resource.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Profile Header -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              @if (user()?.avatarUrl) {
                <img
                  [src]="user()?.avatarUrl"
                  [alt]="user()?.firstName"
                  class="w-full h-full object-cover"
                />
              } @else {
                <div class="w-full h-full bg-blue-600 flex items-center justify-center">
                  <span class="text-3xl font-semibold text-white">{{ getInitials() }}</span>
                </div>
              }
            </div>
            <button
              (click)="avatarInput.click()"
              class="absolute bottom-0 right-0 p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              [disabled]="isUploadingAvatar()"
            >
              @if (isUploadingAvatar()) {
                <svg class="animate-spin w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else {
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              }
            </button>
            <input
              #avatarInput
              type="file"
              accept="image/*"
              class="hidden"
              (change)="onAvatarSelected($event)"
            />
          </div>

          <!-- User Info -->
          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-2xl font-semibold text-gray-900">
              {{ user()?.firstName }} {{ user()?.lastName }}
            </h1>
            <p class="text-gray-500 mt-1">{{ user()?.email }}</p>
            @if (business()) {
              <div class="mt-3 inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                {{ business()?.name }}
              </div>
            }
          </div>

          <!-- Edit Button -->
          <button
            (click)="openEditModal()"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      <!-- Account Information -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-medium text-gray-900">Account Information</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <div class="px-6 py-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">Full Name</p>
              <p class="text-sm text-gray-500">{{ user()?.firstName }} {{ user()?.lastName || '' }}</p>
            </div>
          </div>
          <div class="px-6 py-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">Email Address</p>
              <p class="text-sm text-gray-500">{{ user()?.email }}</p>
            </div>
            @if (user()?.isEmailVerified) {
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Verified
              </span>
            }
          </div>
          <div class="px-6 py-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">Account ID</p>
              <p class="text-sm text-gray-500 font-mono">{{ user()?.shortId }}</p>
            </div>
          </div>
          <div class="px-6 py-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">Member Since</p>
              <p class="text-sm text-gray-500">{{ user()?.createdAt | date:'MMMM d, y' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Business Information -->
      @if (business()) {
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">Business Information</h2>
            <button
              (click)="openBusinessEditModal()"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Edit
            </button>
          </div>
          <div class="divide-y divide-gray-100">
            <div class="px-6 py-4">
              <p class="text-sm font-medium text-gray-900">Business Name</p>
              <p class="text-sm text-gray-500">{{ business()?.name }}</p>
            </div>
            @if (business()?.categories?.length) {
              <div class="px-6 py-4">
                <p class="text-sm font-medium text-gray-900">Categories</p>
                <div class="flex flex-wrap gap-2 mt-1">
                  @for (category of business()?.categories; track category) {
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{{ category }}</span>
                  }
                </div>
              </div>
            }
            @if (business()?.email) {
              <div class="px-6 py-4">
                <p class="text-sm font-medium text-gray-900">Business Email</p>
                <p class="text-sm text-gray-500">{{ business()?.email }}</p>
              </div>
            }
            @if (business()?.phone) {
              <div class="px-6 py-4">
                <p class="text-sm font-medium text-gray-900">Business Phone</p>
                <p class="text-sm text-gray-500">{{ business()?.phone }}</p>
              </div>
            }
            @if (business()?.address) {
              <div class="px-6 py-4">
                <p class="text-sm font-medium text-gray-900">Address</p>
                <p class="text-sm text-gray-500">
                  {{ business()?.address }}
                  @if (business()?.city) { , {{ business()?.city }} }
                  @if (business()?.state) { , {{ business()?.state }} }
                  @if (business()?.country) { , {{ business()?.country }} }
                </p>
              </div>
            }
          </div>
        </div>
      }

      <!-- Security -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-medium text-gray-900">Security</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <button
            (click)="openChangePasswordModal()"
            class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Change Password</p>
                <p class="text-sm text-gray-500">Update your account password</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Support & Legal -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-medium text-gray-900">Support & Legal</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <a
            href="mailto:support@ventura.com"
            class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center">
              <div class="mr-4">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Help Center</p>
                <p class="text-sm text-gray-500">Get help with your account</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
          <a
            routerLink="/governance/privacy"
            class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center">
              <div class="mr-4">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Privacy Policy</p>
                <p class="text-sm text-gray-500">How we handle your data</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
          <a
            routerLink="/governance/terms"
            class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center">
              <div class="mr-4">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Terms of Service</p>
                <p class="text-sm text-gray-500">Our terms and conditions</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Sign Out -->
      <div class="bg-white rounded-lg border border-gray-200">
        <button
          (click)="onSignOut()"
          class="w-full px-6 py-4 flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors rounded-lg"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Sign Out
        </button>
      </div>

      <!-- Toast Notification -->
      @if (toastMessage()) {
        <div
          class="fixed bottom-4 right-4 z-50"
          [class]="toastType() === 'success' ? 'bg-green-600' : 'bg-red-600'"
        >
          <div class="flex items-center px-4 py-3 rounded-lg shadow-lg text-white">
            @if (toastType() === 'success') {
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            } @else {
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            }
            <span class="text-sm font-medium">{{ toastMessage() }}</span>
          </div>
        </div>
      }
    </div>

    <!-- Edit Profile Modal -->
    @if (isEditModalOpen()) {
      <div class="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Edit Profile</h3>
            <button
              (click)="closeEditModal()"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()">
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  formControlName="firstName"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  formControlName="lastName"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
              <button
                type="button"
                (click)="closeEditModal()"
                class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isSaving()"
                class="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isSaving() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Change Password Modal -->
    @if (isPasswordModalOpen()) {
      <div class="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Change Password</h3>
            <button
              (click)="closePasswordModal()"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  formControlName="currentPassword"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  formControlName="newPassword"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  formControlName="confirmPassword"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                @if (passwordForm.errors?.['mismatch'] && passwordForm.get('confirmPassword')?.touched) {
                  <p class="text-red-600 text-sm mt-1">Passwords do not match</p>
                }
              </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
              <button
                type="button"
                (click)="closePasswordModal()"
                class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="passwordForm.invalid || isSaving()"
                class="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isSaving() ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Business Edit Modal -->
    @if (isBusinessEditModalOpen()) {
      <div class="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <h3 class="text-lg font-semibold text-gray-900">Edit Business</h3>
            <button
              (click)="closeBusinessEditModal()"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form [formGroup]="businessForm" (ngSubmit)="onSaveBusiness()" class="flex-1 overflow-y-auto">
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Business Email</label>
                <input
                  type="email"
                  formControlName="email"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <input
                  type="text"
                  formControlName="address"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input
                    type="text"
                    formControlName="city"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                  <input
                    type="text"
                    formControlName="state"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <input
                  type="text"
                  formControlName="country"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  formControlName="description"
                  rows="3"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                ></textarea>
              </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                (click)="closeBusinessEditModal()"
                class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isSaving()"
                class="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isSaving() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly businessService = inject(BusinessService);
  private readonly resourceService = inject(ResourceService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  protected readonly user = computed(() => this.authService.user());
  protected readonly business = computed(() => this.businessService.business());

  // Modal states
  protected readonly isEditModalOpen = signal(false);
  protected readonly isPasswordModalOpen = signal(false);
  protected readonly isBusinessEditModalOpen = signal(false);

  // Loading states
  protected readonly isSaving = signal(false);
  protected readonly isUploadingAvatar = signal(false);

  // Toast
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');

  // Forms
  protected profileForm!: FormGroup;
  protected passwordForm!: FormGroup;
  protected businessForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.loadBusinessIfNeeded();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.businessForm = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      phone: [''],
      address: [''],
      city: [''],
      state: [''],
      country: [''],
      description: ['']
    });
  }

  private passwordMatchValidator(form: FormGroup): { mismatch: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  private loadBusinessIfNeeded(): void {
    const currentBusiness = this.businessService.getCurrentBusiness();
    if (!currentBusiness && this.user()?.businessId) {
      this.businessService.fetchOwnerBusiness()
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  protected getInitials(): string {
    const user = this.user();
    if (!user) return '?';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  protected onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploadingAvatar.set(true);
    this.resourceService.uploadImage(file)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to upload image', 'error');
          this.isUploadingAvatar.set(false);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          const userId = this.user()?.id;
          if (userId) {
            this.userService.updateUserProfile(userId, { avatarUrl: response.url })
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (updatedUser) => {
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                  this.authService['user'].set(updatedUser);
                  this.showToast('Avatar updated', 'success');
                  this.isUploadingAvatar.set(false);
                },
                error: () => {
                  this.showToast('Failed to update avatar', 'error');
                  this.isUploadingAvatar.set(false);
                }
              });
          }
        }
      });
  }

  protected openEditModal(): void {
    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName || ''
      });
    }
    this.isEditModalOpen.set(true);
  }

  protected closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }

  protected onSaveProfile(): void {
    if (this.profileForm.invalid) return;

    const userId = this.user()?.id;
    if (!userId) return;

    this.isSaving.set(true);
    this.userService.updateUserProfile(userId, this.profileForm.value)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to update profile', 'error');
          this.isSaving.set(false);
          return of(null);
        })
      )
      .subscribe(updatedUser => {
        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.authService['user'].set(updatedUser);
          this.showToast('Profile updated', 'success');
          this.closeEditModal();
        }
        this.isSaving.set(false);
      });
  }

  protected openChangePasswordModal(): void {
    this.passwordForm.reset();
    this.isPasswordModalOpen.set(true);
  }

  protected closePasswordModal(): void {
    this.isPasswordModalOpen.set(false);
  }

  protected onChangePassword(): void {
    if (this.passwordForm.invalid) return;

    const userId = this.user()?.id;
    if (!userId) return;

    this.isSaving.set(true);

    this.userService.changePassword(userId, {
      oldPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
    })
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          const message = error?.error?.message || 'Failed to change password';
          this.showToast(message, 'error');
          this.isSaving.set(false);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result !== null) {
          this.showToast('Password changed successfully', 'success');
          this.closePasswordModal();
        }
        this.isSaving.set(false);
      });
  }

  protected openBusinessEditModal(): void {
    const biz = this.business();
    if (biz) {
      this.businessForm.patchValue({
        name: biz.name,
        email: biz.email || '',
        phone: biz.phone || '',
        address: biz.address || '',
        city: biz.city || '',
        state: biz.state || '',
        country: biz.country || '',
        description: biz.description || ''
      });
    }
    this.isBusinessEditModalOpen.set(true);
  }

  protected closeBusinessEditModal(): void {
    this.isBusinessEditModalOpen.set(false);
  }

  protected onSaveBusiness(): void {
    if (this.businessForm.invalid) return;

    const businessId = this.business()?.id;
    if (!businessId) return;

    this.isSaving.set(true);
    this.businessService.updateBusiness(businessId, this.businessForm.value)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to update business', 'error');
          this.isSaving.set(false);
          return of(null);
        })
      )
      .subscribe(updatedBusiness => {
        if (updatedBusiness) {
          this.showToast('Business updated', 'success');
          this.closeBusinessEditModal();
        }
        this.isSaving.set(false);
      });
  }

  protected onSignOut(): void {
    this.authService.logout();
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
