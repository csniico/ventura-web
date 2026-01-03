import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="features" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to 
            <span class="text-primary">run your business</span>
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            From inventory management to client invoicing, Ventura provides all the tools modern businesses need in one beautiful platform.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Sales Management</h3>
            <p class="text-gray-600 mb-4">Create professional invoices, track orders, and manage your entire sales pipeline with ease.</p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Invoice generation & tracking</li>
              <li>• Order management system</li>
              <li>• Payment processing</li>
            </ul>
          </div>
          
          <div class="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Inventory Control</h3>
            <p class="text-gray-600 mb-4">Keep track of your products, stock levels, and suppliers all in one centralized system.</p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Real-time stock tracking</li>
              <li>• Low stock alerts</li>
              <li>• Supplier management</li>
            </ul>
          </div>
          
          <div class="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Client Management</h3>
            <p class="text-gray-600 mb-4">Build stronger relationships with comprehensive client profiles and appointment scheduling.</p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Customer database</li>
              <li>• Appointment scheduling</li>
              <li>• Communication history</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `
})
export class FeaturesSectionComponent {}