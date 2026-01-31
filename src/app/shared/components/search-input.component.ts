import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <input
        type="text"
        [formControl]="searchControl"
        [placeholder]="placeholder"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      @if (searchControl.value && showClearButton) {
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            (click)="clearSearch()"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class SearchInputComponent {
  @Input() placeholder = 'Search...';
  @Input() debounceMs = 300;
  @Input() showClearButton = true;
  @Input() initialValue = '';

  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  protected searchControl = new FormControl('');

  ngOnInit(): void {
    if (this.initialValue) {
      this.searchControl.setValue(this.initialValue);
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounceMs),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.search.emit(value || '');
      });
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
    this.clear.emit();
  }
}