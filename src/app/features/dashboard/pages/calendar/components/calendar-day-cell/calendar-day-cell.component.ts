import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDay } from '../../../../services/calendar-state.service';
import { Appointment } from '../../../../../../shared/models/appointment.model';

@Component({
  selector: 'app-calendar-day-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-day-cell.component.html'
})
export class CalendarDayCellComponent {
  @Input({ required: true }) day!: CalendarDay;
  @Output() dayClick = new EventEmitter<Date>();
  @Output() appointmentClick = new EventEmitter<Appointment>();

  protected get dayNumber(): number {
    return this.day.date.getDate();
  }

  protected get visibleAppointments(): Appointment[] {
    return this.day.appointments.slice(0, 3);
  }

  protected get remainingCount(): number {
    return Math.max(0, this.day.appointments.length - 3);
  }

  protected onDayClick(event: MouseEvent): void {
    // Only trigger if clicking on the cell itself, not an appointment
    if ((event.target as HTMLElement).closest('.appointment-pill')) {
      return;
    }
    this.dayClick.emit(this.day.date);
  }

  protected onAppointmentClick(appointment: Appointment, event: MouseEvent): void {
    event.stopPropagation();
    this.appointmentClick.emit(appointment);
  }

  protected formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}
