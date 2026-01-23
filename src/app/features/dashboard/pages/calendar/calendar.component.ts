import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CalendarStateService } from '../../services/calendar-state.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../../core/services/business.service';
import { CalendarHeaderComponent } from './components/calendar-header/calendar-header.component';
import { CalendarGridComponent } from './components/calendar-grid/calendar-grid.component';
import { CalendarWeekViewComponent } from './components/calendar-week-view/calendar-week-view.component';
import { CalendarDayViewComponent } from './components/calendar-day-view/calendar-day-view.component';
import { AppointmentModalComponent } from '../../components/appointment-modal/appointment-modal.component';
import { DeleteConfirmationModalComponent } from '../../components/delete-confirmation-modal/delete-confirmation-modal.component';
import { Appointment } from '../../../../shared/models/appointment.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarHeaderComponent,
    CalendarGridComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
    AppointmentModalComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './calendar.component.html'
})
export class CalendarComponent implements OnInit, OnDestroy {
  private readonly calendarState = inject(CalendarStateService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly destroy$ = new Subject<void>();

  protected readonly viewMode = this.calendarState.viewMode;
  protected readonly isLoading = this.calendarState.isLoading;

  ngOnInit(): void {
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAppointments(): void {
    const business = this.businessService.business();
    const businessId = business?.id || this.authService.user()?.businessId;

    if (!businessId) {
      this.calendarState.isLoading.set(false);
      return;
    }

    this.calendarState.isLoading.set(true);

    this.appointmentService.getBusinessAppointments(businessId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.calendarState.setAppointments(appointments);
          this.calendarState.isLoading.set(false);
        },
        error: () => {
          this.calendarState.isLoading.set(false);
        }
      });
  }

  protected onDayClick(date: Date): void {
    this.calendarState.openCreateModal(date);
  }

  protected onAppointmentClick(appointment: Appointment): void {
    this.calendarState.openEditModal(appointment);
  }
}
