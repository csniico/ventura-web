import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loading = signal(false);
  private loadingCount = 0;

  readonly isLoading = this.loading.asReadonly();

  setLoading(loading: boolean): void {
    if (loading) {
      this.loadingCount++;
    } else {
      this.loadingCount = Math.max(0, this.loadingCount - 1);
    }

    this.loading.set(this.loadingCount > 0);
  }

  forceStop(): void {
    this.loadingCount = 0;
    this.loading.set(false);
  }
}