import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-categories-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-categories-button.component.html',
})
export class HelpCategoriesButtonComponent {
  selectedCategory = input<string>();
  categorySelected = output<string>();

  categories = [
    { key: 'getting-started', label: 'Getting Started' },
    { key: 'members-pricing', label: 'Members and Pricing' },
    { key: 'book-requests', label: 'Book Requests and Recommendations' },
    { key: 'technical', label: 'Account & Technical Issues' },
  ];

  onCategorySelect(category: string): void {
    this.categorySelected.emit(category);
  }
}
