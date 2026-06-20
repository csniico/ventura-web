import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { API_ENDPOINTS, withId } from '../../shared';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  getUserById(userId: string): Observable<User> {
    return this.http.get<any>(API_ENDPOINTS.USERS.BY_ID(userId)).pipe(map((u) => withId(u) as User));
  }

  updateUserProfile(userId: string, profileData: Partial<User>): Observable<User> {
    const { firstName, lastName } = profileData;
    return this.http
      .patch<any>(API_ENDPOINTS.USERS.BY_ID(userId), { firstName, lastName })
      .pipe(map((u) => withId(u) as User));
  }

  updateAvatar(userId: string, avatarUrl?: string, avatarKey?: string): Observable<User> {
    return this.http
      .patch<any>(API_ENDPOINTS.USERS.AVATAR(userId), { avatarUrl, avatarKey })
      .pipe(map((u) => withId(u) as User));
  }

  changePassword(userId: string, data: { oldPassword: string; newPassword: string }): Observable<void> {
    return this.http.post<void>(`/users/${userId}/change-password`, data);
  }

  resetPassword(userId: string, data: { newPassword: string }): Observable<void> {
    return this.http.post<void>(`/users/${userId}/reset-password`, data);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.USERS.BY_ID(userId));
  }
}
