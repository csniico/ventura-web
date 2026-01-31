import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Customer } from '../../../../shared/models/customer.model';

@Component({
  selector: 'app-recent-customers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recent-customers.component.html'
})
export class RecentCustomersComponent {
  @Input() customers: Customer[] = [];
  @Input() isLoading: boolean = false;

  protected getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  protected getRelativeDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
}
