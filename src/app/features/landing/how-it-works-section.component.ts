import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-how-it-works-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="how-it-works" class="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple steps to 
            <span class="text-primary">business success</span>
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started with Ventura in minutes, not hours. Our intuitive platform guides you through every step.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">1</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Sign Up & Setup</h3>
            <p class="text-gray-600">Create your account and set up your business profile in under 5 minutes.</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">2</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Add Your Products</h3>
            <p class="text-gray-600">Import your existing inventory or add products manually with our easy-to-use interface.</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">3</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Start Selling</h3>
            <p class="text-gray-600">Create orders, generate invoices, and manage your business operations seamlessly.</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HowItWorksSectionComponent {}