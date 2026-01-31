import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarStateService } from '../../../../services/calendar-state.service';
import { CalendarDayCellComponent } from '../calendar-day-cell/calendar-day-cell.component';
import { Appointment } from '../../../../../../shared/models/appointment.model';

@Component({
  selector: 'app-calendar-grid',
  standalone: true,
  imports: [CommonModule, CalendarDayCellComponent],
  templateUrl: './calendar-grid.component.html'
})
export class CalendarGridComponent {
  private readonly calendarState = inject(CalendarStateService);

  @Output() dayClick = new EventEmitter<Date>();
  @Output() appointmentClick = new EventEmitter<Appointment>();

  protected readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  protected readonly monthDays = this.calendarState.monthDays;

  protected onDayClick(date: Date): void {
    this.dayClick.emit(date);
  }

  protected onAppointmentClick(appointment: Appointment): void {
    this.appointmentClick.emit(appointment);
  }
}
