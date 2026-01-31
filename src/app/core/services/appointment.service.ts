import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Appointment, CreateAppointmentDto } from '../../shared/models/appointment.model';
import { API_ENDPOINTS } from '../../shared/api.constants';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);

  /**
   * Get all appointments for a business
   */
  getBusinessAppointments(businessId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(API_ENDPOINTS.APPOINTMENTS.BY_BUSINESS(businessId));
  }

  /**
   * Get appointments for a specific user
   */
  getUserAppointments(userId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(API_ENDPOINTS.APPOINTMENTS.BY_USER(userId));
  }

  /**
   * Get today's appointments for a business
   */
  getTodayAppointments(businessId: string): Observable<Appointment[]> {
    return this.getBusinessAppointments(businessId).pipe(
      map(appointments => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return appointments.filter(apt => {
          const aptDate = new Date(apt.startTime);
          return aptDate >= today && aptDate < tomorrow;
        }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      })
    );
  }

  /**
   * Get upcoming appointments (next 7 days) for a business
   */
  getUpcomingAppointments(businessId: string): Observable<Appointment[]> {
    return this.getBusinessAppointments(businessId).pipe(
      map(appointments => {
        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        return appointments.filter(apt => {
          const aptDate = new Date(apt.startTime);
          return aptDate >= now && aptDate <= weekFromNow;
        }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      })
    );
  }

  /**
   * Get a single appointment by ID
   */
  getAppointmentById(appointmentId: string): Observable<Appointment> {
    return this.http.get<Appointment>(API_ENDPOINTS.APPOINTMENTS.BY_ID(appointmentId));
  }

  /**
   * Create a new appointment
   */
  createAppointment(appointment: CreateAppointmentDto): Observable<Appointment> {
    return this.http.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.BASE, appointment);
  }

  /**
   * Update an existing appointment
   */
  updateAppointment(appointmentId: string, appointmentData: Partial<CreateAppointmentDto>): Observable<Appointment> {
    return this.http.put<Appointment>(API_ENDPOINTS.APPOINTMENTS.BY_ID(appointmentId), appointmentData);
  }

  /**
   * Delete an appointment
   * Backend requires userId and businessId in request body for authorization
   */
  deleteAppointment(appointmentId: string, userId: string, businessId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.APPOINTMENTS.BY_ID(appointmentId), {
      body: { userId, businessId }
    });
  }
}
