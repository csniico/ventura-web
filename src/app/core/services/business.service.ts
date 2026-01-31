import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Business, CreateBusinessDto } from '../../shared/models/business.model';
import { API_ENDPOINTS } from '../../shared/api.constants';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private http = inject(HttpClient);

  // Business state
  readonly business = signal<Business | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Fetch the current user's business
   * Uses the new query parameter: GET /businesses/?search=owner
   */
  fetchOwnerBusiness(): Observable<Business> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<Business>(API_ENDPOINTS.BUSINESSES.BY_OWNER).pipe(
      tap((business) => {
        this.business.set(business);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set('Failed to fetch business data');
        return throwError(() => error);
      })
    );
  }

  /**
   * Fetch a business by its ID
   * Uses: GET /businesses/?search=business&businessId={id}
   */
  fetchBusinessById(businessId: string): Observable<Business> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<Business>(API_ENDPOINTS.BUSINESSES.BY_BUSINESS_ID(businessId)).pipe(
      tap((business) => {
        this.business.set(business);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set('Failed to fetch business data');
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new business
   */
  createBusiness(businessData: CreateBusinessDto): Observable<Business> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<Business>(API_ENDPOINTS.BUSINESSES.BASE, businessData).pipe(
      tap((business) => {
        this.business.set(business);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set('Failed to create business');
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing business
   */
  updateBusiness(id: string, businessData: Partial<CreateBusinessDto>): Observable<Business> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.put<Business>(API_ENDPOINTS.BUSINESSES.BY_ID(id), businessData).pipe(
      tap((business) => {
        this.business.set(business);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set('Failed to update business');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current business from signal
   */
  getCurrentBusiness(): Business | null {
    return this.business();
  }

  /**
   * Clear business state
   */
  clearBusiness(): void {
    this.business.set(null);
    this.error.set(null);
  }
}
