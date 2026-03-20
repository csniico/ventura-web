import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../shared/api.constants';
import {
  AuditLog,
  AuditAction,
  AuditEntityType,
} from '../models/audit.model';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly http = inject(HttpClient);

  getEntityLogs(entity: AuditEntityType, entityId: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(
      API_ENDPOINTS.AUDIT.BY_ENTITY(entity, entityId)
    );
  }

  getUserLogs(userId: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(
      API_ENDPOINTS.AUDIT.BY_USER(userId)
    );
  }

  getActionLogs(action: AuditAction): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(
      API_ENDPOINTS.AUDIT.BY_ACTION(action)
    );
  }
}
