import { Component, inject, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarStateService } from '../../../../services/calendar-state.service';
import { Appointment } from '../../../../../../shared/models/appointment.model';

interface HourSlot {
  hour: number;
  label: string;
}

@Component({
  selector: 'app-calendar-day-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-day-view.component.html'
})
export class CalendarDayViewComponent {
  @Output() timeSlotClick = new EventEmitter<Date>();
  @Output() appointmentClick = new EventEmitter<Appointment>();

  private readonly calendarState = inject(CalendarStateService);

  protected readonly hours: HourSlot[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: this.formatHour(i)
  }));

  protected readonly currentDate = this.calendarState.currentDate;
  protected readonly appointmentsMap = this.calendarState.appointmentsMap;

  protected readonly dayLabel = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  });

  protected readonly isToday = computed(() => {
    const current = this.currentDate();
    const today = new Date();
    return current.toDateString() === today.toDateString();
  });

  protected readonly dayAppointments = computed(() => {
    const dateKey = this.formatDateKey(this.currentDate());
    return this.appointmentsMap().get(dateKey) || [];
  });

  protected getAppointmentsForHour(hour: number): Appointment[] {
    return this.dayAppointments().filter(apt => {
      const aptHour = new Date(apt.startTime).getHours();
      return aptHour === hour;
    });
  }

  protected getAppointmentStyle(appointment: Appointment): { top: string; height: string } {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);

    const startMinutes = start.getMinutes();
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const top = `${(startMinutes / 60) * 100}%`;
    const height = `${Math.max((durationMinutes / 60) * 64, 24)}px`; // min 24px height

    return { top, height };
  }

  protected onTimeSlotClick(hour: number): void {
    const date = new Date(this.currentDate());
    date.setHours(hour, 0, 0, 0);
    this.timeSlotClick.emit(date);
  }

  protected onAppointmentClick(event: Event, appointment: Appointment): void {
    event.stopPropagation();
    this.appointmentClick.emit(appointment);
  }

  protected getAppointmentColor(appointment: Appointment): string {
    const colors = [
      'bg-blue-100 border-blue-400 text-blue-800',
      'bg-green-100 border-green-400 text-green-800',
      'bg-purple-100 border-purple-400 text-purple-800',
      'bg-amber-100 border-amber-400 text-amber-800',
      'bg-pink-100 border-pink-400 text-pink-800'
    ];

    const hash = appointment.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  protected formatTime(dateInput: Date | string): string {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  protected formatTimeRange(start: Date | string, end: Date | string): string {
    return `${this.formatTime(start)} - ${this.formatTime(end)}`;
  }

  private formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  }

  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
