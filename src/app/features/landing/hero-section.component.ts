import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div class="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Copy -->
          <div class="text-center lg:text-left">
            <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your whole business,
              <span class="text-primary">in one place</span>
            </h1>
            <p class="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Customers, sales, invoices and your calendar, all connected in one app built for small businesses.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <a routerLink="/auth/login" class="group bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center">
                Get started
                <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </a>
              <a href="#features" class="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-primary hover:text-primary transition-all duration-300">
                See what's inside
              </a>
            </div>
          </div>

          <!-- Hero image -->
          <div class="relative">
            <img
              src="/images/ventura_manage_in_one_place.png"
              alt="Manage your whole business in one place"
              class="w-full rounded-2xl shadow-2xl ring-1 ring-black/5"
            />
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob { animation: blob 7s infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
  `]
})
export class HeroSectionComponent {}
