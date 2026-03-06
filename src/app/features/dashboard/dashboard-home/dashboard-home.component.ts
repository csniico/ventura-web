import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, catchError, of, forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { BusinessService } from '../../../core/services/business.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { CalendarStateService } from '../services/calendar-state.service';
import { DashboardSummary } from '../../../shared/models/dashboard.model';
import { Appointment } from '../../../shared/models/appointment.model';
import { FinancialCardsComponent } from '../components/financial-cards/financial-cards.component';
import { AlertsSectionComponent } from '../components/alerts-section/alerts-section.component';
import { TopPerformersComponent } from '../components/top-performers/top-performers.component';
import { ActivityFeedComponent } from '../components/activity-feed/activity-feed.component';
import { StatCardComponent } from '../components/stat-card/stat-card.component';
import { TodayScheduleComponent } from '../components/today-schedule/today-schedule.component';
import { QuickActionsComponent } from '../components/quick-actions/quick-actions.component';
import { AppointmentModalComponent } from '../components/appointment-modal/appointment-modal.component';
import { DeleteConfirmationModalComponent } from '../components/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FinancialCardsComponent,
    AlertsSectionComponent,
    TopPerformersComponent,
    ActivityFeedComponent,
    StatCardComponent,
    TodayScheduleComponent,
    QuickActionsComponent,
    AppointmentModalComponent,
    DeleteConfirmationModalComponent,
  ],
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly dashboardService = inject(DashboardService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly calendarState = inject(CalendarStateService);
  private readonly destroy$ = new Subject<void>();

  protected isLoading = signal(true);
  protected summary = signal<DashboardSummary | null>(null);
  protected todayAppointments = signal<Appointment[]>([]);

  protected business = computed(() => this.businessService.business());
  protected user = computed(() => this.authService.user());

  protected greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  protected currentDate = computed(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    const business = this.businessService.business();
    const businessId = business?.id || this.authService.user()?.businessId;

    if (!businessId) {
      this.isLoading.set(false);
      return;
    }

    forkJoin({
      summary: this.dashboardService.getDashboardSummary(businessId).pipe(
        catchError(() => of(null))
      ),
      todayAppts: this.appointmentService.getTodayAppointments(businessId).pipe(
        catchError(() => of([]))
      ),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.summary.set(data.summary);
          this.todayAppointments.set(data.todayAppts);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  protected onQuickAction(action: string): void {
    if (action === 'appointment') {
      this.calendarState.openCreateModal();
    }
  }

  protected onAppointmentClick(appointment: Appointment): void {
    this.calendarState.openEditModal(appointment);
  }
}
