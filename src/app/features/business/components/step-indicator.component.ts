import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessStep } from '../../../shared/models/business.model';

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center mb-8">
      <div class="flex items-center space-x-4">
        @for (step of steps; track step.id) {
          <div class="flex items-center">
            <!-- Step Circle -->
            <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300"
                 [class]="getStepClasses(step)">
              @if (step.isCompleted) {
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              } @else {
                <span class="text-sm font-medium">{{ step.id }}</span>
              }
            </div>
            
            <!-- Step Label -->
            <div class="ml-3 hidden sm:block">
              <p class="text-sm font-medium" [class]="step.isActive ? 'text-blue-600' : 'text-gray-500'">
                {{ step.title }}
              </p>
            </div>
            
            <!-- Connector Line -->
            @if (step.id < steps.length) {
              <div class="w-12 h-0.5 ml-4 transition-colors duration-300"
                   [class]="step.isCompleted ? 'bg-blue-600' : 'bg-gray-300'">
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class StepIndicatorComponent {
  @Input() steps: BusinessStep[] = [];

  getStepClasses(step: BusinessStep): string {
    if (step.isCompleted) {
      return 'bg-blue-600 border-blue-600 text-white';
    } else if (step.isActive) {
      return 'bg-white border-blue-600 text-blue-600';
    } else {
      return 'bg-white border-gray-300 text-gray-500';
    }
  }
}