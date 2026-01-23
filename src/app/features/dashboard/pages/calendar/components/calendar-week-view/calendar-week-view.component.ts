import { Component, inject, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarStateService } from '../../../../services/calendar-state.service';
import { Appointment } from '../../../../../../shared/models/appointment.model';

interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
}

interface HourSlot {
  hour: number;
  label: string;
}

@Component({
  selector: 'app-calendar-week-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-week-view.component.html'
})
export class CalendarWeekViewComponent {
  @Output() dayClick = new EventEmitter<Date>();
  @Output() appointmentClick = new EventEmitter<Appointment>();

  private readonly calendarState = inject(CalendarStateService);

  protected readonly hours: HourSlot[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: this.formatHour(i)
  }));

  protected readonly weekDays = computed(() => this.generateWeekDays());

  protected readonly appointmentsMap = this.calendarState.appointmentsMap;

  private generateWeekDays(): WeekDay[] {
    const currentDate = this.calendarState.currentDate();
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: WeekDay[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      days.push({
        date,
        dayName: dayNames[i],
        dayNumber: date.getDate(),
        isToday: dateOnly.getTime() === today.getTime()
      });
    }

    return days;
  }

  protected getAppointmentsForDay(date: Date): Appointment[] {
    const dateKey = this.formatDateKey(date);
    return this.appointmentsMap().get(dateKey) || [];
  }

  protected getAppointmentsForHour(date: Date, hour: number): Appointment[] {
    const appointments = this.getAppointmentsForDay(date);
    return appointments.filter(apt => {
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
    const height = `${Math.max((durationMinutes / 60) * 48, 20)}px`; // min 20px height

    return { top, height };
  }

  protected onDayClick(date: Date, hour?: number): void {
    const clickDate = new Date(date);
    if (hour !== undefined) {
      clickDate.setHours(hour, 0, 0, 0);
    }
    this.dayClick.emit(clickDate);
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

    // Use a hash of the appointment ID to consistently pick a color
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
