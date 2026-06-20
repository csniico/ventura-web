import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, switchMap, catchError, throwError } from 'rxjs';
import { Business, CreateBusinessDto } from '../../shared/models/business.model';
import { API_ENDPOINTS, withId } from '../../shared';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // Business state
  readonly business = signal<Business | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /** The authenticated user's business: GET /businesses/mine. */
  fetchOwnerBusiness(): Observable<Business> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.get<any>(API_ENDPOINTS.BUSINESSES.MINE).pipe(
      map((b) => withId(b) as Business),
      tap((business) => {
        this.business.set(business);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set('Failed to fetch business data');
        return throwError(() => error);
      }),
    );
  }

  /** Get a business by id: GET /businesses/{id}. */
  fetchBusinessById(businessId: string): Observable<Business> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.get<any>(API_ENDPOINTS.BUSINESSES.BY_ID(businessId)).pipe(
      map((b) => withId(b) as Business),
      tap((business) => {
        this.business.set(business);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set('Failed to fetch business data');
        return throwError(() => error);
      }),
    );
  }

  /** Suggested business categories: GET /businesses/categories. */
  fetchCategories(): Observable<string[]> {
    return this.http
      .get<string[]>(API_ENDPOINTS.BUSINESSES.CATEGORIES)
      .pipe(catchError(() => of([])));
  }

  /**
   * Create a business. The backend's POST only accepts { name, categories };
   * any other fields the caller supplied are applied with a follow-up PATCH.
   */
  createBusiness(businessData: CreateBusinessDto): Observable<Business> {
    this.isLoading.set(true);
    this.error.set(null);

    const createPayload = {
      name: businessData.name,
      categories: businessData.categories ?? [],
    };
    const extras = this.extraFields(businessData);

    return this.http.post<any>(API_ENDPOINTS.BUSINESSES.BASE, createPayload).pipe(
      map((b) => withId(b) as Business),
      switchMap((created) =>
        Object.keys(extras).length
          ? this.http
              .patch<any>(API_ENDPOINTS.BUSINESSES.BY_ID(created.id), extras)
              .pipe(map((b) => withId(b) as Business))
          : of(created),
      ),
      tap((business) => {
        this.business.set(business);
        this.isLoading.set(false);
        // Reflect the new business on the cached user so guards/routing work.
        this.auth.updateCachedUser({ businessId: business.id });
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set('Failed to create business');
        return throwError(() => error);
      }),
    );
  }

  /** Update a business: PATCH /businesses/{id}. */
  updateBusiness(id: string, businessData: Partial<CreateBusinessDto>): Observable<Business> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.patch<any>(API_ENDPOINTS.BUSINESSES.BY_ID(id), businessData).pipe(
      map((b) => withId(b) as Business),
      tap((business) => {
        this.business.set(business);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set('Failed to update business');
        return throwError(() => error);
      }),
    );
  }

  getCurrentBusiness(): Business | null {
    return this.business();
  }

  clearBusiness(): void {
    this.business.set(null);
    this.error.set(null);
  }

  // Everything except name/categories/ownerId, with undefined values dropped —
  // these go in the follow-up PATCH (the API rejects unknown/owner props).
  private extraFields(data: CreateBusinessDto): Record<string, unknown> {
    const { name, categories, ownerId, ...rest } = data;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined && value !== null && value !== '') {
        out[key] = value;
      }
    }
    return out;
  }
}
