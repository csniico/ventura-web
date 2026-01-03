import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-animation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center p-8">
      <div class="relative">
        <!-- Success Circle -->
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
          <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce-in">
            <svg class="w-8 h-8 text-white animate-check-draw" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        
        <!-- Confetti -->
        <div class="absolute -top-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full animate-confetti-1"></div>
        <div class="absolute -top-1 -right-3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-confetti-2"></div>
        <div class="absolute -bottom-2 -left-3 w-1.5 h-1.5 bg-red-400 rounded-full animate-confetti-3"></div>
        <div class="absolute -bottom-1 -right-2 w-2 h-2 bg-green-400 rounded-full animate-confetti-4"></div>
      </div>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-6 animate-fade-in-up">{{ title }}</h3>
      <p class="text-gray-600 mt-2 text-center animate-fade-in-up-delay">{{ message }}</p>
    </div>
  `,
  styles: [`
    @keyframes scale-in {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes bounce-in {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    
    @keyframes check-draw {
      0% { stroke-dasharray: 0 24; }
      100% { stroke-dasharray: 24 24; }
    }
    
    @keyframes confetti-1 {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(-20px) rotate(180deg); opacity: 0; }
    }
    
    @keyframes confetti-2 {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(-25px) rotate(-180deg); opacity: 0; }
    }
    
    @keyframes confetti-3 {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(-15px) rotate(90deg); opacity: 0; }
    }
    
    @keyframes confetti-4 {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(-30px) rotate(-90deg); opacity: 0; }
    }
    
    @keyframes fade-in-up {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    .animate-scale-in { animation: scale-in 0.6s ease-out; }
    .animate-bounce-in { animation: bounce-in 0.8s ease-out 0.2s both; }
    .animate-check-draw { animation: check-draw 0.5s ease-out 0.8s both; }
    .animate-confetti-1 { animation: confetti-1 1s ease-out 1s both; }
    .animate-confetti-2 { animation: confetti-2 1.2s ease-out 1.1s both; }
    .animate-confetti-3 { animation: confetti-3 0.9s ease-out 1.2s both; }
    .animate-confetti-4 { animation: confetti-4 1.1s ease-out 1s both; }
    .animate-fade-in-up { animation: fade-in-up 0.6s ease-out 1.3s both; }
    .animate-fade-in-up-delay { animation: fade-in-up 0.6s ease-out 1.5s both; }
  `]
})
export class SuccessAnimationComponent {
  @Input() title = 'Success!';
  @Input() message = 'Your action was completed successfully.';
}