import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarStateService, ViewMode } from '../../../../services/calendar-state.service';

@Component({
  selector: 'app-calendar-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-header.component.html'
})
export class CalendarHeaderComponent {
  private readonly calendarState = inject(CalendarStateService);

  protected readonly currentDate = this.calendarState.currentDate;
  protected readonly viewMode = this.calendarState.viewMode;
  protected readonly monthYearLabel = this.calendarState.monthYearLabel;

  protected navigatePrev(): void {
    this.calendarState.navigate('prev');
  }

  protected navigateNext(): void {
    this.calendarState.navigate('next');
  }

  protected goToToday(): void {
    this.calendarState.navigateToToday();
  }

  protected setViewMode(mode: ViewMode): void {
    this.calendarState.setViewMode(mode);
  }

  protected openNewAppointment(): void {
    this.calendarState.openCreateModal();
  }
}
