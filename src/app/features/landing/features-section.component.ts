import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FeatureRow {
  title: string;
  body: string;
  image: string;
  alt: string;
}

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="features" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to
            <span class="text-primary">run your business</span>
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            The same tools as the Ventura mobile app, on the web.
          </p>
        </div>

        <div class="space-y-20">
          @for (feature of features; track feature.title; let i = $index) {
            <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <!-- Image (alternates sides on large screens) -->
              <div [class.lg:order-2]="i % 2 === 1">
                <img
                  [src]="feature.image"
                  [alt]="feature.alt"
                  class="w-full rounded-2xl shadow-xl ring-1 ring-black/5"
                />
              </div>
              <!-- Copy -->
              <div [class.lg:order-1]="i % 2 === 1" class="text-center lg:text-left">
                <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{{ feature.title }}</h3>
                <p class="text-lg text-gray-600 leading-relaxed">{{ feature.body }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class FeaturesSectionComponent {
  protected readonly features: FeatureRow[] = [
    {
      title: 'Know every customer',
      body: 'Keep customer profiles, history and contacts organized and searchable, so every interaction feels personal.',
      image: '/images/customer_management.png',
      alt: 'Managing customers in a shop',
    },
    {
      title: 'Invoice and get paid',
      body: 'Turn orders into professional invoices and share them straight to WhatsApp, so customers pay however suits them.',
      image: '/images/share_invoices.png',
      alt: 'Sharing an invoice to a customer',
    },
    {
      title: 'Watch your business grow',
      body: 'A clear dashboard of revenue, top products and trends. See how you are doing at a glance.',
      image: '/images/a_central_dashboard.png',
      alt: 'A business revenue dashboard',
    },
  ];
}
