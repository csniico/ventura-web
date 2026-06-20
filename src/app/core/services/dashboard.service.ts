import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  /**
   * The new backend derives the business from the bearer token and accepts a
   * `range` (e.g. 30d). NOTE: the backend summary shape differs from the web
   * DashboardSummary model — the dashboard home rendering needs a follow-up
   * mapping pass; for now the raw payload is returned (cast).
   */
  getDashboardSummary(businessId: string, range = '30d'): Observable<DashboardSummary> {
    this.isLoading.set(true);
    this.error.set(null);

    const params = new HttpParams().set('range', range);
    return this.http.get<DashboardSummary>(API_ENDPOINTS.DASHBOARD.SUMMARY, { params }).pipe(
      tap((data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set('Failed to load dashboard data');
        return throwError(() => error);
      }),
    );
  }
}
