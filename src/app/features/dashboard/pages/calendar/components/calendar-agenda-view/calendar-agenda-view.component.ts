import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarStateService } from '../../../../services/calendar-state.service';
import {
  Appointment,
  AppointmentStatus,
} from '../../../../../../shared/models/appointment.model';

interface AgendaGroup {
  key: string;
  label: string;
  appointments: Appointment[];
}

/**
 * A chronological list ("agenda") of appointments grouped by day. Gives the
 * desktop the same list view the mobile app has, alongside month/week/day.
 */
@Component({
  selector: 'app-calendar-agenda-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-agenda-view.component.html',
})
export class CalendarAgendaViewComponent {
  @Output() appointmentClick = new EventEmitter<Appointment>();
  @Output() createAppointment = new EventEmitter<void>();

  private readonly calendarState = inject(CalendarStateService);
  protected readonly AppointmentStatus = AppointmentStatus;

  /** Every appointment, soonest first, grouped by day. */
  protected readonly groups = computed<AgendaGroup[]>(() => {
    const sorted = [...this.calendarState.appointments()].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
    const map = new Map<string, AgendaGroup>();
    for (const apt of sorted) {
      const day = new Date(apt.startTime);
      const key = day.toDateString();
      if (!map.has(key)) {
        map.set(key, { key, label: this.dayLabel(day), appointments: [] });
      }
      map.get(key)!.appointments.push(apt);
    }
    return [...map.values()];
  });

  protected onAppointmentClick(appointment: Appointment): void {
    this.appointmentClick.emit(appointment);
  }

  protected statusClasses(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return 'bg-green-50 text-green-700';
      case AppointmentStatus.CANCELED:
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  }

  protected formatTimeRange(start: Date | string, end: Date | string): string {
    return `${this.formatTime(start)} - ${this.formatTime(end)}`;
  }

  protected formatTime(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  private dayLabel(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }
}
