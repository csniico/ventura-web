import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { DashboardSummary } from '../../shared/models/dashboard.model';
import { API_ENDPOINTS } from '../../shared/api.constants';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  getDashboardSummary(businessId: string): Observable<DashboardSummary> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<DashboardSummary>(API_ENDPOINTS.DASHBOARD.SUMMARY(businessId)).pipe(
      tap((data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set('Failed to load dashboard data');
        return throwError(() => error);
      })
    );
  }
}
