import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Appointment, CreateAppointmentDto } from '../../shared/models/appointment.model';
import { API_ENDPOINTS, withId } from '../../shared';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);

  /**
   * The new backend lists appointments by date range (business derived from the
   * token). Existing callers expect "all", so we fetch a wide window.
   */
  getBusinessAppointments(businessId: string): Observable<Appointment[]> {
    return this.listRange();
  }

  getUserAppointments(userId: string): Observable<Appointment[]> {
    return this.listRange();
  }

  getTodayAppointments(businessId: string): Observable<Appointment[]> {
    return this.getBusinessAppointments(businessId).pipe(
      map((appointments) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return appointments
          .filter((apt) => {
            const aptDate = new Date(apt.startTime);
            return aptDate >= today && aptDate < tomorrow;
          })
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      }),
    );
  }

  getUpcomingAppointments(businessId: string): Observable<Appointment[]> {
    return this.getBusinessAppointments(businessId).pipe(
      map((appointments) => {
        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return appointments
          .filter((apt) => {
            const aptDate = new Date(apt.startTime);
            return aptDate >= now && aptDate <= weekFromNow;
          })
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      }),
    );
  }

  getAppointmentById(appointmentId: string): Observable<Appointment> {
    return this.http
      .get<any>(API_ENDPOINTS.APPOINTMENTS.BY_ID(appointmentId))
      .pipe(map((a) => this.mapAppointment(a)));
  }

  createAppointment(appointment: CreateAppointmentDto): Observable<Appointment> {
    return this.http
      .post<any>(API_ENDPOINTS.APPOINTMENTS.BASE, this.toPayload(appointment))
      .pipe(map((a) => this.mapAppointment(a)));
  }

  updateAppointment(
    appointmentId: string,
    appointmentData: Partial<CreateAppointmentDto>,
  ): Observable<Appointment> {
    return this.http
      .patch<any>(API_ENDPOINTS.APPOINTMENTS.BY_ID(appointmentId), this.toPayload(appointmentData))
      .pipe(map((a) => this.mapAppointment(a)));
  }

  deleteAppointment(appointmentId: string, userId: string, businessId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.APPOINTMENTS.BY_ID(appointmentId));
  }

  private listRange(): Observable<Appointment[]> {
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);
    const to = new Date();
    to.setFullYear(to.getFullYear() + 1);
    const params = new HttpParams().set('from', from.toISOString()).set('to', to.toISOString());
    return this.http
      .get<any[]>(API_ENDPOINTS.APPOINTMENTS.BASE, { params })
      .pipe(map((rows) => (rows ?? []).map((a) => this.mapAppointment(a))));
  }

  // Backend uses start/end + invitees + recurrence; the web model uses
  // startTime/endTime + isRecurring/recurringFrequency. Adapt both ways.
  private mapAppointment(a: any): Appointment {
    const mapped = withId(a) as any;
    mapped.startTime = a.start ?? a.startTime;
    mapped.endTime = a.end ?? a.endTime;
    mapped.location = a.location;
    mapped.invitees = a.invitees ?? [];
    mapped.userId = a.createdBy ?? a.userId;
    mapped.status = a.status === 'cancelled' ? 'canceled' : a.status;
    mapped.isRecurring = !!a.recurrence || !!a.isRecurring;
    mapped.recurringFrequency = a.recurrence?.frequency ?? a.recurringFrequency;
    mapped.recurringInterval = a.recurrence?.interval ?? a.recurringInterval;
    mapped.recurringUntil = a.recurrence?.until ?? a.recurringUntil;
    return mapped as Appointment;
  }

  private toPayload(dto: Partial<CreateAppointmentDto>): Record<string, unknown> {
    const d = dto as any;
    const payload: Record<string, unknown> = {};
    if (d.title !== undefined) payload['title'] = d.title;
    if (d.notes !== undefined) payload['notes'] = d.notes;
    if (d.location !== undefined) payload['location'] = d.location;
    const start = d.start ?? d.startTime;
    const end = d.end ?? d.endTime;
    if (start) payload['start'] = new Date(start).toISOString();
    if (end) payload['end'] = new Date(end).toISOString();
    if (d.invitees) payload['invitees'] = d.invitees;
    if (d.recurrence) {
      payload['recurrence'] = d.recurrence;
    } else if (d.isRecurring && d.recurringFrequency) {
      payload['recurrence'] = {
        frequency: d.recurringFrequency,
        interval: d.recurringInterval ?? 1,
        until: d.recurringUntil,
      };
    }
    return payload;
  }
}
