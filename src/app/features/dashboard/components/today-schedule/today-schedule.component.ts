import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Appointment } from '../../../../shared/models/appointment.model';

@Component({
  selector: 'app-today-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './today-schedule.component.html'
})
export class TodayScheduleComponent {
  @Input() appointments: Appointment[] = [];
  @Input() isLoading: boolean = false;
  @Output() appointmentClick = new EventEmitter<Appointment>();

  protected onAppointmentClick(appointment: Appointment): void {
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

  protected getStatusColor(appointment: Appointment): string {
    const now = new Date();
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);

    if (now >= start && now <= end) {
      return 'bg-green-500'; // In progress
    } else if (now > end) {
      return 'bg-gray-300'; // Completed
    } else {
      return 'bg-blue-500'; // Upcoming
    }
  }
}
