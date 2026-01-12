import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { API_ENDPOINTS } from '../../shared/api.constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(API_ENDPOINTS.USERS.BY_ID(userId));
  }

  updateUserProfile(userId: string, profileData: Partial<User>): Observable<User> {
    return this.http.patch<User>(API_ENDPOINTS.USERS.PROFILE(userId), profileData);
  }
}