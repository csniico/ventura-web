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
import { TodayScheduleComponent } from '../components/today-schedule/today-schedule.component';
import { QuickActionsComponent } from '../components/quick-actions/quick-actions.component';
import { AppointmentModalComponent } from '../components/appointment-modal/appointment-modal.component';
import { DeleteConfirmationModalComponent } from '../components/delete-confirmation-modal/delete-confirmation-modal.component';

interface ChartBar {
  date: string;
  amount: number;
  heightPct: number;
}

type ChartRange = '7d' | '30d';

/**
 * Dashboard home — mirrors the mobile app's layout: a total-revenue headline
 * with trend, a revenue bar chart and an earnings-over-time line chart (with a
 * 7d/30d toggle), inventory status, recent invoices, today's schedule and
 * quick actions. Fed by GET /dashboard/summary.
 */
@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
  protected chartLoading = signal(false);
  protected range = signal<ChartRange>('7d');
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

  protected currentDate = computed(() =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  );

  protected trend = computed(() => {
    const pct = this.summary()?.revenue.trendPercent ?? null;
    if (pct === null || pct === undefined) return null;
    return { up: pct >= 0, percent: Math.abs(pct) };
  });

  // The backend returns only days that had revenue, so fill the full window
  // (7 or 30 days ending today) with zeros for missing days — that way every
  // day in the range gets a slot in the charts.
  protected dailySeries = computed<{ date: string; amount: number }[]>(() => {
    const days = this.range() === '7d' ? 7 : 30;
    const raw = this.summary()?.dailyRevenue ?? [];
    const byDate = new Map(raw.map((p) => [p.date.slice(0, 10), p.amount]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const out: { date: string; amount: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = this.dateKey(d);
      out.push({ date: key, amount: byDate.get(key) ?? 0 });
    }
    return out;
  });

  // Daily-revenue series → bar heights (% of the max).
  protected chartBars = computed<ChartBar[]>(() => {
    const series = this.dailySeries();
    const max = series.reduce((m, p) => Math.max(m, p.amount), 0);
    return series.map((p) => ({
      date: p.date,
      amount: p.amount,
      heightPct: p.amount > 0 && max > 0 ? Math.max(3, Math.round((p.amount / max) * 100)) : 0,
    }));
  });

  protected hasChart = computed(() => this.dailySeries().some((b) => b.amount > 0));

  // Cumulative earnings → an SVG polyline (viewBox 0..100, non-scaling stroke).
  protected linePoints = computed<string>(() => {
    const series = this.dailySeries();
    if (series.length < 2) return '';
    let cumulative = 0;
    const totals = series.map((p) => (cumulative += p.amount));
    const max = Math.max(...totals, 1);
    const n = totals.length;
    return totals
      .map((v, i) => {
        const x = (i / (n - 1)) * 100;
        const y = 100 - (v / max) * 100;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  });

  private dateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected setRange(range: ChartRange): void {
    if (this.range() === range) return;
    this.range.set(range);
    this.reloadSummary();
  }

  private get businessId(): string | undefined {
    return this.businessService.business()?.id || this.authService.user()?.businessId;
  }

  private loadDashboardData(): void {
    const businessId = this.businessId;
    if (!businessId) {
      this.isLoading.set(false);
      return;
    }
    forkJoin({
      summary: this.dashboardService
        .getDashboardSummary(businessId, this.range())
        .pipe(catchError(() => of(null))),
      todayAppts: this.appointmentService.getTodayAppointments(businessId).pipe(catchError(() => of([]))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.summary.set(data.summary);
          this.todayAppointments.set(data.todayAppts);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  private reloadSummary(): void {
    const businessId = this.businessId;
    if (!businessId) return;
    this.chartLoading.set(true);
    this.dashboardService
      .getDashboardSummary(businessId, this.range())
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((s) => {
        if (s) this.summary.set(s);
        this.chartLoading.set(false);
      });
  }

  /** Format a base-currency (GHS) amount, matching the mobile base display. */
  protected money(amount: number | null | undefined): string {
    const value = amount ?? 0;
    return '₵' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  protected statusClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700';
      case 'PARTIALLY_PAID':
        return 'bg-amber-50 text-amber-700';
      case 'SENT':
        return 'bg-blue-50 text-blue-700';
      case 'OVERDUE':
        return 'bg-red-50 text-red-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  protected statusLabel(status: string): string {
    return (status || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  protected shortDate(date: string): string {
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
