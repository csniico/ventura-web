import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateBusinessDto, Business } from '../../../shared/models/business.model';
import { API_ENDPOINTS } from '../../../shared/api.constants';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private http = inject(HttpClient);

  createBusiness(businessData: CreateBusinessDto): Observable<Business> {
    return this.http.post<Business>(API_ENDPOINTS.BUSINESSES.BASE, businessData);
  }

  getBusinessById(id: string): Observable<Business> {
    return this.http.get<Business>(API_ENDPOINTS.BUSINESSES.BY_ID(id));
  }

  updateBusiness(id: string, businessData: Partial<CreateBusinessDto>): Observable<Business> {
    return this.http.put<Business>(API_ENDPOINTS.BUSINESSES.BY_ID(id), businessData);
  }
}